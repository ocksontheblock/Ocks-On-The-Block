import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthSession {
  user: User;
  loginTime: number;
  lastActivity: number;
  expiresAt: number;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session configuration
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours of inactivity
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Create a new session
  const createSession = (user: User): AuthSession => {
    const now = Date.now();
    return {
      user,
      loginTime: now,
      lastActivity: now,
      expiresAt: now + SESSION_DURATION,
    };
  };

  // Check if session is valid
  const isSessionValid = (session: AuthSession): boolean => {
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    
    // Check if session has expired or user has been inactive too long
    return now < session.expiresAt && timeSinceActivity < INACTIVITY_TIMEOUT;
  };

  // Refresh session activity
  const refreshSession = useCallback(() => {
    const storedSession = localStorage.getItem("authSession");
    if (storedSession) {
      try {
        const session: AuthSession = JSON.parse(storedSession);
        if (isSessionValid(session)) {
          // Update last activity
          session.lastActivity = Date.now();
          localStorage.setItem("authSession", JSON.stringify(session));
        } else {
          // Session expired, log out
          logout();
        }
      } catch (error) {
        console.error("Error refreshing session:", error);
        logout();
      }
    }
  }, []);

  // Login function
  const login = useCallback((user: User) => {
    const session = createSession(user);
    setUser(user);
    localStorage.setItem("authSession", JSON.stringify(session));
    
    // Start session monitoring
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
    }
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    setSessionCheckInterval(interval);
  }, [sessionCheckInterval]);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("authSession");
    localStorage.removeItem("user"); // Remove old format if exists
    
    // Clear session monitoring
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      setSessionCheckInterval(null);
    }
  }, [sessionCheckInterval]);

  // Check session validity
  const checkSession = useCallback(() => {
    const storedSession = localStorage.getItem("authSession");
    if (storedSession) {
      try {
        const session: AuthSession = JSON.parse(storedSession);
        if (!isSessionValid(session)) {
          console.log("Session expired, logging out");
          logout();
        }
      } catch (error) {
        console.error("Error checking session:", error);
        logout();
      }
    }
  }, [logout]);

  // Initialize authentication state on app startup
  useEffect(() => {
    const initializeAuth = () => {
      const storedSession = localStorage.getItem("authSession");
      
      // Check for new session format first
      if (storedSession) {
        try {
          const session: AuthSession = JSON.parse(storedSession);
          if (isSessionValid(session)) {
            setUser(session.user);
            // Refresh activity timestamp
            session.lastActivity = Date.now();
            localStorage.setItem("authSession", JSON.stringify(session));
            
            // Start session monitoring
            const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
            setSessionCheckInterval(interval);
          } else {
            // Session expired
            localStorage.removeItem("authSession");
          }
        } catch (error) {
          console.error("Error parsing stored session:", error);
          localStorage.removeItem("authSession");
        }
      } else {
        // Check for old format and migrate
        const oldStoredUser = localStorage.getItem("user");
        if (oldStoredUser) {
          try {
            const user: User = JSON.parse(oldStoredUser);
            // Create new session for existing user
            login(user);
            localStorage.removeItem("user"); // Remove old format
          } catch (error) {
            localStorage.removeItem("user");
          }
        }
      }
    };

    initializeAuth();

    // Activity tracking - refresh session on user interaction
    const handleUserActivity = () => {
      if (user) {
        refreshSession();
      }
    };

    // Listen for user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Cleanup
    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, []);

  // Handle page visibility changes (tab switching, minimizing)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Page became visible again, check session
        checkSession();
        refreshSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, checkSession, refreshSession]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
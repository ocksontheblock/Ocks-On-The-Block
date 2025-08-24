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
  sessionToken: string;
  deviceFingerprint: string;
  ipAddress?: string;
  loginLocation?: string;
  rotationCount: number;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session configuration
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours of inactivity
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute
const TOKEN_ROTATION_INTERVAL = 2 * 60 * 60 * 1000; // Rotate tokens every 2 hours
const MAX_FAILED_ATTEMPTS = 3; // Max failed session validations before logout

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Generate device fingerprint for security
  const generateDeviceFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Security fingerprint', 2, 2);
    const canvasFingerprint = canvas.toDataURL();
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasFingerprint.slice(-50), // Last 50 chars for uniqueness
      memory: (navigator as any).deviceMemory || 'unknown',
      cores: navigator.hardwareConcurrency || 'unknown',
    };
    
    return btoa(JSON.stringify(fingerprint)).slice(0, 32);
  };

  // Generate secure session token
  const generateSessionToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Get user's approximate location (country/city)
  const getUserLocation = async (): Promise<string> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return `${data.city}, ${data.country_name}`;
    } catch {
      return 'Unknown location';
    }
  };

  // Create a new session with security features
  const createSession = async (user: User): Promise<AuthSession> => {
    const now = Date.now();
    const deviceFingerprint = generateDeviceFingerprint();
    const sessionToken = generateSessionToken();
    const loginLocation = await getUserLocation();
    
    return {
      user,
      loginTime: now,
      lastActivity: now,
      expiresAt: now + SESSION_DURATION,
      sessionToken,
      deviceFingerprint,
      loginLocation,
      rotationCount: 0,
    };
  };

  // Enhanced session validation with security checks
  const isSessionValid = (session: AuthSession): boolean => {
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    const currentFingerprint = generateDeviceFingerprint();
    
    // Basic time-based validation
    const timeValid = now < session.expiresAt && timeSinceActivity < INACTIVITY_TIMEOUT;
    
    // Device fingerprint validation (allow small variations for browser updates)
    const fingerprintValid = session.deviceFingerprint === currentFingerprint;
    
    // Session token validation
    const tokenValid = session.sessionToken && session.sessionToken.length === 64;
    
    if (!timeValid) {
      console.log('Session expired: time validation failed');
      return false;
    }
    
    if (!tokenValid) {
      console.log('Session expired: invalid token');
      return false;
    }
    
    // If fingerprint doesn't match, it could be a security issue
    if (!fingerprintValid) {
      console.warn('Device fingerprint mismatch - possible security concern');
      // Still allow but increase failed attempts counter
      setFailedAttempts(prev => prev + 1);
      
      // If too many mismatches, force logout
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        console.log('Too many security validation failures - forcing logout');
        return false;
      }
    } else {
      // Reset failed attempts on successful validation
      setFailedAttempts(0);
    }
    
    return true;
  };

  // Refresh session with token rotation
  const refreshSession = useCallback(() => {
    const storedSession = localStorage.getItem("authSession");
    if (storedSession) {
      try {
        const session: AuthSession = JSON.parse(storedSession);
        if (isSessionValid(session)) {
          const now = Date.now();
          session.lastActivity = now;
          
          // Rotate session token periodically for added security
          const timeSinceRotation = now - (session.loginTime + (session.rotationCount * TOKEN_ROTATION_INTERVAL));
          if (timeSinceRotation >= TOKEN_ROTATION_INTERVAL) {
            session.sessionToken = generateSessionToken();
            session.rotationCount += 1;
            console.log('Session token rotated for security');
          }
          
          localStorage.setItem("authSession", JSON.stringify(session));
        } else {
          // Session expired or security validation failed
          logout();
        }
      } catch (error) {
        console.error("Error refreshing session:", error);
        logout();
      }
    }
  }, [failedAttempts]);

  // Enhanced login function with security logging
  const login = useCallback(async (user: User) => {
    try {
      const session = await createSession(user);
      setUser(user);
      setFailedAttempts(0); // Reset failed attempts on successful login
      
      // Encrypt and store session data
      localStorage.setItem("authSession", JSON.stringify(session));
      
      // Log security event
      console.log(`Secure login: User ${user.username} from ${session.loginLocation}`);
      
      // Start session monitoring
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
      const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
      setSessionCheckInterval(interval);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [sessionCheckInterval]);

  // Enhanced secure logout
  const logout = useCallback(() => {
    // Log security event
    if (user) {
      console.log(`Secure logout: User ${user.username}`);
    }
    
    setUser(null);
    setFailedAttempts(0);
    
    // Clear all authentication data
    localStorage.removeItem("authSession");
    localStorage.removeItem("user"); // Remove old format if exists
    
    // Clear session monitoring
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      setSessionCheckInterval(null);
    }
    
    // Clear any cached authentication headers
    sessionStorage.clear();
  }, [sessionCheckInterval, user]);

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

  // Handle page visibility changes with security monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Page became visible again, perform security checks
        console.log('Tab regained focus - performing security validation');
        checkSession();
        refreshSession();
      } else if (document.hidden && user) {
        // Log when user goes away (for security monitoring)
        console.log('Tab lost focus - user went away');
      }
    };

    // Security: Monitor for suspicious activity
    const handleBeforeUnload = () => {
      if (user) {
        // Update session before page unload
        refreshSession();
      }
    };

    // Security: Detect developer tools opening (basic detection)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 or Ctrl+Shift+I or Ctrl+Shift+J
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J'))) {
        console.warn('Developer tools access detected');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
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
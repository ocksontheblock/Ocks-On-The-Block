import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Simple login function
  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    console.log("User logged in:", user.username);
  };

  // Simple logout function
  const logout = () => {
    console.log("User logged out:", user?.username);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  // Load user from localStorage on startup
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          const user: User = JSON.parse(storedUser);
          // Validate that the user object has required fields and is properly structured
          if (user && typeof user === 'object' && user.id && user.username && user.email) {
            setUser(user);
            console.log("User restored from localStorage:", user.username);
          } else {
            console.log("Invalid user data structure in localStorage, clearing...");
            localStorage.removeItem("user");
          }
        } else if (storedUser) {
          // Clear invalid localStorage entries like "undefined" or "null" strings
          console.log("Clearing malformed localStorage user data");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        // Clear all auth-related localStorage data on error to prevent future issues
        try {
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
          console.log("Cleared corrupted auth data from localStorage");
        } catch (clearError) {
          console.error("Failed to clear localStorage:", clearError);
        }
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };

    // Small delay to ensure localStorage is ready
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  const isAuthenticated = !!user && authChecked;

  // Show loading spinner until auth is checked
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-8 h-8 border-4 border-ock-orange border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
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
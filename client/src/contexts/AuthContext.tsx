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
  };

  // Load user from localStorage on startup
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user: User = JSON.parse(storedUser);
          // Validate that the user object has required fields
          if (user && user.id && user.username && user.email) {
            setUser(user);
            console.log("User restored from localStorage:", user.username);
          } else {
            console.log("Invalid user data in localStorage, clearing...");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
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
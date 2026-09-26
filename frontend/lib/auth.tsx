"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Role = "operator" | "supervisor" | "admin";

export interface User {
  username: string;
  name: string;
  role: Role;
  roleTitle: string;
  avatarText: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  canAccess: (path: string) => boolean;
}

export const USERS_DB: Record<string, { password: string; user: User }> = {
  operator: {
    password: "nusaqc2026",
    user: {
      username: "operator",
      name: "Budi Santoso",
      role: "operator",
      roleTitle: "QC Operator",
      avatarText: "OP",
    },
  },
  supervisor: {
    password: "nusaqc2026",
    user: {
      username: "supervisor",
      name: "Dewi Lestari",
      role: "supervisor",
      roleTitle: "QC Supervisor",
      avatarText: "SP",
    },
  },
  admin: {
    password: "nusaqc2026",
    user: {
      username: "admin",
      name: "Admin NusaQC",
      role: "admin",
      roleTitle: "System Admin",
      avatarText: "AD",
    },
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "nusaqc_auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        if (parsed && parsed.username && parsed.role) {
          setUser(parsed);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error("Failed to load auth state from localStorage:", e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = username.trim().toLowerCase();
    const entry = USERS_DB[trimmedUsername];

    if (!entry || entry.password !== password) {
      return { success: false, error: "Username atau password tidak valid." };
    }

    setUser(entry.user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(entry.user));
    } catch (e) {
      console.error("Failed to save auth state:", e);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to remove auth state:", e);
    }
  };

  const canAccess = (path: string): boolean => {
    if (!user) return false;
    // Operator cannot access /settings
    if (user.role === "operator" && path.startsWith("/settings")) {
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

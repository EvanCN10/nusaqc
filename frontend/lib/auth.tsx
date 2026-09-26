"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Role = "operator" | "supervisor" | "admin";

export interface User {
  username: string;
  email?: string;
  name: string;
  role: Role;
  roleTitle: string;
  avatarText: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; usernameOrEmail: string; password: string; role: Role }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  canAccess: (path: string) => boolean;
}

export const USERS_DB: Record<string, { password: string; user: User }> = {
  operator: {
    password: "nusaqc2026",
    user: {
      username: "operator",
      email: "operator@nusaqc.io",
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
      email: "supervisor@nusaqc.io",
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
      email: "admin@nusaqc.io",
      name: "Admin NusaQC",
      role: "admin",
      roleTitle: "System Admin",
      avatarText: "AD",
    },
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "nusaqc_auth_session";
const REGISTERED_USERS_KEY = "nusaqc_registered_users";

function getRoleTitle(role: Role): string {
  switch (role) {
    case "operator":
      return "QC Operator";
    case "supervisor":
      return "QC Supervisor";
    case "admin":
      return "System Admin";
    default:
      return "QC Specialist";
  }
}

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "QC";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customUsers, setCustomUsers] = useState<Record<string, { password: string; user: User }>>({});

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(REGISTERED_USERS_KEY);
      if (storedUsers) {
        setCustomUsers(JSON.parse(storedUsers));
      }

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

  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const query = usernameOrEmail.trim().toLowerCase();

    let entry = USERS_DB[query];

    if (!entry) {
      const match = Object.values(USERS_DB).find(
        (item) => item.user.email?.toLowerCase() === query
      );
      if (match) entry = match;
    }

    if (!entry && customUsers[query]) {
      entry = customUsers[query];
    }
    if (!entry) {
      const matchCustom = Object.values(customUsers).find(
        (item) => item.user.email?.toLowerCase() === query
      );
      if (matchCustom) entry = matchCustom;
    }

    if (!entry || entry.password !== password) {
      return { success: false, error: "Invalid credentials. Please verify your username and password." };
    }

    setUser(entry.user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(entry.user));
    } catch (e) {
      console.error("Failed to save auth state:", e);
    }

    return { success: true };
  };

  const register = async ({
    name,
    usernameOrEmail,
    password,
    role,
  }: {
    name: string;
    usernameOrEmail: string;
    password: string;
    role: Role;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanKey = usernameOrEmail.trim().toLowerCase();

    if (!name.trim()) {
      return { success: false, error: "Please provide your full name." };
    }
    if (!cleanKey) {
      return { success: false, error: "Please provide a valid work username or email." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    if (USERS_DB[cleanKey] || customUsers[cleanKey]) {
      return { success: false, error: "An account with this username or email already exists." };
    }

    const newUser: User = {
      username: cleanKey,
      email: cleanKey.includes("@") ? cleanKey : `${cleanKey}@nusaqc.local`,
      name: name.trim(),
      role,
      roleTitle: getRoleTitle(role),
      avatarText: getAvatarInitials(name),
    };

    const updated = {
      ...customUsers,
      [cleanKey]: { password, user: newUser },
    };

    setCustomUsers(updated);
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error("Failed to save newly registered user:", e);
    }

    setUser(newUser);
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
        register,
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

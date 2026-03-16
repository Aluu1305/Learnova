import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "../lib/types";
import { AuthStorage, seedDemoData } from "../lib/storage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: "creator" | "student") => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAdmin: boolean;
  isCreator: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemoData();
    const storedUser = AuthStorage.getCurrentUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = AuthStorage.login(email, password);
    setUser(loggedIn);
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string, role: "creator" | "student" = "student") => {
      const newUser = AuthStorage.register(email, password, fullName, role);
      AuthStorage.setCurrentUser(newUser);
      setUser(newUser);
    },
    []
  );

  const logout = useCallback(() => {
    AuthStorage.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    if (!user) return;
    const updated = AuthStorage.updateProfile(user.id, data);
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin: user?.role === "admin",
        isCreator: user?.role === "creator" || user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { User, AuthResponse, UserRole } from "../types";
import { authService } from "../services/auth.service";
import { supabaseClient } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, fullName: string, role: string) => Promise<AuthResponse>;
  loginWithGoogle: (email: string, fullName: string, idToken?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check 1: FastAPI JWT token (email/password login)
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const userProfile = await authService.getMe();
          setUser(userProfile);
          setIsLoading(false);
          return;
        } catch (err) {
          console.error("Failed to load user profile on startup", err);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }

      // Check 2: Supabase OAuth session (Google sign-in)
      const supabaseUserStr = localStorage.getItem("supabase_user");
      if (supabaseUserStr) {
        try {
          const supabaseUser = JSON.parse(supabaseUserStr) as {
            id: string;
            email: string;
            full_name: string;
            role: string;
          };
          // Build a compatible User object from the Supabase profile
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email,
            full_name: supabaseUser.full_name,
            role: "Fan" as UserRole,
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setIsLoading(false);
          return;
        } catch (err) {
          console.error("Failed to restore Supabase user session", err);
          localStorage.removeItem("supabase_user");
        }
      }

      setIsLoading(false);
    };
    initializeAuth();
  }, []);


  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setUser(data.user);
      setIsLoading(false);
      // Sync user profile to Supabase
      supabaseClient.upsertUserProfile({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name ?? "",
        role: data.user.role,
      }).catch(console.error);
      return data;
    } catch (err) {
      let errMsg = "Invalid credentials";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.detail || errMsg;
      }
      setError(errMsg);
      setIsLoading(false);
      throw err;
    }
  };

  const register = async (email: string, password: string, fullName: string, role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.register(email, password, fullName, role);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setUser(data.user);
      setIsLoading(false);
      // Sync user profile to Supabase
      supabaseClient.upsertUserProfile({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name ?? "",
        role: data.user.role,
      }).catch(console.error);
      return data;
    } catch (err) {
      let errMsg = "Registration failed";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.detail || errMsg;
      }
      setError(errMsg);
      setIsLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async (email: string, fullName: string, idToken?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.loginWithGoogle(email, fullName, idToken);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setUser(data.user);
      setIsLoading(false);
      // Sync Google user profile to Supabase
      supabaseClient.upsertUserProfile({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name ?? "",
        role: data.user.role,
      }).catch(console.error);
      return data;
    } catch (err) {
      let errMsg = "Google authentication failed";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.detail || errMsg;
      }
      setError(errMsg);
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (err) {
        console.error("Logout request to backend failed", err);
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setIsLoading(false);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

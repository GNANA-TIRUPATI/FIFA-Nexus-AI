import { api } from "@/lib/api";
import { AuthResponse, User } from "../types";

export const authService = {
  /**
   * Register a new user account with credentials and role selection.
   */
  async register(email: string, password: string, fullName: string, role: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      full_name: fullName || null,
      role,
    });
    return response.data;
  },

  /**
   * Log in using email and password.
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Authenticate or register using Google credentials.
   */
  async loginWithGoogle(email: string, fullName: string, idToken?: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/google-login", {
      id_token: idToken || "google-mock-token-12345",
      email,
      full_name: fullName,
    });
    return response.data;
  },

  /**
   * Fetch details of the currently active session user.
   */
  async getMe(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  /**
   * Revoke session on backend.
   */
  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", {
      refresh_token: refreshToken,
    });
  },
};

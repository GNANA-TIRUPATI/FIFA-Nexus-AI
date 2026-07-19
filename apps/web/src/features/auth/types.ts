export type UserRole =
  | "Fan"
  | "Volunteer"
  | "Security Officer"
  | "Medical Team"
  | "Transport Coordinator"
  | "Food Vendor"
  | "Maintenance Staff"
  | "Cleaning Staff"
  | "Administrator"
  | "Tournament Organizer"
  | "Super Admin";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

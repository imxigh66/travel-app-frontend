export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;

  token?: string;
  jwt?: string;
}
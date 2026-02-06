import api from '../../../../shared/api/axios';
import type { LoginCredentials, AuthResponse } from '../../../../entities/auth/model/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const loginUser = async (
  credentials: LoginCredentials
): Promise<{ success: boolean; data?: AuthResponse; error?: string }> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    const apiData = response.data?.data ?? response.data;
    const data = apiData as AuthResponse;

    // Все поля теперь в типе AuthResponse
    const token = data.accessToken || data.token || data.jwt;

    if (!token) {
      console.error('NO TOKEN IN RESPONSE:', response.data);
      return { success: false, error: 'Token not found in login response' };
    }

    localStorage.setItem('authToken', token);
    
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = (error as any).response?.data?.message || 
                        'Login failed. Please check your credentials.';
    
    return { success: false, error: errorMessage };
  }
};
import api from '../../../../shared/api/axios';
import type { RegisterData } from '../../../../entities/auth/model/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface RegisterResponse {
  username: string;
  email: string;
  name: string;
}

export const registerUser = async (
  userData: RegisterData
): Promise<{ success: boolean; data?: RegisterResponse; error?: string }> => {
  try {
    const response = await api.post<ApiResponse<RegisterResponse>>('/auth/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name,
    });
    
    return { success: true, data: response.data.data };
  } catch (error: unknown) {
    const errorMessage = (error as any).response?.data?.message || 
                        (error as any).response?.data?.errors?.[0] ||
                        'Registration failed. Please try again.';
    
    return { success: false, error: errorMessage };
  }
};
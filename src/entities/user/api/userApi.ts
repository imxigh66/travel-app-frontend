import api from '../../../shared/api/axios';
import type { User } from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getCurrentUser = async (): Promise<{ success: boolean; data?: User; error?: string }> => {
  try {
    const response = await api.get<ApiResponse<User>>('/users/me');
    return { 
      success: true, 
      data: response.data.data
    };
  } catch (error: unknown) {
    console.error('Get current user error:', error);
    
    const errorMessage = (error as any).response?.data?.message || 
                        'Failed to fetch user profile';
    return { success: false, error: errorMessage };
  }
};

export const getUserById = async (userId: string): Promise<{ success: boolean; data?: User; error?: string }> => {
  try {
    const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
    return { 
      success: true, 
      data: response.data.data 
    };
  } catch (error: unknown) {
    console.error('Get user by id error:', error);
    
    const errorMessage = (error as any).response?.data?.message || 
                        'User not found';
    return { success: false, error: errorMessage };
  }
};

export const getVisitedCountries = async (userId: number) => {
  const { data } = await api.get(`/users/${userId}/countries`)
  return data.data ?? []
}

export const addVisitedCountry = async (payload: {
  countryCode: string
  city?: string | null
  visitedAt?: string | null
  note?: string | null
}) => {
  const { data } = await api.post('/users/countries', payload)
  return data.data
}

export const removeVisitedCountry = async (countryCode: string) => {
  await api.delete(`/users/countries/${countryCode}`)
}

export const syncCountriesFromTrips = async () => {
  const { data } = await api.post('/users/countries/sync-from-trips')
  return data
}



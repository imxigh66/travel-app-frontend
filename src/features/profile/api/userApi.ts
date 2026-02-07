import api from '../../../shared/api/axios';
import type { User, UpdatePersonalProfileData, UpdateBusinessProfileData } from '../../../entities/user/model/types';

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


export const updatePersonalProfile = async (
  data: UpdatePersonalProfileData
): Promise<{ success: boolean; data?: User; error?: string }> => {
  try {
    console.log('Updating personal profile:', data);
    const response = await api.patch<ApiResponse<User>>('/users/profile', data);  // ✅ правильный URL
    console.log('Personal profile updated:', response.data);
    return { 
      success: true, 
      data: response.data.data
    };
  } catch (error: unknown) {
    console.error('Update personal profile error:', error);
    
    const errorMessage = (error as any).response?.data?.message || 
                        (error as any).response?.data?.error ||
                        'Failed to update profile';
    return { success: false, error: errorMessage };
  }
};


export const updateBusinessProfile = async (
  data: UpdateBusinessProfileData
): Promise<{ success: boolean; data?: User; error?: string }> => {
  try {
    const response = await api.patch<ApiResponse<User>>('/users/business', data);
    return { 
      success: true, 
      data: response.data.data
    };
  } catch (error: unknown) {
    console.error('Update business profile error:', error);
    
    const errorMessage = (error as any).response?.data?.message || 
                        (error as any).response?.data?.error ||
                        'Failed to update business profile';
    return { success: false, error: errorMessage };
  }
};

export const uploadProfilePicture = async (
  file: File
): Promise<{ success: boolean; data?: { fileUrl: string; fileName: string }; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<ApiResponse<{
      fileUrl: string;
      fileName: string;
      fileSize: number;
      contentType: string;
      uploadedAt: string;
    }>>('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data: {
        fileUrl: response.data.data!.fileUrl,
        fileName: response.data.data!.fileName
      }
    };
  } catch (error: unknown) {
    console.error('Upload profile picture error:', error);

    const errorMessage = (error as any).response?.data?.message ||
                        (error as any).response?.data?.error ||
                        'Failed to upload profile picture';
    return { success: false, error: errorMessage };
  }
};
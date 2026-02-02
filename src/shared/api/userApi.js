import api from './axios';

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return { 
      success: true, 
      data: response.data.data  // response.data.data потому что ApiResponse<UserDto>
    };
  } catch (error) {
    console.error('Get current user error:', error);
    const errorMessage = error.response?.data?.message || 
                        'Failed to fetch user profile';
    return { success: false, error: errorMessage };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return { 
      success: true, 
      data: response.data.data 
    };
  } catch (error) {
    console.error('Get user by id error:', error);
    const errorMessage = error.response?.data?.message || 
                        'User not found';
    return { success: false, error: errorMessage };
  }
};
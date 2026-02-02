import api from '../../../../shared/api/axios';

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors?.[0] ||
                        'Registration failed. Please try again.';
    return { success: false, error: errorMessage };
  }
};
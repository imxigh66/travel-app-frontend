import api from '../../../../shared/api/axios';

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    
    // Сохраняем токен и данные пользователя
    const { token, username, email, name } = response.data.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({ username, email, name }));
    
    return { success: true, data: response.data.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        'Login failed. Please check your credentials.';
    return { success: false, error: errorMessage };
  }
};
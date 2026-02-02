import api from '../../../../shared/api/axios';

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    

    // Сохраняем токен и данные пользователя
    const data = response.data?.data ?? response.data;

const token =
  data.token ||
  data.accessToken ||
  data.jwt ||
  response.data?.token ||
  response.data?.accessToken;

if (!token) {
  console.log("NO TOKEN IN RESPONSE:", response.data);
  return { success: false, error: "Token not found in login response" };
}

localStorage.setItem("authToken", token);

    
    return { success: true, data: response.data.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        'Login failed. Please check your credentials.';
    
    return { success: false, error: errorMessage };

    
  }

  
};
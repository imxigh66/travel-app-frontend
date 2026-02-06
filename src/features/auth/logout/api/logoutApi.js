import api from '../../../../shared/api/axios';

export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  await api.post('/auth/logout', { refreshToken });
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
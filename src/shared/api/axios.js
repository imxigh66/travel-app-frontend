import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5114/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');

  console.log("➡️ REQUEST:", config.method?.toUpperCase(), config.baseURL + config.url);
  console.log("TOKEN:", token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("AUTH HEADER:", config.headers.Authorization);

  return config;
});




export default api;
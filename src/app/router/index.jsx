import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import InitPage from '../../pages/InitPage';
import RegisterPage from '../../pages/RegisterPage';
import LoginPage from '../../pages/LoginPage';
import ProfilePage from '../../pages/ProfilePage';

export const router = createBrowserRouter([
  // Публичные страницы (без сайдбара)
  {
    path: '/',
    element: <InitPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Приватные страницы (с сайдбаром)
  {
    element: <MainLayout />,  // Обертка с сайдбаром
    children: [
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/home',
        element: <div style={{color: 'white'}}>Главная (TODO)</div>,
      },
      {
        path: '/feed',
        element: <div style={{color: 'white'}}>Лента (TODO)</div>,
      },
      {
        path: '/messages',
        element: <div style={{color: 'white'}}>Сообщения (TODO)</div>,
      },
      {
        path: '/trips',
        element: <div style={{color: 'white'}}>Маршруты (TODO)</div>,
      },
      {
        path: '/wishlist',
        element: <div style={{color: 'white'}}>Вишлист (TODO)</div>,
      },
      {
        path: '/saved',
        element: <div style={{color: 'white'}}>Сохраненные (TODO)</div>,
      },
      {
        path: '/settings',
        element: <div style={{color: 'white'}}>Настройки (TODO)</div>,
      },
    ],
  },
]);
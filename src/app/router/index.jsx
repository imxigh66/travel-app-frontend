import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import InitPage from '../../pages/InitPage';
import RegisterPage from '../../pages/RegisterPage';
import LoginPage from '../../pages/LoginPage';
import ProfilePage from '../../pages/ProfilePage';
import { ExplorePage } from '../../pages/ExplorePage'
import { ResultsPage } from '../../pages/ResultsPage'
import { PlaceDetailPage } from '../../pages/PlaceDetailPage'
import { SavedPlacesPage } from '../../pages/SavedPlacesPage'
import { FollowersPage } from '../../pages/FollowersPage/FollowersPage'
import { FollowingPage } from '../../pages/FollowingPage/FollowingPage'
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
        path: '/explore',
        element: <ExplorePage />,
      },
      {
        path: '/places/:id',
        element: <PlaceDetailPage />,
      },
      {
        path: '/places',
        element: <ResultsPage />,
      },
      { 
        path: '/users/:id/followers',
        element: <FollowersPage /> 
      },
      { 
        path: '/users/:id/following', 
        element: <FollowingPage /> 
      },

  { path: '/users/:id', element: <ProfilePage /> },
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
        element: <SavedPlacesPage />,
      },
      {
        path: '/settings',
        element: <div style={{color: 'white'}}>Настройки (TODO)</div>,
      },
    ],
  },
]);
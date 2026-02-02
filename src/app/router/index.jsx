import { createBrowserRouter } from 'react-router-dom';
import InitPage from '../../pages/InitPage';
import RegisterPage from '../../pages/RegisterPage';
import LoginPage from '../../pages/LoginPage';

export const router = createBrowserRouter([
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
]);
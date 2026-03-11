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
import FeedPage from '../../pages/FeedPage';
import TripsPage from '../../pages/TripsPage';
import TripDetailPage from '../../pages/TripDetailPage';

export const router = createBrowserRouter([
  { path: '/',         element: <InitPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/login',    element: <LoginPage /> },
  {
    element: <MainLayout />,
    children: [
      { path: '/profile',              element: <ProfilePage /> },
      { path: '/users/:id',            element: <ProfilePage /> },
      { path: '/users/:id/followers',  element: <FollowersPage /> },
      { path: '/users/:id/following',  element: <FollowingPage /> },
      { path: '/explore',              element: <ExplorePage /> },
      { path: '/places',               element: <ResultsPage /> },
      { path: '/places/:id',           element: <PlaceDetailPage /> },
      { path: '/feed',                 element: <FeedPage /> },
      { path: '/saved',                element: <SavedPlacesPage /> },
      { path: '/trips',                element: <TripsPage /> },
      { path: '/trips/:id',            element: <TripDetailPage /> },
      { path: '/messages',  element: <div style={{padding:40,color:'#999'}}>Сообщения — скоро</div> },
      { path: '/settings',  element: <div style={{padding:40,color:'#999'}}>Настройки — скоро</div> },
    ],
  },
]);
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

import MainLayout from '../layout/MainLayout'
import ModeratorLayout from '../layout/ModeratorLayout'
import ModeratorRoute from '../../shared/ui/ModeratorRoute'
import EmailConfirmedPage  from '../../pages/EmailConfirmedPage/EmailConfirmedPage'
import InitPage from '../../pages/InitPage'
import RegisterPage from '../../pages/RegisterPage'
import LoginPage from '../../pages/LoginPage'
import ProfilePage from '../../pages/ProfilePage'
import { ExplorePage }     from '../../pages/ExplorePage'
import { ResultsPage }     from '../../pages/ResultsPage'
import { PlaceDetailPage } from '../../pages/PlaceDetailPage'
import { SavedPlacesPage } from '../../pages/SavedPlacesPage'
import { FollowersPage }   from '../../pages/FollowersPage/FollowersPage'
import { FollowingPage }   from '../../pages/FollowingPage/FollowingPage'
import FeedPage            from '../../pages/FeedPage'
import  TripsPage        from '../../pages/TripsPage'
import  TripDetailPage   from '../../pages/TripDetailPage'

// Moderator pages — lazy load (не грузим обычным пользователям)
const PlacesQueuePage  = lazy(() => import('../../pages/moderator/PlacesQueuePage/PlacesQueuePage'))
const AllPlacesModPage = lazy(() => import('../../pages/moderator/AllPlacesPage/AllPlacesPage'))
const CategoryTagsPage = lazy(() => import('../../pages/moderator/CategoryTagsPage/CategoryTagsPage'))
const UsersPage        = lazy(() => import('../../pages/moderator/UsersPage/UsersPage'))

const ModeratorFallback = () => (
  <div style={{ padding: 40, color: '#9E9690' }}>Загрузка...</div>
)

export const router = createBrowserRouter([
  // ── Публичные (без сайдбара) ──
  { path: '/',         element: <InitPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/login',    element: <LoginPage /> },
  { path: '/email-confirmed',  element: <EmailConfirmedPage /> },

  // ── Основное приложение (с MainLayout) ──
  {
    element: <MainLayout />,
    children: [
      { path: '/profile',                element: <ProfilePage /> },
      { path: '/users/:id',              element: <ProfilePage /> },
      { path: '/users/:id/followers',    element: <FollowersPage /> },
      { path: '/users/:id/following',    element: <FollowingPage /> },
      { path: '/explore',                element: <ExplorePage /> },
      { path: '/places',                 element: <ResultsPage /> },
      { path: '/places/:id',             element: <PlaceDetailPage /> },
      { path: '/feed',                   element: <FeedPage /> },
      { path: '/saved',                  element: <SavedPlacesPage /> },
      { path: '/trips',                  element: <TripsPage /> },
      { path: '/trips/:id',              element: <TripDetailPage /> },
      { path: '/messages',               element: <div>Сообщения (TODO)</div> },
      { path: '/settings',               element: <div>Настройки (TODO)</div> },
    ],
  },

  // ── Панель модератора (с ModeratorLayout) ──
  {
    path: '/moderator',
    element: (
      <ModeratorRoute>
        <ModeratorLayout />
      </ModeratorRoute>
    ),
    children: [
      // /moderator → редирект на очередь
      { index: true, element: <Navigate to="/moderator/queue" replace /> },

      {
        path: 'queue',
        element: (
          <Suspense fallback={<ModeratorFallback />}>
            <PlacesQueuePage />
          </Suspense>
        ),
      },
      {
        path: 'places',
        element: (
          <Suspense fallback={<ModeratorFallback />}>
            <AllPlacesModPage />
          </Suspense>
        ),
      },
      {
        path: 'tags',
        element: (
          <Suspense fallback={<ModeratorFallback />}>
            <CategoryTagsPage />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<ModeratorFallback />}>
            <UsersPage />
          </Suspense>
        ),
      },
    ],
  },
])
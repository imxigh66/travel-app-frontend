import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import './app/styles/global.css';
import './shared/i18n';
import { SavedProvider } from './features/save-place/SavedContext';
import { FollowProvider } from './features/follow/FollowContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SavedProvider>
       <FollowProvider>
      <RouterProvider router={router} />
      </FollowProvider>
    </SavedProvider>
  </React.StrictMode>
);
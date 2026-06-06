import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App';
import Home from './pages/Home';
import List from './pages/List';
import MainLayout from './layouts/MainLayout';
import WhichLine from './pages/Tool/WhichLine';
import Auth from './pages/Auth/Auth';
import './styles/global.css';

import './i18n/config';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "auth",
    element: <Auth />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        // userIds supports comma-separated values: /Alice,Bob/list
        path: ":userIds/list",
        element: <List />,
      },
      {
        path: "tool/which-line",
        element: <WhichLine />,
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App>
        <RouterProvider router={router} />
      </App>
    </QueryClientProvider>
  </StrictMode>,
);

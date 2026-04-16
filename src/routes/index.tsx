import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import BasicLayout from '@/layouts/BasicLayout';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/dashboard/Dashboard';
import PermissionPage from '@/pages/permission/PermissionPage';
import QueryList from '@/pages/query/QueryList';
import Statistics from '@/pages/statistics/Statistics';
import Forbidden from '@/pages/system/Forbidden';
import NotFound from '@/pages/system/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <BasicLayout />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/query',
        element: <QueryList />,
      },
      {
        path: '/statistics',
        element: <Statistics />,
      },
      {
        path: '/permission',
        element: <PermissionPage />,
      },
      {
        path: '/403',
        element: <Forbidden />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

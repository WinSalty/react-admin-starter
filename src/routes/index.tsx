import { createMemoryRouter, Navigate } from 'react-router-dom';
import { AuthGuard, GuestGuard, RouteGuard } from '@/components/RouteGuard';
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

export const router = createMemoryRouter(
  [
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />,
    },
    {
      element: (
        <AuthGuard>
          <BasicLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: '/dashboard',
          element: (
            <RouteGuard permissionCode="dashboard">
              <Dashboard />
            </RouteGuard>
          ),
        },
        {
          path: '/query',
          element: (
            <RouteGuard permissionCode="query">
              <QueryList />
            </RouteGuard>
          ),
        },
        {
          path: '/statistics',
          element: (
            <RouteGuard permissionCode="statistics">
              <Statistics />
            </RouteGuard>
          ),
        },
        {
          path: '/permission',
          element: (
            <RouteGuard permissionCode="permission">
              <PermissionPage />
            </RouteGuard>
          ),
        },
        {
          path: '/403',
          element: <Forbidden />,
        },
      ],
    },
    {
      element: (
        <GuestGuard>
          <AuthLayout />
        </GuestGuard>
      ),
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
  ],
  {
    initialEntries: ['/dashboard'],
  },
);

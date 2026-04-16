import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Spin } from 'antd';
import { createMemoryRouter, Navigate } from 'react-router-dom';
import { AuthGuard, GuestGuard, RouteGuard } from '@/components/RouteGuard';

const AuthLayout = lazy(() => import('@/layouts/AuthLayout'));
const BasicLayout = lazy(() => import('@/layouts/BasicLayout'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const PermissionPage = lazy(() => import('@/pages/permission/PermissionPage'));
const QueryList = lazy(() => import('@/pages/query/QueryList'));
const Statistics = lazy(() => import('@/pages/statistics/Statistics'));
const Forbidden = lazy(() => import('@/pages/system/Forbidden'));
const NotFound = lazy(() => import('@/pages/system/NotFound'));

/**
 * 路由懒加载包装组件，避免所有页面和图表库进入首屏主包。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="route-loading">
          <Spin />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createMemoryRouter(
  [
    {
      path: '/',
      element: (
        <LazyRoute>
          <Navigate to="/dashboard" replace />
        </LazyRoute>
      ),
    },
    {
      element: (
        <LazyRoute>
          <AuthGuard>
            <BasicLayout />
          </AuthGuard>
        </LazyRoute>
      ),
      children: [
        {
          path: '/dashboard',
          element: (
            <LazyRoute>
              <RouteGuard permissionCode="dashboard">
                <Dashboard />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: '/query',
          element: (
            <LazyRoute>
              <RouteGuard permissionCode="query">
                <QueryList />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: '/statistics',
          element: (
            <LazyRoute>
              <RouteGuard permissionCode="statistics">
                <Statistics />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: '/permission',
          element: (
            <LazyRoute>
              <RouteGuard permissionCode="permission">
                <PermissionPage />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: '/403',
          element: (
            <LazyRoute>
              <Forbidden />
            </LazyRoute>
          ),
        },
      ],
    },
    {
      element: (
        <LazyRoute>
          <GuestGuard>
            <AuthLayout />
          </GuestGuard>
        </LazyRoute>
      ),
      children: [
        {
          path: '/login',
          element: (
            <LazyRoute>
              <Login />
            </LazyRoute>
          ),
        },
        {
          path: '/register',
          element: (
            <LazyRoute>
              <Register />
            </LazyRoute>
          ),
        },
      ],
    },
    {
      path: '*',
      element: (
        <LazyRoute>
          <NotFound />
        </LazyRoute>
      ),
    },
  ],
  {
    initialEntries: ['/dashboard'],
  },
);

import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Spin } from 'antd';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { dynamicRouteMap } from '@/access/routeMap';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
const MenuManagementPage = lazy(() => import('@/pages/system/MenuManagementPage'));
const NotFound = lazy(() => import('@/pages/system/NotFound'));
const SystemConfigPage = lazy(() => import('@/pages/system/SystemConfigPage'));
const SystemModulePage = lazy(() => import('@/pages/system/SystemModulePage'));

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
      <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
  );
}

export const router = createBrowserRouter(
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
          path: dynamicRouteMap.dashboard.path,
          element: (
            <LazyRoute>
              <RouteGuard permissionCode={dynamicRouteMap.dashboard.routeCode}>
                <Dashboard />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: dynamicRouteMap.query.path,
          element: (
            <LazyRoute>
              <RouteGuard permissionCode={dynamicRouteMap.query.routeCode}>
                <QueryList />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: dynamicRouteMap.statistics.path,
          element: (
            <LazyRoute>
              <RouteGuard permissionCode={dynamicRouteMap.statistics.routeCode}>
                <Statistics />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: dynamicRouteMap.permission.path,
          element: (
            <LazyRoute>
              <RouteGuard permissionCode={dynamicRouteMap.permission.routeCode}>
                <PermissionPage />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: dynamicRouteMap.users.path,
          element: (
            <LazyRoute>
              <RouteGuard permissionCode={dynamicRouteMap.users.routeCode}>
                <SystemModulePage moduleKey="users" />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: dynamicRouteMap.roles.path,
          element: (
            <LazyRoute>
              <RouteGuard permissionCode={dynamicRouteMap.roles.routeCode}>
                <SystemModulePage moduleKey="roles" />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: dynamicRouteMap.menus.path,
          element: (
            <LazyRoute>
              <RouteGuard permissionCode={dynamicRouteMap.menus.routeCode}>
                <MenuManagementPage />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: dynamicRouteMap.dicts.path,
          element: (
            <LazyRoute>
              <RouteGuard permissionCode={dynamicRouteMap.dicts.routeCode}>
                <SystemModulePage moduleKey="dicts" />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: dynamicRouteMap.logs.path,
          element: (
            <LazyRoute>
              <RouteGuard permissionCode={dynamicRouteMap.logs.routeCode}>
                <SystemModulePage moduleKey="logs" />
              </RouteGuard>
            </LazyRoute>
          ),
        },
        {
          path: dynamicRouteMap.configs.path,
          element: (
            <LazyRoute>
              <RouteGuard permissionCode={dynamicRouteMap.configs.routeCode}>
                <SystemConfigPage />
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
);

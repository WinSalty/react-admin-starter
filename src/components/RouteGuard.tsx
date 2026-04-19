import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { usePermission } from '@/hooks/usePermission';
import { isTokenUsable } from '@/utils/token';

/**
 * 认证路由守卫组件。
 * 未登录或权限未加载完成时重定向到 /login，已登录时渲染子组件。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const permissionsLoaded = useAuthStore((state) => state.permissionsLoaded);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const tokenValid = isTokenUsable(token);

  useEffect(() => {
    if (isAuthenticated && !tokenValid) {
      logout();
    }
  }, [isAuthenticated, logout, tokenValid]);

  if (!isAuthenticated || !permissionsLoaded || !tokenValid) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * 游客路由守卫组件。
 * 已登录且权限已加载时重定向到 /dashboard，未登录时渲染子组件（如登录、注册页）。
 * 权限未加载时（登录中）停留在登录页，避免与 AuthGuard 互相重定向。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const permissionsLoaded = useAuthStore((state) => state.permissionsLoaded);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const tokenValid = isTokenUsable(token);

  useEffect(() => {
    if (isAuthenticated && !tokenValid) {
      logout();
    }
  }, [isAuthenticated, logout, tokenValid]);

  if (isAuthenticated && permissionsLoaded && tokenValid) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/**
 * 路由权限守卫组件。
 * 检查当前路由是否在权限 routeCodes 范围内，无权限时重定向到 /403。
 * 默认拒绝原则：未显式授权的路由一律拦截。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
export function RouteGuard({
  permissionCode,
  children,
}: {
  permissionCode?: string;
  children: ReactNode;
}) {
  const { hasRoute } = usePermission();
  if (permissionCode && !hasRoute(permissionCode)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}

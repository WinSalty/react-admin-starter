import { create } from 'zustand';
import {
  getToken,
  setToken,
  clearToken,
  getRole,
  setRole,
  getMenus,
  setMenus,
  getRouteCodes,
  setRouteCodes,
  getActions,
  setActions,
} from '@/utils/token';
import type { PermissionAction, PermissionMenu } from '@/types/permission';

interface AuthState {
  token: string | null;
  role: string;
  menus: PermissionMenu[];
  routeCodes: string[];
  actions: PermissionAction[];
  permissionsLoaded: boolean;
  isAuthenticated: boolean;
  login: (token: string, role?: string) => void;
  logout: () => void;
  setPermissions: (menus: PermissionMenu[], routeCodes: string[], actions: PermissionAction[]) => void;
}

/**
 * 全局认证状态管理，支持登录态存储和权限数据管理。
 * 刷新页面时从 localStorage 恢复状态。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
export const useAuthStore = create<AuthState>((set) => {
  const savedRole = getRole();
  const savedMenus = getMenus();
  const savedRouteCodes = getRouteCodes();
  const savedActions = getActions();
  const hasToken = !!getToken();
  return {
    token: getToken(),
    role: savedRole,
    menus: savedMenus,
    routeCodes: savedRouteCodes,
    actions: savedActions,
    permissionsLoaded: hasToken && savedMenus.length > 0 && savedRouteCodes.length > 0,
    isAuthenticated: hasToken,
    login: (token: string, role?: string) => {
      const resolvedRole = role || 'admin';
      setToken(token);
      setRole(resolvedRole);
      set({
        token,
        role: resolvedRole,
        isAuthenticated: true,
        menus: [],
        routeCodes: [],
        actions: [],
        permissionsLoaded: false,
      });
    },
    logout: () => {
      clearToken();
      set({
        token: null,
        role: '',
        isAuthenticated: false,
        menus: [],
        routeCodes: [],
        actions: [],
        permissionsLoaded: false,
      });
    },
    setPermissions: (menus: PermissionMenu[], routeCodes: string[], actions: PermissionAction[]) => {
      setMenus(menus);
      setRouteCodes(routeCodes);
      setActions(actions);
      set({ menus, routeCodes, actions, permissionsLoaded: true });
    },
  };
});

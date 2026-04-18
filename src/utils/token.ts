import { readStorage, writeStorage, removeStorage } from '@/utils/storage';
import type { PermissionAction, PermissionMenu } from '@/types/permission';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const ROLE_KEY = 'auth_role';
const MENUS_KEY = 'auth_menus';
const ROUTE_CODES_KEY = 'auth_route_codes';
const ACTIONS_KEY = 'auth_actions';

/**
 * 获取本地存储的认证 token。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
export function getToken(): string | null {
  return readStorage(TOKEN_KEY);
}

/**
 * 存储认证 token。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
export function setToken(token: string): void {
  writeStorage(TOKEN_KEY, token);
}

/**
 * 获取刷新 token。
 */
export function getRefreshToken(): string | null {
  return readStorage(REFRESH_TOKEN_KEY);
}

/**
 * 存储刷新 token。
 */
export function setRefreshToken(token: string): void {
  writeStorage(REFRESH_TOKEN_KEY, token);
}

/**
 * 清除认证 token。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
export function clearToken(): void {
  removeStorage(TOKEN_KEY);
  removeStorage(REFRESH_TOKEN_KEY);
  removeStorage(ROLE_KEY);
  removeStorage(MENUS_KEY);
  removeStorage(ROUTE_CODES_KEY);
  removeStorage(ACTIONS_KEY);
}

/**
 * 获取角色。
 */
export function getRole(): string {
  return readStorage(ROLE_KEY) || '';
}

/**
 * 存储角色。
 */
export function setRole(role: string): void {
  writeStorage(ROLE_KEY, role);
}

/**
 * 获取菜单权限。
 */
export function getMenus(): PermissionMenu[] {
  try {
    const raw = readStorage(MENUS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * 存储菜单权限。
 */
export function setMenus(menus: PermissionMenu[]): void {
  writeStorage(MENUS_KEY, JSON.stringify(menus));
}

/**
 * 获取路由权限码。
 */
export function getRouteCodes(): string[] {
  try {
    const raw = readStorage(ROUTE_CODES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * 存储路由权限码。
 */
export function setRouteCodes(routeCodes: string[]): void {
  writeStorage(ROUTE_CODES_KEY, JSON.stringify(routeCodes));
}

/**
 * 获取按钮权限。
 */
export function getActions(): PermissionAction[] {
  try {
    const raw = readStorage(ACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * 存储按钮权限。
 */
export function setActions(actions: PermissionAction[]): void {
  writeStorage(ACTIONS_KEY, JSON.stringify(actions));
}

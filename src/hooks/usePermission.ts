import { useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';

/**
 * 权限判断 Hook。
 * 默认拒绝原则：仅当 routeCodes 或 actions 中显式包含时才允许访问。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
export function usePermission() {
  const routeCodes = useAuthStore((state) => state.routeCodes);
  const actions = useAuthStore((state) => state.actions);
  const actionCodes = actions.map((a) => a.code);

  /**
   * 判断是否拥有指定路由权限。
   */
  const hasRoute = useCallback(
    (route: string) => routeCodes.includes(route),
    [routeCodes],
  );

  /**
   * 判断是否拥有指定按钮权限。
   */
  const hasAction = useCallback(
    (code: string) => actionCodes.includes(code),
    [actionCodes],
  );

  /**
   * 判断是否拥有任意一个按钮权限。
   */
  const hasAnyAction = useCallback(
    (codes: string[]) => codes.some((code) => actionCodes.includes(code)),
    [actionCodes],
  );

  /**
   * 判断是否拥有全部按钮权限。
   */
  const hasAllAction = useCallback(
    (codes: string[]) => codes.every((code) => actionCodes.includes(code)),
    [actionCodes],
  );

  return { hasRoute, hasAction, hasAnyAction, hasAllAction };
}

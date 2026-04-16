/**
 * 权限统一类型定义。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

/**
 * 后端下发的权限菜单树节点。
 */
export interface PermissionMenu {
  id: string;
  parentId?: string;
  title: string;
  path: string;
  icon?: string;
  orderNo: number;
  permissionCode?: string;
  hiddenInMenu?: boolean;
  children?: PermissionMenu[];
}

/**
 * 按钮权限。
 */
export interface PermissionAction {
  code: string;
  name: string;
}

/**
 * 权限一次性下发接口（bootstrap）。
 * 对应后端 GET /api/permission/bootstrap
 */
export interface PermissionBootstrap {
  menus: PermissionMenu[];
  routes: string[];
  actions: PermissionAction[];
}

/**
 * 路由 meta 中配置的权限码，用于路由守卫判断。
 */
export interface RouteMeta {
  permissionCode?: string;
}

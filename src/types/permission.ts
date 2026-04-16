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
  path?: string;
  icon?: string;
  orderNo: number;
  type?: 'catalog' | 'menu' | 'hidden' | 'external';
  permissionCode?: string;
  hiddenInMenu?: boolean;
  redirect?: string;
  keepAlive?: boolean;
  externalLink?: string;
  badge?: string;
  disabled?: boolean;
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

export interface RolePermissionAssignment {
  roleCode: string;
  menuIds: string[];
  routeCodes: string[];
  actionCodes: string[];
}

/**
 * 路由 meta 中配置的权限码，用于路由守卫判断。
 */
export interface RouteMeta {
  permissionCode?: string;
}

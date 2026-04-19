/**
 * 后端动态菜单到本地页面组件的稳定映射表。
 * 后端只下发 routePath/componentKey，前端在此处做白名单映射，避免任意组件加载。
 * author: sunshengxian
 * 创建日期：2026-04-17
 */
export const dynamicRouteMap = {
  dashboard: {
    path: '/dashboard',
    componentKey: 'Dashboard',
    routeCode: 'dashboard',
  },
  query: {
    path: '/query',
    componentKey: 'QueryList',
    routeCode: 'query',
  },
  statistics: {
    path: '/statistics',
    componentKey: 'Statistics',
    routeCode: 'statistics',
  },
  permission: {
    path: '/permission',
    componentKey: 'PermissionPage',
    routeCode: 'permission',
  },
  users: {
    path: '/system/users',
    componentKey: 'SystemModulePage:users',
    routeCode: 'users',
  },
  roles: {
    path: '/system/roles',
    componentKey: 'SystemModulePage:roles',
    routeCode: 'roles',
  },
  menus: {
    path: '/system/menus',
    componentKey: 'MenuManagementPage',
    routeCode: 'menus',
  },
  dicts: {
    path: '/system/dicts',
    componentKey: 'SystemModulePage:dicts',
    routeCode: 'dicts',
  },
  logs: {
    path: '/system/logs',
    componentKey: 'SystemModulePage:logs',
    routeCode: 'logs',
  },
  notices: {
    path: '/system/notices',
    componentKey: 'NoticePage',
    routeCode: 'notices',
  },
  configs: {
    path: '/system/configs',
    componentKey: 'SystemConfigPage',
    routeCode: 'configs',
  },
  accountSettings: {
    path: '/account/settings',
    componentKey: 'AccountSettings',
    routeCode: 'account_settings',
  },
} as const;

export type DynamicRouteKey = keyof typeof dynamicRouteMap;

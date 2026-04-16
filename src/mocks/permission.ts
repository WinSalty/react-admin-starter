import type { PermissionBootstrap } from '@/types/permission';

/**
 * 权限 mock 数据。
 * admin：拥有全部权限。
 * viewer：仅有 dashboard 查看权限，用于测试菜单/路由/按钮权限控制。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

const adminPermissions: PermissionBootstrap = {
  menus: [
    {
      id: '1',
      title: '工作台',
      path: '/dashboard',
      icon: 'DashboardOutlined',
      orderNo: 1,
      type: 'menu',
      permissionCode: 'dashboard:view',
    },
    {
      id: '2',
      title: '业务中心',
      icon: 'AppstoreOutlined',
      orderNo: 2,
      type: 'catalog',
      children: [
        {
          id: '2-1',
          parentId: '2',
          title: '查询管理',
          path: '/query',
          icon: 'SearchOutlined',
          orderNo: 1,
          type: 'menu',
          permissionCode: 'query:view',
        },
        {
          id: '2-2',
          parentId: '2',
          title: '数据统计',
          path: '/statistics',
          icon: 'LineChartOutlined',
          orderNo: 2,
          type: 'menu',
          permissionCode: 'statistics:view',
        },
      ],
    },
    {
      id: '3',
      title: '系统管理',
      icon: 'SettingOutlined',
      orderNo: 3,
      type: 'catalog',
      children: [
        {
          id: '3-1',
          parentId: '3',
          title: '权限目录',
          path: '/permission',
          icon: 'KeyOutlined',
          orderNo: 1,
          type: 'menu',
          permissionCode: 'permission:view',
        },
        {
          id: '3-2',
          parentId: '3',
          title: '用户管理',
          path: '/system/users',
          icon: 'UserOutlined',
          orderNo: 2,
          type: 'menu',
          permissionCode: 'system:user:view',
        },
        {
          id: '3-3',
          parentId: '3',
          title: '角色管理',
          path: '/system/roles',
          icon: 'TeamOutlined',
          orderNo: 3,
          type: 'menu',
          permissionCode: 'system:role:view',
        },
        {
          id: '3-4',
          parentId: '3',
          title: '菜单管理',
          path: '/system/menus',
          icon: 'MenuOutlined',
          orderNo: 4,
          type: 'menu',
          permissionCode: 'system:menu:view',
        },
        {
          id: '3-5',
          parentId: '3',
          title: '字典管理',
          path: '/system/dicts',
          icon: 'BookOutlined',
          orderNo: 5,
          type: 'menu',
          permissionCode: 'system:dict:view',
        },
        {
          id: '3-6',
          parentId: '3',
          title: '日志管理',
          path: '/system/logs',
          icon: 'FileSearchOutlined',
          orderNo: 6,
          type: 'menu',
          permissionCode: 'system:log:view',
        },
      ],
    },
  ],
  routes: ['dashboard', 'query', 'statistics', 'permission', 'users', 'roles', 'menus', 'dicts', 'logs'],
  actions: [
    { code: 'query:add', name: '新增查询' },
    { code: 'query:edit', name: '编辑查询' },
    { code: 'query:delete', name: '删除查询' },
    { code: 'query:export', name: '导出查询' },
    { code: 'statistics:view', name: '查看统计' },
    { code: 'statistics:export', name: '导出统计' },
    { code: 'permission:view', name: '查看权限' },
    { code: 'permission:assign', name: '分配权限' },
    { code: 'system:user:add', name: '新增用户' },
    { code: 'system:user:edit', name: '编辑用户' },
    { code: 'system:user:status', name: '切换用户状态' },
    { code: 'system:user:reset', name: '重置密码' },
    { code: 'system:user:assign-role', name: '分配角色' },
    { code: 'system:role:add', name: '新增角色' },
    { code: 'system:role:edit', name: '编辑角色' },
    { code: 'system:role:status', name: '切换角色状态' },
    { code: 'system:role:assign-permission', name: '分配权限' },
    { code: 'system:menu:add', name: '新增菜单' },
    { code: 'system:menu:edit', name: '编辑菜单' },
    { code: 'system:menu:status', name: '切换菜单状态' },
    { code: 'system:dict:add', name: '新增字典' },
    { code: 'system:dict:edit', name: '编辑字典' },
    { code: 'system:dict:status', name: '切换字典状态' },
    { code: 'system:dict:refresh', name: '刷新字典缓存' },
  ],
};

const viewerPermissions: PermissionBootstrap = {
  menus: [
    {
      id: '1',
      title: '工作台',
      path: '/dashboard',
      icon: 'DashboardOutlined',
      orderNo: 1,
      type: 'menu',
      permissionCode: 'dashboard:view',
    },
  ],
  routes: ['dashboard'],
  actions: [],
};

/**
 * 根据角色获取权限 bootstrap 数据。
 */
export async function mockFetchPermissionBootstrap(
  role: 'admin' | 'viewer',
): Promise<PermissionBootstrap> {
  await delay(400);
  return role === 'admin' ? { ...adminPermissions } : { ...viewerPermissions };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

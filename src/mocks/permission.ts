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
          disabled: true,
          badge: '规划',
        },
        {
          id: '3-3',
          parentId: '3',
          title: '菜单管理',
          path: '/system/menus',
          icon: 'MenuOutlined',
          orderNo: 3,
          type: 'menu',
          permissionCode: 'system:menu:view',
          disabled: true,
          badge: '规划',
        },
        {
          id: '3-4',
          parentId: '3',
          title: '字典管理',
          path: '/system/dicts',
          icon: 'BookOutlined',
          orderNo: 4,
          type: 'menu',
          permissionCode: 'system:dict:view',
          disabled: true,
          badge: '规划',
        },
      ],
    },
  ],
  routes: ['dashboard', 'query', 'statistics', 'permission'],
  actions: [
    { code: 'query:add', name: '新增查询' },
    { code: 'query:edit', name: '编辑查询' },
    { code: 'query:delete', name: '删除查询' },
    { code: 'query:export', name: '导出查询' },
    { code: 'statistics:view', name: '查看统计' },
    { code: 'statistics:export', name: '导出统计' },
    { code: 'permission:view', name: '查看权限' },
    { code: 'permission:assign', name: '分配权限' },
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

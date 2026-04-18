import {
  ApartmentOutlined,
  AppstoreOutlined,
  BookOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  KeyOutlined,
  LineChartOutlined,
  MenuOutlined,
  NotificationOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { dynamicRouteMap } from '@/access/routeMap';
import type { PermissionMenu } from '@/types/permission';

export interface AppMenuItem {
  key: string;
  path?: string;
  label: string;
  icon?: ReactNode;
  orderNo: number;
  type?: 'catalog' | 'menu' | 'hidden' | 'external';
  permissionCode?: string;
  hiddenInMenu?: boolean;
  redirect?: string;
  keepAlive?: boolean;
  externalLink?: string;
  badge?: string;
  disabled?: boolean;
  children?: AppMenuItem[];
}

const menuIconMap: Record<string, ReactNode> = {
  ApartmentOutlined: <ApartmentOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  BookOutlined: <BookOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  SearchOutlined: <SearchOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  KeyOutlined: <KeyOutlined />,
  MenuOutlined: <MenuOutlined />,
  SettingOutlined: <SettingOutlined />,
  TeamOutlined: <TeamOutlined />,
  UserOutlined: <UserOutlined />,
  FileSearchOutlined: <FileSearchOutlined />,
  NotificationOutlined: <NotificationOutlined />,
};

const supportedInternalPaths: Set<string> = new Set(
  Object.values(dynamicRouteMap).map((route) => route.path),
);

export const appMenus: AppMenuItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    label: '工作台',
    icon: <DashboardOutlined />,
    orderNo: 1,
    type: 'menu',
    permissionCode: 'dashboard:view',
  },
  {
    key: 'business',
    label: '业务中心',
    icon: <AppstoreOutlined />,
    orderNo: 2,
    type: 'catalog',
    children: [
      {
        key: 'query',
        path: '/query',
        label: '查询管理',
        icon: <SearchOutlined />,
        orderNo: 1,
        type: 'menu',
        permissionCode: 'query:view',
      },
      {
        key: 'statistics',
        path: '/statistics',
        label: '数据统计',
        icon: <LineChartOutlined />,
        orderNo: 2,
        type: 'menu',
        permissionCode: 'statistics:view',
      },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: <SettingOutlined />,
    orderNo: 3,
    type: 'catalog',
    children: [
      {
        key: 'permission',
        path: '/permission',
        label: '权限目录',
        icon: <KeyOutlined />,
        orderNo: 1,
        type: 'menu',
        permissionCode: 'permission:view',
      },
      {
        key: 'user',
        path: '/system/users',
        label: '用户管理',
        icon: <UserOutlined />,
        orderNo: 2,
        type: 'menu',
        permissionCode: 'system:user:view',
      },
      {
        key: 'role',
        path: '/system/roles',
        label: '角色管理',
        icon: <TeamOutlined />,
        orderNo: 3,
        type: 'menu',
        permissionCode: 'system:role:view',
      },
      {
        key: 'menu',
        path: '/system/menus',
        label: '菜单管理',
        icon: <MenuOutlined />,
        orderNo: 4,
        type: 'menu',
        permissionCode: 'system:menu:view',
      },
      {
        key: 'dict',
        path: '/system/dicts',
        label: '字典管理',
        icon: <BookOutlined />,
        orderNo: 5,
        type: 'menu',
        permissionCode: 'system:dict:view',
      },
      {
        key: 'log',
        path: '/system/logs',
        label: '日志管理',
        icon: <FileSearchOutlined />,
        orderNo: 6,
        type: 'menu',
        permissionCode: 'system:log:view',
      },
      {
        key: 'configs',
        path: '/system/configs',
        label: '系统配置',
        icon: <SettingOutlined />,
        orderNo: 7,
        type: 'menu',
        permissionCode: 'system:config:view',
      },
    ],
  },
];

export function mapPermissionMenusToAppMenus(menus: PermissionMenu[]): AppMenuItem[] {
  return menus
    .map((menu) => {
      const children = menu.children ? mapPermissionMenusToAppMenus(menu.children) : [];
      return {
        key: getMenuKey(menu),
        path: menu.path,
        label: menu.title,
        icon: menu.icon ? menuIconMap[menu.icon] : undefined,
        orderNo: menu.orderNo,
        type: menu.type,
        permissionCode: menu.permissionCode,
        hiddenInMenu: menu.hiddenInMenu,
        redirect: menu.redirect,
        keepAlive: menu.keepAlive,
        externalLink: menu.externalLink,
        badge: menu.badge,
        disabled: menu.disabled,
        children: children.length > 0 ? children : undefined,
      };
    })
    .filter((menu) => menu.children?.length || isSupportedMenu(menu))
    .sort((prev, next) => prev.orderNo - next.orderNo);
}

function isSupportedMenu(menu: AppMenuItem): boolean {
  if (menu.type === 'external') {
    return Boolean(menu.externalLink);
  }
  if (!menu.path) {
    return true;
  }
  return supportedInternalPaths.has(menu.path);
}

function getMenuKey(menu: PermissionMenu): string {
  const pathKey = menu.path?.split('/').filter(Boolean).at(-1);
  if (pathKey) {
    return pathKey;
  }
  return menu.permissionCode?.split(':')[0] || menu.id;
}

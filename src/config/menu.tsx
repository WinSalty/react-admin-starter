import {
  DashboardOutlined,
  KeyOutlined,
  LineChartOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { PermissionMenu } from '@/types/permission';

export interface AppMenuItem {
  key: string;
  path: string;
  label: string;
  icon?: ReactNode;
  orderNo: number;
  permissionCode?: string;
  hiddenInMenu?: boolean;
  children?: AppMenuItem[];
}

const menuIconMap: Record<string, ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  SearchOutlined: <SearchOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  KeyOutlined: <KeyOutlined />,
};

export const appMenus: AppMenuItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    label: '工作台',
    icon: <DashboardOutlined />,
    orderNo: 1,
    permissionCode: 'dashboard:view',
  },
  {
    key: 'query',
    path: '/query',
    label: '查询管理',
    icon: <SearchOutlined />,
    orderNo: 2,
    permissionCode: 'query:view',
  },
  {
    key: 'statistics',
    path: '/statistics',
    label: '数据统计',
    icon: <LineChartOutlined />,
    orderNo: 3,
    permissionCode: 'statistics:view',
  },
  {
    key: 'permission',
    path: '/permission',
    label: '权限目录',
    icon: <KeyOutlined />,
    orderNo: 4,
    permissionCode: 'permission:view',
  },
];

export function mapPermissionMenusToAppMenus(menus: PermissionMenu[]): AppMenuItem[] {
  return menus
    .map((menu) => ({
      key: getMenuKey(menu),
      path: menu.path,
      label: menu.title,
      icon: menu.icon ? menuIconMap[menu.icon] : undefined,
      orderNo: menu.orderNo,
      permissionCode: menu.permissionCode,
      hiddenInMenu: menu.hiddenInMenu,
      children: menu.children ? mapPermissionMenusToAppMenus(menu.children) : undefined,
    }))
    .sort((prev, next) => prev.orderNo - next.orderNo);
}

function getMenuKey(menu: PermissionMenu): string {
  const pathKey = menu.path.split('/').filter(Boolean)[0];
  if (pathKey) {
    return pathKey;
  }
  return menu.permissionCode?.split(':')[0] || menu.id;
}

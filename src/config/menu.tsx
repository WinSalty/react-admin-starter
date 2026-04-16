import {
  DashboardOutlined,
  KeyOutlined,
  LineChartOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

export interface AppMenuItem {
  key: string;
  path: string;
  label: string;
  icon: ReactNode;
  orderNo: number;
  permissionCode?: string;
  hiddenInMenu?: boolean;
}

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

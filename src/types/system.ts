export type SystemStatus = 'active' | 'disabled';

export type SystemModuleKey = 'users' | 'roles' | 'menus' | 'dicts' | 'logs';

export type SystemMenuType = 'catalog' | 'menu' | 'hidden' | 'external';

export type SystemConfigType = 'basic' | 'switch' | 'cache';

export type SystemLogType = 'login' | 'operation' | 'api';

export interface SystemListParams {
  moduleKey: SystemModuleKey;
  keyword?: string;
  status?: SystemStatus;
  logType?: SystemLogType;
  pageNo: number;
  pageSize: number;
}

export interface SystemRecord {
  id: string;
  moduleKey: SystemModuleKey;
  name: string;
  code: string;
  status: SystemStatus;
  description: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  [key: string]:
    | string
    | number
    | SystemStatus
    | SystemModuleKey
    | SystemMenuRecord[]
    | undefined;
}

export interface SystemSaveParams {
  id?: string;
  moduleKey: Exclude<SystemModuleKey, 'logs'>;
  name: string;
  code: string;
  status: SystemStatus;
  owner: string;
  description: string;
  extraValue?: string;
}

export interface SystemMenuRecord extends SystemRecord {
  moduleKey: 'menus';
  parentId?: string;
  menuType: SystemMenuType;
  icon?: string;
  routePath?: string;
  permissionCode?: string;
  externalLink?: string;
  orderNo: number;
  children?: SystemMenuRecord[];
}

export interface SystemMenuSaveParams {
  id?: string;
  parentId?: string;
  name: string;
  code: string;
  status: SystemStatus;
  description: string;
  menuType: SystemMenuType;
  icon?: string;
  routePath?: string;
  permissionCode?: string;
  externalLink?: string;
  orderNo: number;
}

export interface SystemConfigRecord {
  id: string;
  name: string;
  code: string;
  type: SystemConfigType;
  value: string | boolean | number;
  description: string;
  updatedAt: string;
}

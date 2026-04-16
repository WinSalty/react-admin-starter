export type SystemStatus = 'active' | 'disabled';

export type SystemModuleKey = 'users' | 'roles' | 'menus' | 'dicts' | 'logs';

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
  [key: string]: string | number | SystemStatus | SystemModuleKey;
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

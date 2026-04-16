import type { PageResult } from '@/types/api';
import type {
  SystemListParams,
  SystemModuleKey,
  SystemRecord,
  SystemSaveParams,
  SystemStatus,
} from '@/types/system';

/**
 * 系统管理 mock 数据。
 * 覆盖用户、角色、菜单、字典和日志模块，页面统一通过 service 层读取。
 * author: sunshengxian
 * 创建日期：2026-04-17
 */

let systemRecords: SystemRecord[] = [
  {
    id: 'U1001',
    moduleKey: 'users',
    name: '孙管理员',
    code: 'admin',
    status: 'active',
    owner: '平台技术部',
    description: '系统默认管理员账号，拥有全部后台管理权限。',
    department: '平台技术部',
    roleNames: '超级管理员',
    lastLoginAt: '2026-04-16 20:18:00',
    createdAt: '2026-03-01 09:00:00',
    updatedAt: '2026-04-16 20:18:00',
  },
  {
    id: 'U1002',
    moduleKey: 'users',
    name: '运营观察员',
    code: 'viewer',
    status: 'active',
    owner: '运营中心',
    description: '只读访客账号，用于验证菜单、路由和按钮权限收敛效果。',
    department: '运营中心',
    roleNames: '只读访客',
    lastLoginAt: '2026-04-16 18:42:00',
    createdAt: '2026-03-06 10:12:00',
    updatedAt: '2026-04-16 18:42:00',
  },
  {
    id: 'U1003',
    moduleKey: 'users',
    name: '安全审计员',
    code: 'audit_user',
    status: 'disabled',
    owner: '安全中心',
    description: '负责查看权限变更和登录风险审计记录。',
    department: '安全中心',
    roleNames: '审计员',
    lastLoginAt: '2026-04-10 11:30:00',
    createdAt: '2026-03-12 15:32:00',
    updatedAt: '2026-04-12 09:20:00',
  },
  {
    id: 'R1001',
    moduleKey: 'roles',
    name: '超级管理员',
    code: 'super_admin',
    status: 'active',
    owner: '平台技术部',
    description: '拥有全部菜单、路由和按钮权限。',
    dataScope: '全部数据',
    userCount: 1,
    createdAt: '2026-03-01 09:10:00',
    updatedAt: '2026-04-16 17:36:00',
  },
  {
    id: 'R1002',
    moduleKey: 'roles',
    name: '只读访客',
    code: 'readonly_viewer',
    status: 'active',
    owner: '运营中心',
    description: '仅允许查看工作台，不能进入管理页面。',
    dataScope: '本人数据',
    userCount: 1,
    createdAt: '2026-03-05 13:22:00',
    updatedAt: '2026-04-15 10:14:00',
  },
  {
    id: 'R1003',
    moduleKey: 'roles',
    name: '系统审计员',
    code: 'system_auditor',
    status: 'disabled',
    owner: '安全中心',
    description: '用于登录日志、操作日志和接口日志审计。',
    dataScope: '部门数据',
    userCount: 0,
    createdAt: '2026-03-18 16:02:00',
    updatedAt: '2026-04-08 11:44:00',
  },
  {
    id: 'M1001',
    moduleKey: 'menus',
    name: '系统管理',
    code: 'system',
    status: 'active',
    owner: '平台技术部',
    description: '系统管理一级目录，承载用户、角色、菜单、字典和日志模块。',
    menuType: '目录',
    routePath: '',
    permissionCode: '',
    orderNo: 3,
    createdAt: '2026-03-01 09:20:00',
    updatedAt: '2026-04-16 19:30:00',
  },
  {
    id: 'M1002',
    moduleKey: 'menus',
    name: '用户管理',
    code: 'system_users',
    status: 'active',
    owner: '平台技术部',
    description: '维护后台用户、状态、角色分配和重置密码入口。',
    menuType: '菜单',
    routePath: '/system/users',
    permissionCode: 'system:user:view',
    orderNo: 2,
    createdAt: '2026-03-01 09:22:00',
    updatedAt: '2026-04-17 09:18:00',
  },
  {
    id: 'M1003',
    moduleKey: 'menus',
    name: '角色管理',
    code: 'system_roles',
    status: 'active',
    owner: '平台技术部',
    description: '维护角色基础信息和权限分配入口。',
    menuType: '菜单',
    routePath: '/system/roles',
    permissionCode: 'system:role:view',
    orderNo: 3,
    createdAt: '2026-03-01 09:24:00',
    updatedAt: '2026-04-17 09:19:00',
  },
  {
    id: 'D1001',
    moduleKey: 'dicts',
    name: '用户状态',
    code: 'user_status',
    status: 'active',
    owner: '平台技术部',
    description: '用户启用、停用等状态字典。',
    dictType: '系统字典',
    itemCount: 2,
    cacheKey: 'dict:user_status',
    createdAt: '2026-03-02 10:10:00',
    updatedAt: '2026-04-12 09:00:00',
  },
  {
    id: 'D1002',
    moduleKey: 'dicts',
    name: '日志类型',
    code: 'log_type',
    status: 'active',
    owner: '安全中心',
    description: '登录日志、操作日志和接口日志分类。',
    dictType: '业务字典',
    itemCount: 3,
    cacheKey: 'dict:log_type',
    createdAt: '2026-03-04 11:28:00',
    updatedAt: '2026-04-14 16:48:00',
  },
  {
    id: 'D1003',
    moduleKey: 'dicts',
    name: '审批状态',
    code: 'approval_status',
    status: 'disabled',
    owner: '流程中心',
    description: '待提交、审批中、已通过、已驳回等审批状态。',
    dictType: '业务字典',
    itemCount: 4,
    cacheKey: 'dict:approval_status',
    createdAt: '2026-03-08 14:16:00',
    updatedAt: '2026-04-02 13:22:00',
  },
  {
    id: 'L1001',
    moduleKey: 'logs',
    name: 'admin 登录成功',
    code: 'login_admin_success',
    status: 'active',
    owner: 'admin',
    description: '管理员从可信设备登录系统。',
    logType: '登录日志',
    target: '认证中心',
    ipAddress: '192.168.1.10',
    result: '成功',
    durationMs: 86,
    createdAt: '2026-04-16 20:18:00',
    updatedAt: '2026-04-16 20:18:00',
  },
  {
    id: 'L1002',
    moduleKey: 'logs',
    name: '编辑查询配置',
    code: 'query_config_update',
    status: 'active',
    owner: 'admin',
    description: '更新客户基础信息查询配置说明。',
    logType: '操作日志',
    target: '查询管理',
    ipAddress: '192.168.1.10',
    result: '成功',
    durationMs: 132,
    createdAt: '2026-04-16 19:44:00',
    updatedAt: '2026-04-16 19:44:00',
  },
  {
    id: 'L1003',
    moduleKey: 'logs',
    name: '权限接口访问',
    code: 'permission_bootstrap_api',
    status: 'disabled',
    owner: 'viewer',
    description: '访客账号请求权限 bootstrap 接口。',
    logType: '接口日志',
    target: '/api/permission/bootstrap',
    ipAddress: '192.168.1.22',
    result: '拒绝',
    durationMs: 48,
    createdAt: '2026-04-16 18:42:00',
    updatedAt: '2026-04-16 18:42:00',
  },
];

/**
 * 模拟系统管理分页查询。
 */
export async function mockFetchSystemPage(
  params: SystemListParams,
): Promise<PageResult<SystemRecord>> {
  await delay(360);
  const keyword = params.keyword?.trim().toLowerCase();
  const filteredRecords = systemRecords.filter((record) => {
    const matchedModule = record.moduleKey === params.moduleKey;
    const matchedKeyword = keyword
      ? [record.name, record.code, record.owner, record.description].some((field) =>
          String(field).toLowerCase().includes(keyword),
        )
      : true;
    const matchedStatus = params.status ? record.status === params.status : true;
    const matchedLogType = params.logType
      ? String(record.logType || '').includes(getLogTypeName(params.logType))
      : true;
    return matchedModule && matchedKeyword && matchedStatus && matchedLogType;
  });
  const start = (params.pageNo - 1) * params.pageSize;
  const records = filteredRecords.slice(start, start + params.pageSize);
  return {
    records: records.map((item) => ({ ...item })),
    pageNo: params.pageNo,
    pageSize: params.pageSize,
    total: filteredRecords.length,
  };
}

/**
 * 模拟系统管理详情查询。
 */
export async function mockFetchSystemDetail(id: string): Promise<SystemRecord | undefined> {
  await delay(220);
  const record = systemRecords.find((item) => item.id === id);
  return record ? { ...record } : undefined;
}

/**
 * 模拟系统管理保存操作。
 */
export async function mockSaveSystemRecord(params: SystemSaveParams): Promise<SystemRecord> {
  await delay(320);
  const now = '2026-04-17 10:00:00';
  if (params.id) {
    const recordIndex = systemRecords.findIndex((item) => item.id === params.id);
    if (recordIndex >= 0) {
      const nextRecord = buildUpdatedRecord(systemRecords[recordIndex], params, now);
      systemRecords = systemRecords.map((item, index) => (index === recordIndex ? nextRecord : item));
      return { ...nextRecord };
    }
  }

  const nextRecord = buildNewRecord(params, now);
  systemRecords = [nextRecord, ...systemRecords];
  return { ...nextRecord };
}

/**
 * 模拟系统管理状态切换。
 */
export async function mockUpdateSystemStatus(
  id: string,
  status: SystemStatus,
): Promise<SystemRecord | undefined> {
  await delay(260);
  const now = '2026-04-17 10:00:00';
  const record = systemRecords.find((item) => item.id === id);
  if (!record) {
    return undefined;
  }
  const nextRecord = { ...record, status, updatedAt: now };
  systemRecords = systemRecords.map((item) => (item.id === id ? nextRecord : item));
  return { ...nextRecord };
}

function buildUpdatedRecord(record: SystemRecord, params: SystemSaveParams, updatedAt: string) {
  return {
    ...record,
    name: params.name,
    code: params.code,
    status: params.status,
    owner: params.owner,
    description: params.description,
    ...buildExtraFields(params),
    updatedAt,
  };
}

function buildNewRecord(params: SystemSaveParams, now: string): SystemRecord {
  return {
    id: getNextId(params.moduleKey),
    moduleKey: params.moduleKey,
    name: params.name,
    code: params.code,
    status: params.status,
    owner: params.owner,
    description: params.description,
    ...buildExtraFields(params),
    createdAt: now,
    updatedAt: now,
  };
}

function buildExtraFields(params: SystemSaveParams): Record<string, string | number> {
  if (params.moduleKey === 'users') {
    return {
      department: params.owner,
      roleNames: params.extraValue || '普通用户',
      lastLoginAt: '-',
    };
  }
  if (params.moduleKey === 'roles') {
    return {
      dataScope: params.extraValue || '本人数据',
      userCount: 0,
    };
  }
  if (params.moduleKey === 'menus') {
    return {
      menuType: params.extraValue || '菜单',
      routePath: params.code.startsWith('/') ? params.code : `/system/${params.code}`,
      permissionCode: params.code,
      orderNo: 99,
    };
  }
  return {
    dictType: params.extraValue || '业务字典',
    itemCount: 0,
    cacheKey: `dict:${params.code}`,
  };
}

function getNextId(moduleKey: Exclude<SystemModuleKey, 'logs'>) {
  const prefixMap: Record<Exclude<SystemModuleKey, 'logs'>, string> = {
    users: 'U',
    roles: 'R',
    menus: 'M',
    dicts: 'D',
  };
  const count = systemRecords.filter((item) => item.moduleKey === moduleKey).length + 1001;
  return `${prefixMap[moduleKey]}${count}`;
}

function getLogTypeName(logType: NonNullable<SystemListParams['logType']>) {
  const logTypeNameMap = {
    login: '登录日志',
    operation: '操作日志',
    api: '接口日志',
  };
  return logTypeNameMap[logType];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

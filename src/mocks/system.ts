import type { PageResult } from '@/types/api';
import type {
  SystemConfigRecord,
  SystemListParams,
  SystemMenuRecord,
  SystemMenuSaveParams,
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
    parentId: '',
    menuType: 'catalog',
    icon: 'SettingOutlined',
    routePath: '',
    permissionCode: '',
    orderNo: 30,
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
    parentId: 'M1001',
    menuType: 'menu',
    icon: 'UserOutlined',
    routePath: '/system/users',
    permissionCode: 'system:user:view',
    orderNo: 20,
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
    parentId: 'M1001',
    menuType: 'menu',
    icon: 'TeamOutlined',
    routePath: '/system/roles',
    permissionCode: 'system:role:view',
    orderNo: 30,
    createdAt: '2026-03-01 09:24:00',
    updatedAt: '2026-04-17 09:19:00',
  },
  {
    id: 'M1004',
    moduleKey: 'menus',
    name: '菜单管理',
    code: 'system_menu',
    status: 'active',
    owner: '平台技术部',
    description: '维护多级菜单、动态路由路径和权限编码。',
    parentId: 'M1001',
    menuType: 'menu',
    icon: 'MenuOutlined',
    routePath: '/system/menus',
    permissionCode: 'system:menu:view',
    orderNo: 40,
    createdAt: '2026-03-01 09:26:00',
    updatedAt: '2026-04-17 09:21:00',
  },
  {
    id: 'M1005',
    moduleKey: 'menus',
    name: '字典管理',
    code: 'system_dict',
    status: 'active',
    owner: '平台技术部',
    description: '维护系统字典类型、字典项和缓存入口。',
    parentId: 'M1001',
    menuType: 'menu',
    icon: 'BookOutlined',
    routePath: '/system/dicts',
    permissionCode: 'system:dict:view',
    orderNo: 50,
    createdAt: '2026-03-01 09:28:00',
    updatedAt: '2026-04-17 09:22:00',
  },
  {
    id: 'M1006',
    moduleKey: 'menus',
    name: '日志管理',
    code: 'system_log',
    status: 'active',
    owner: '安全中心',
    description: '提供登录日志、操作日志和接口日志查询入口。',
    parentId: 'M1001',
    menuType: 'menu',
    icon: 'FileSearchOutlined',
    routePath: '/system/logs',
    permissionCode: 'system:log:view',
    orderNo: 60,
    createdAt: '2026-03-01 09:30:00',
    updatedAt: '2026-04-17 09:24:00',
  },
  {
    id: 'M1007',
    moduleKey: 'menus',
    name: '系统配置',
    code: 'system_config',
    status: 'active',
    owner: '平台技术部',
    description: '维护系统基础参数、开关配置和前端缓存配置。',
    parentId: 'M1001',
    menuType: 'menu',
    icon: 'SettingOutlined',
    routePath: '/system/configs',
    permissionCode: 'system:config:view',
    orderNo: 70,
    createdAt: '2026-04-17 10:10:00',
    updatedAt: '2026-04-17 10:10:00',
  },
  {
    id: 'M1008',
    moduleKey: 'menus',
    name: '审计详情隐藏页',
    code: 'system_log_detail',
    status: 'active',
    owner: '安全中心',
    description: '日志详情路由占位，不展示在侧边栏。',
    parentId: 'M1006',
    menuType: 'hidden',
    icon: 'FileSearchOutlined',
    routePath: '/system/logs/detail',
    permissionCode: 'system:log:detail',
    orderNo: 10,
    createdAt: '2026-04-17 10:12:00',
    updatedAt: '2026-04-17 10:12:00',
  },
  {
    id: 'M1009',
    moduleKey: 'menus',
    name: 'Ant Design 文档',
    code: 'antd_docs',
    status: 'active',
    owner: '平台技术部',
    description: '外链菜单示例，用于验证外部地址维护。',
    parentId: '',
    menuType: 'external',
    icon: 'BookOutlined',
    routePath: '',
    permissionCode: 'docs:antd:view',
    externalLink: 'https://ant.design',
    orderNo: 90,
    createdAt: '2026-04-17 10:15:00',
    updatedAt: '2026-04-17 10:15:00',
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

let systemConfigs: SystemConfigRecord[] = [
  {
    id: 'C1001',
    name: '系统名称',
    code: 'app.name',
    type: 'basic',
    value: 'React Admin Starter',
    description: '展示在后台布局和浏览器标题中的系统名称。',
    updatedAt: '2026-04-17 10:20:00',
  },
  {
    id: 'C1002',
    name: '默认首页',
    code: 'app.homePath',
    type: 'basic',
    value: '/dashboard',
    description: '登录成功后的默认进入页面。',
    updatedAt: '2026-04-17 10:20:00',
  },
  {
    id: 'C1003',
    name: '权限严格模式',
    code: 'security.strictPermission',
    type: 'switch',
    value: true,
    description: '启用后未显式授权的菜单、路由和按钮默认拒绝。',
    updatedAt: '2026-04-17 10:20:00',
  },
  {
    id: 'C1004',
    name: '登录日志采集',
    code: 'audit.loginLog',
    type: 'switch',
    value: true,
    description: '控制真实后端接入后的登录审计记录开关。',
    updatedAt: '2026-04-17 10:20:00',
  },
  {
    id: 'C1005',
    name: '菜单缓存版本',
    code: 'cache.menuVersion',
    type: 'cache',
    value: '20260417.1',
    description: '前端可根据版本变化清理本地菜单和权限缓存。',
    updatedAt: '2026-04-17 10:20:00',
  },
  {
    id: 'C1006',
    name: '字典缓存 TTL',
    code: 'cache.dictTtlSeconds',
    type: 'cache',
    value: 3600,
    description: '字典类配置在前端缓存中的建议有效期，单位秒。',
    updatedAt: '2026-04-17 10:20:00',
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

/**
 * 模拟菜单树查询。
 */
export async function mockFetchSystemMenuTree(params?: {
  keyword?: string;
  status?: SystemStatus;
}): Promise<SystemMenuRecord[]> {
  await delay(300);
  const keyword = params?.keyword?.trim().toLowerCase();
  const menuRecords = systemRecords
    .filter((item) => item.moduleKey === 'menus')
    .filter((item) => (params?.status ? item.status === params.status : true))
    .filter((item) => {
      if (!keyword) {
        return true;
      }
      return [
        item.name,
        item.code,
        item.description,
        item.routePath,
        item.permissionCode,
      ].some((field) => String(field || '').toLowerCase().includes(keyword));
    }) as SystemMenuRecord[];
  return buildMenuTree(menuRecords).map(cloneMenuNode);
}

/**
 * 模拟菜单保存。
 */
export async function mockSaveSystemMenu(
  params: SystemMenuSaveParams,
): Promise<SystemMenuRecord> {
  await delay(320);
  const now = '2026-04-17 10:30:00';
  const nextRecord: SystemMenuRecord = {
    id: params.id || getNextId('menus'),
    moduleKey: 'menus',
    name: params.name,
    code: params.code,
    status: params.status,
    owner: '平台技术部',
    description: params.description,
    parentId: params.parentId || '',
    menuType: params.menuType,
    icon: params.icon || '',
    routePath: params.routePath || '',
    permissionCode: params.permissionCode || '',
    externalLink: params.externalLink || '',
    orderNo: params.orderNo,
    createdAt: params.id
      ? String(systemRecords.find((item) => item.id === params.id)?.createdAt || now)
      : now,
    updatedAt: now,
  };

  if (params.id) {
    systemRecords = systemRecords.map((item) => (item.id === params.id ? nextRecord : item));
  } else {
    systemRecords = [nextRecord, ...systemRecords];
  }
  return cloneMenuNode(nextRecord);
}

/**
 * 模拟菜单状态切换。
 */
export async function mockUpdateSystemMenuStatus(
  id: string,
  status: SystemStatus,
): Promise<SystemMenuRecord | undefined> {
  const record = await mockUpdateSystemStatus(id, status);
  return record && record.moduleKey === 'menus' ? cloneMenuNode(record as SystemMenuRecord) : undefined;
}

/**
 * 模拟系统配置查询。
 */
export async function mockFetchSystemConfigs(): Promise<SystemConfigRecord[]> {
  await delay(260);
  return systemConfigs.map((item) => ({ ...item }));
}

/**
 * 模拟系统配置保存。
 */
export async function mockSaveSystemConfig(
  id: string,
  value: SystemConfigRecord['value'],
): Promise<SystemConfigRecord | undefined> {
  await delay(260);
  const now = '2026-04-17 10:30:00';
  const record = systemConfigs.find((item) => item.id === id);
  if (!record) {
    return undefined;
  }
  const nextRecord = { ...record, value, updatedAt: now };
  systemConfigs = systemConfigs.map((item) => (item.id === id ? nextRecord : item));
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
      menuType: params.extraValue || 'menu',
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

function buildMenuTree(records: SystemMenuRecord[]): SystemMenuRecord[] {
  const nodeMap = new Map<string, SystemMenuRecord>();
  records.forEach((record) => {
    nodeMap.set(record.id, { ...record, children: [] });
  });

  const roots: SystemMenuRecord[] = [];
  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  return sortMenuNodes(roots);
}

function sortMenuNodes(nodes: SystemMenuRecord[]): SystemMenuRecord[] {
  return nodes
    .map((node) => ({
      ...node,
      children: node.children && node.children.length > 0 ? sortMenuNodes(node.children) : undefined,
    }))
    .sort((prev, next) => prev.orderNo - next.orderNo);
}

function cloneMenuNode(node: SystemMenuRecord): SystemMenuRecord {
  return {
    ...node,
    children: node.children?.map(cloneMenuNode),
  };
}

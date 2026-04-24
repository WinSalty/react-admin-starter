import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import { Access } from '@/components/Access';
import {
  fetchSystemDetail,
  fetchSystemPage,
  saveSystemRecord,
  updateSystemStatus,
} from '@/services/system';
import type {
  SystemLogType,
  SystemModuleKey,
  SystemRecord,
  SystemSaveParams,
  SystemStatus,
} from '@/types/system';
import { resolveAvatarDisplayUrl } from '@/utils/avatar';

interface SystemModulePageProps {
  moduleKey: SystemModuleKey;
}

interface SystemSearchForm {
  keyword?: string;
  status?: SystemStatus;
  logType?: SystemLogType;
}

type SystemSaveForm = Omit<SystemSaveParams, 'moduleKey' | 'id'>;

interface ModuleConfig {
  title: string;
  description: string;
  emptyText: string;
  createText?: string;
  extraLabel: string;
  extraPlaceholder: string;
  detailFields: Array<{ key: string; label: string }>;
  columns: TableProps<SystemRecord>['columns'];
  readonly?: boolean;
}

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
  { label: '待激活', value: 'pending' },
];

const editableStatusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
];

const logTypeOptions = [
  { label: '登录日志', value: 'login' },
  { label: '操作日志', value: 'operation' },
  { label: '接口日志', value: 'api' },
];

/**
 * 系统管理通用列表模板。
 * 通过模块配置驱动用户、角色、菜单、字典和日志页面，保持筛选、分页、详情和状态处理一致。
 * author: sunshengxian
 * 创建日期：2026-04-17
 */
function SystemModulePage({ moduleKey }: SystemModulePageProps) {
  const { message } = App.useApp();
  const config = moduleConfigs[moduleKey];
  const [searchForm] = Form.useForm<SystemSearchForm>();
  const [saveForm] = Form.useForm<SystemSaveForm>();
  const [records, setRecords] = useState<SystemRecord[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState<SystemRecord>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRecord, setEditingRecord] = useState<SystemRecord>();
  const [saving, setSaving] = useState(false);

  /**
   * 加载系统管理分页数据。
   */
  const loadRecords = useCallback(
    async (nextPageNo = pageNo, nextPageSize = pageSize) => {
      const values = searchForm.getFieldsValue();
      setLoading(true);
      try {
        const response = await fetchSystemPage({
          moduleKey,
          keyword: values.keyword,
          status: values.status,
          logType: values.logType,
          pageNo: nextPageNo,
          pageSize: nextPageSize,
        });
        if (response.code !== 0) {
          setErrorMessage(response.message || `${config.title}列表获取失败`);
          setRecords([]);
          setTotal(0);
          return;
        }
        setRecords(response.data.records);
        setPageNo(response.data.pageNo);
        setPageSize(response.data.pageSize);
        setTotal(response.data.total);
        setErrorMessage('');
      } catch {
        setErrorMessage(`${config.title}列表获取失败，请稍后重试`);
        setRecords([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [config.title, moduleKey, pageNo, pageSize, searchForm],
  );

  useEffect(() => {
    void loadRecords(1, pageSize);
  }, [moduleKey]);

  const columns = useMemo<TableProps<SystemRecord>['columns']>(
    () => [
      ...(config.columns || []),
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status: SystemStatus) => renderStatusTag(status),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 180,
      },
      {
        title: '操作',
        key: 'action',
        width: config.readonly ? 110 : 260,
        fixed: 'right',
        render: (_, record) => (
          <Space size={4}>
            <Button type="link" onClick={() => void openDetail(record.id)}>
              详情
            </Button>
            {!config.readonly ? (
              <>
                <Access action={`system:${getActionScope(moduleKey)}:edit`}>
                  <Button type="link" onClick={() => openEditModal(record)}>
                    编辑
                  </Button>
                </Access>
                <Access action={`system:${getActionScope(moduleKey)}:status`}>
                  <Popconfirm
                    title={record.status === 'active' ? '确认停用该记录？' : '确认启用该记录？'}
                    onConfirm={() => void handleStatusChange(record)}
                  >
                    <Button type="link">
                      {record.status === 'active' ? '停用' : '启用'}
                    </Button>
                  </Popconfirm>
                </Access>
                {renderBusinessAction(moduleKey, record, message)}
              </>
            ) : null}
          </Space>
        ),
      },
    ],
    [config.columns, config.readonly, message, moduleKey],
  );

  /**
   * 执行筛选查询。
   */
  const handleSearch = () => {
    void loadRecords(1, pageSize);
  };

  /**
   * 重置筛选条件。
   */
  const handleReset = () => {
    searchForm.resetFields();
    void loadRecords(1, pageSize);
  };

  /**
   * 响应表格分页变化。
   */
  const handleTableChange: TableProps<SystemRecord>['onChange'] = (pagination) => {
    void loadRecords(pagination.current || 1, pagination.pageSize || pageSize);
  };

  /**
   * 打开详情抽屉。
   */
  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await fetchSystemDetail(id);
      if (response.code !== 0 || !response.data) {
        message.error(response.message || `${config.title}详情获取失败`);
        setDetailRecord(undefined);
      } else {
        setDetailRecord(response.data);
      }
    } catch {
      message.error(`${config.title}详情获取失败，请稍后重试`);
      setDetailRecord(undefined);
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * 打开新增弹窗。
   */
  const openCreateModal = () => {
    setModalMode('create');
    setEditingRecord(undefined);
    saveForm.resetFields();
    saveForm.setFieldsValue({ status: 'active' });
    setModalOpen(true);
  };

  /**
   * 打开编辑弹窗。
   */
  const openEditModal = (record: SystemRecord) => {
    setModalMode('edit');
    setEditingRecord(record);
    saveForm.setFieldsValue({
      name: record.name,
      code: record.code,
      status: record.status,
      owner: record.owner,
      description: record.description,
      avatarUrl: String(record.avatarUrl || ''),
      extraValue: getExtraValue(moduleKey, record),
    });
    setModalOpen(true);
  };

  /**
   * 保存新增或编辑表单。
   */
  const handleSave = async () => {
    const values = await saveForm.validateFields();
    if (moduleKey === 'logs') {
      return;
    }
    setSaving(true);
    try {
      const response = await saveSystemRecord({
        ...values,
        moduleKey,
        id: editingRecord?.id,
      });
      if (response.code !== 0) {
        message.error(response.message || `${config.title}保存失败`);
        return;
      }
      message.success(response.message);
      setModalOpen(false);
      void loadRecords(modalMode === 'create' ? 1 : pageNo, pageSize);
    } catch {
      message.error(`${config.title}保存失败，请稍后重试`);
    } finally {
      setSaving(false);
    }
  };

  /**
   * 更新记录启停状态。
   */
  const handleStatusChange = async (record: SystemRecord) => {
    const nextStatus = record.status === 'active' ? 'disabled' : 'active';
    const response = await updateSystemStatus(record.id, nextStatus);
    if (response.code !== 0) {
      message.error(response.message || '状态更新失败');
      return;
    }
    message.success(response.message);
    void loadRecords(pageNo, pageSize);
  };

  return (
    <div className="page-stack">
      {errorMessage ? <Alert message={errorMessage} type="error" showIcon /> : null}

      <Card>
        <Form form={searchForm} layout="inline" className="query-form" onFinish={handleSearch}>
          <Form.Item label="关键字" name="keyword">
            <Input placeholder="名称 / 编码 / 描述" allowClear />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              allowClear
              placeholder="全部状态"
              style={{ width: 140 }}
              options={statusOptions}
            />
          </Form.Item>
          {moduleKey === 'logs' ? (
            <Form.Item label="日志类型" name="logType">
              <Select
                allowClear
                placeholder="全部类型"
                style={{ width: 140 }}
                options={logTypeOptions}
              />
            </Form.Item>
          ) : null}
          <Form.Item>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={config.title}
        extra={
          config.readonly ? null : (
            <Access action={`system:${getActionScope(moduleKey)}:add`}>
              <Button type="primary" onClick={openCreateModal}>
                {config.createText || '新增'}
              </Button>
            </Access>
          )
        }
      >
        <p className="system-module-desc">{config.description}</p>
        <Table<SystemRecord>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description={config.emptyText} /> }}
          pagination={{
            current: pageNo,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
          }}
          rowKey="id"
          scroll={{ x: config.readonly ? 1080 : 1180 }}
          onChange={handleTableChange}
        />
      </Card>

      <Drawer title={`${config.title}详情`} width={560} open={detailOpen} onClose={() => setDetailOpen(false)}>
        <Descriptions
          bordered
          column={1}
          size="small"
          items={buildDetailItems(config, detailRecord, detailLoading)}
        />
      </Drawer>

      <Modal
        title={modalMode === 'create' ? config.createText || `新增${config.title}` : `编辑${config.title}`}
        open={modalOpen}
        confirmLoading={saving}
        destroyOnHidden
        forceRender
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSave()}
      >
        <Form form={saveForm} layout="vertical" className="query-save-form">
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" maxLength={40} />
          </Form.Item>
          <Form.Item label="编码" name="code" rules={[{ required: true, message: '请输入编码' }]}>
            <Input placeholder="请输入唯一编码" maxLength={60} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={editableStatusOptions} />
          </Form.Item>
          <Form.Item label="负责人" name="owner" rules={[{ required: true, message: '请输入负责人' }]}>
            <Input placeholder="请输入负责人或负责团队" maxLength={30} />
          </Form.Item>
          <Form.Item label={config.extraLabel} name="extraValue">
            <Input placeholder={config.extraPlaceholder} maxLength={60} />
          </Form.Item>
          {moduleKey === 'users' && (
            <Form.Item label="头像地址" name="avatarUrl">
              <Input placeholder="请输入头像 URL，或由个人设置上传后自动维护" maxLength={500} />
            </Form.Item>
          )}
          <Form.Item label="描述" name="description" rules={[{ required: true, message: '请输入描述' }]}>
            <Input.TextArea placeholder="请输入用途说明" rows={4} maxLength={160} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

const moduleConfigs: Record<SystemModuleKey, ModuleConfig> = {
  users: {
    title: '用户管理',
    description: '维护后台用户、筛选、详情、新增/编辑、状态切换、重置密码占位和分配角色入口。',
    emptyText: '暂无用户数据',
    createText: '新增用户',
    extraLabel: '角色',
    extraPlaceholder: '请输入角色名称',
    detailFields: [
      { key: 'name', label: '用户名称' },
      { key: 'code', label: '登录账号' },
      { key: 'avatarUrl', label: '头像地址' },
      { key: 'department', label: '所属部门' },
      { key: 'roleNames', label: '角色' },
      { key: 'lastLoginAt', label: '最近登录' },
      { key: 'owner', label: '负责人' },
      { key: 'status', label: '状态' },
      { key: 'createdAt', label: '创建时间' },
      { key: 'updatedAt', label: '更新时间' },
      { key: 'description', label: '描述' },
    ],
    columns: [
      {
        title: '用户',
        dataIndex: 'name',
        width: 220,
        render: (_, record) => (
          <Space size={12}>
            <Avatar src={resolveAvatarDisplayUrl(record.avatarUrl)}>
              {record.name.slice(0, 1).toUpperCase()}
            </Avatar>
            <div className="query-name-cell">
              <strong>{record.name}</strong>
              <span>{record.code}</span>
            </div>
          </Space>
        ),
      },
      { title: '部门', dataIndex: 'department', width: 140 },
      { title: '角色', dataIndex: 'roleNames', width: 150 },
      { title: '最近登录', dataIndex: 'lastLoginAt', width: 180 },
    ],
  },
  roles: {
    title: '角色管理',
    description: '维护角色列表、详情、新增/编辑、状态切换和权限分配入口。',
    emptyText: '暂无角色数据',
    createText: '新增角色',
    extraLabel: '数据范围',
    extraPlaceholder: '请输入数据范围',
    detailFields: [
      { key: 'name', label: '角色名称' },
      { key: 'code', label: '角色编码' },
      { key: 'dataScope', label: '数据范围' },
      { key: 'userCount', label: '用户数' },
      { key: 'owner', label: '负责人' },
      { key: 'status', label: '状态' },
      { key: 'createdAt', label: '创建时间' },
      { key: 'updatedAt', label: '更新时间' },
      { key: 'description', label: '描述' },
    ],
    columns: [
      {
        title: '角色',
        dataIndex: 'name',
        width: 220,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.name}</strong>
            <span>{record.code}</span>
          </div>
        ),
      },
      { title: '数据范围', dataIndex: 'dataScope', width: 140 },
      { title: '用户数', dataIndex: 'userCount', width: 100, align: 'right' },
      { title: '负责人', dataIndex: 'owner', width: 140 },
    ],
  },
  menus: {
    title: '菜单管理',
    description: '维护多级菜单树、菜单类型、排序、路由路径和权限编码字段模板。',
    emptyText: '暂无菜单数据',
    createText: '新增菜单',
    extraLabel: '菜单类型',
    extraPlaceholder: '请输入目录 / 菜单 / 按钮',
    detailFields: [
      { key: 'name', label: '菜单名称' },
      { key: 'code', label: '菜单编码' },
      { key: 'menuType', label: '菜单类型' },
      { key: 'routePath', label: '路由路径' },
      { key: 'permissionCode', label: '权限编码' },
      { key: 'orderNo', label: '排序' },
      { key: 'status', label: '状态' },
      { key: 'createdAt', label: '创建时间' },
      { key: 'updatedAt', label: '更新时间' },
      { key: 'description', label: '描述' },
    ],
    columns: [
      {
        title: '菜单',
        dataIndex: 'name',
        width: 220,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.name}</strong>
            <span>{record.code}</span>
          </div>
        ),
      },
      { title: '类型', dataIndex: 'menuType', width: 100 },
      { title: '路由路径', dataIndex: 'routePath', width: 180 },
      { title: '权限编码', dataIndex: 'permissionCode', width: 180 },
      { title: '排序', dataIndex: 'orderNo', width: 80, align: 'right' },
    ],
  },
  dicts: {
    title: '字典管理',
    description: '维护字典类型、字典项数量、状态、排序和缓存刷新入口。',
    emptyText: '暂无字典数据',
    createText: '新增字典',
    extraLabel: '字典类型',
    extraPlaceholder: '请输入系统字典或业务字典',
    detailFields: [
      { key: 'name', label: '字典名称' },
      { key: 'code', label: '字典编码' },
      { key: 'dictType', label: '字典类型' },
      { key: 'itemCount', label: '字典项数量' },
      { key: 'cacheKey', label: '缓存键' },
      { key: 'owner', label: '负责人' },
      { key: 'status', label: '状态' },
      { key: 'createdAt', label: '创建时间' },
      { key: 'updatedAt', label: '更新时间' },
      { key: 'description', label: '描述' },
    ],
    columns: [
      {
        title: '字典',
        dataIndex: 'name',
        width: 220,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.name}</strong>
            <span>{record.code}</span>
          </div>
        ),
      },
      { title: '类型', dataIndex: 'dictType', width: 120 },
      { title: '字典项', dataIndex: 'itemCount', width: 100, align: 'right' },
      { title: '缓存键', dataIndex: 'cacheKey', width: 180 },
    ],
  },
  logs: {
    title: '日志管理',
    description: '提供登录日志、操作日志、接口日志列表和筛选模板，用于后续接入真实审计接口。',
    emptyText: '暂无日志数据',
    extraLabel: '日志类型',
    extraPlaceholder: '请输入日志类型',
    readonly: true,
    detailFields: [
      { key: 'name', label: '日志名称' },
      { key: 'logType', label: '日志类型' },
      { key: 'owner', label: '操作人' },
      { key: 'target', label: '目标对象' },
      { key: 'ipAddress', label: 'IP 地址' },
      { key: 'result', label: '结果' },
      { key: 'durationMs', label: '耗时(ms)' },
      { key: 'status', label: '状态' },
      { key: 'createdAt', label: '发生时间' },
      { key: 'description', label: '描述' },
    ],
    columns: [
      {
        title: '日志',
        dataIndex: 'name',
        width: 240,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.name}</strong>
            <span>{record.code}</span>
          </div>
        ),
      },
      { title: '类型', dataIndex: 'logType', width: 110 },
      { title: '操作人', dataIndex: 'owner', width: 110 },
      { title: '目标', dataIndex: 'target', width: 180 },
      { title: '结果', dataIndex: 'result', width: 90 },
      { title: '耗时(ms)', dataIndex: 'durationMs', width: 100, align: 'right' },
    ],
  },
};

/**
 * 渲染启停状态。
 */
function renderStatusTag(status: SystemStatus) {
  if (status === 'active') {
    return <Tag color="success">启用</Tag>;
  }
  if (status === 'pending') {
    return <Tag color="processing">待激活</Tag>;
  }
  return <Tag>停用</Tag>;
}

/**
 * 构建详情抽屉描述项。
 */
function buildDetailItems(config: ModuleConfig, record?: SystemRecord, loading?: boolean) {
  if (loading) {
    return [{ key: 'loading', label: '加载状态', children: '加载中' }];
  }
  if (!record) {
    return [{ key: 'empty', label: '加载状态', children: '暂无详情' }];
  }
  return config.detailFields.map((field) => ({
    key: field.key,
    label: field.label,
    children: field.key === 'status' ? renderStatusTag(record.status) : String(record[field.key] || '-'),
  }));
}

function getActionScope(moduleKey: SystemModuleKey) {
  return moduleKey === 'users'
    ? 'user'
    : moduleKey === 'roles'
      ? 'role'
      : moduleKey === 'menus'
        ? 'menu'
        : moduleKey === 'dicts'
          ? 'dict'
          : 'log';
}

function getExtraValue(moduleKey: SystemModuleKey, record: SystemRecord) {
  if (moduleKey === 'users') {
    return String(record.roleNames || '');
  }
  if (moduleKey === 'roles') {
    return String(record.dataScope || '');
  }
  if (moduleKey === 'menus') {
    return String(record.menuType || '');
  }
  if (moduleKey === 'dicts') {
    return String(record.dictType || '');
  }
  return String(record.logType || '');
}

function renderBusinessAction(
  moduleKey: SystemModuleKey,
  record: SystemRecord,
  message: ReturnType<typeof App.useApp>['message'],
) {
  if (moduleKey === 'users') {
    return (
      <>
        <Access action="system:user:reset">
          <Button type="link" onClick={() => message.info(`已预留 ${record.name} 的重置密码入口`)}>
            重置密码
          </Button>
        </Access>
        <Access action="system:user:assign-role">
          <Button type="link" onClick={() => message.info(`已预留 ${record.name} 的分配角色入口`)}>
            分配角色
          </Button>
        </Access>
      </>
    );
  }
  if (moduleKey === 'roles') {
    return (
      <Access action="system:role:assign-permission">
        <Button type="link" onClick={() => message.info(`已预留 ${record.name} 的权限分配入口`)}>
          分配权限
        </Button>
      </Access>
    );
  }
  if (moduleKey === 'dicts') {
    return (
      <Access action="system:dict:refresh">
        <Button type="link" onClick={() => message.info(`已触发 ${record.name} 的缓存刷新占位`)}>
          刷新缓存
        </Button>
      </Access>
    );
  }
  return null;
}

export default SystemModulePage;

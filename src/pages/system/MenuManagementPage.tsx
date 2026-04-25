import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps, TreeSelectProps } from 'antd';
import {
  Alert,
  App,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  TreeSelect,
} from 'antd';
import { Access } from '@/components/Access';
import EntityDetailDrawer, { type DetailField } from '@/components/admin/EntityDetailDrawer';
import SubmitModalForm from '@/components/admin/SubmitModalForm';
import {
  fetchSystemMenuTree,
  saveSystemMenu,
  updateSystemMenuStatus,
} from '@/services/system';
import type {
  SystemMenuRecord,
  SystemMenuSaveParams,
  SystemMenuType,
  SystemStatus,
} from '@/types/system';

interface MenuSearchForm {
  keyword?: string;
  status?: SystemStatus;
}

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
];

const menuTypeOptions: Array<{ label: string; value: SystemMenuType }> = [
  { label: '目录', value: 'catalog' },
  { label: '菜单', value: 'menu' },
  { label: '隐藏', value: 'hidden' },
  { label: '外链', value: 'external' },
];

const iconOptions = [
  'DashboardOutlined',
  'AppstoreOutlined',
  'SearchOutlined',
  'LineChartOutlined',
  'KeyOutlined',
  'UserOutlined',
  'TeamOutlined',
  'MenuOutlined',
  'BookOutlined',
  'FileSearchOutlined',
  'SettingOutlined',
].map((icon) => ({ label: icon, value: icon }));

const detailFields: Array<DetailField<SystemMenuRecord>> = [
  { key: 'name', label: '菜单名称', render: (record) => record.name },
  { key: 'code', label: '菜单编码', render: (record) => record.code },
  { key: 'parentId', label: '父级菜单', render: (record) => record.parentId || '根目录' },
  { key: 'menuType', label: '菜单类型', render: (record) => renderMenuTypeTag(record.menuType) },
  { key: 'icon', label: '图标', render: (record) => record.icon || '-' },
  { key: 'orderNo', label: '排序', render: (record) => record.orderNo },
  { key: 'routePath', label: '路由路径', render: (record) => record.routePath || '-' },
  { key: 'permissionCode', label: '权限编码', render: (record) => record.permissionCode || '-' },
  { key: 'externalLink', label: '外链地址', render: (record) => record.externalLink || '-' },
  { key: 'status', label: '状态', render: (record) => renderStatusTag(record.status) },
  { key: 'updatedAt', label: '更新时间', render: (record) => record.updatedAt },
  { key: 'description', label: '描述', render: (record) => record.description },
];

/**
 * 菜单管理页面。
 * 提供多级树形表格、新增编辑父级选择、状态切换和动态路由权限字段维护。
 * author: sunshengxian
 * 创建日期：2026-04-17
 */
function MenuManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<MenuSearchForm>();
  const [saveForm] = Form.useForm<SystemMenuSaveParams>();
  const [menus, setMenus] = useState<SystemMenuRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<SystemMenuRecord>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRecord, setEditingRecord] = useState<SystemMenuRecord>();
  const [saving, setSaving] = useState(false);

  const loadMenus = useCallback(async () => {
    const values = searchForm.getFieldsValue();
    setLoading(true);
    try {
      const response = await fetchSystemMenuTree(values);
      if (response.code !== 0) {
        setErrorMessage(response.message || '菜单列表获取失败');
        setMenus([]);
        return;
      }
      setMenus(response.data);
      setErrorMessage('');
    } catch {
      setErrorMessage('菜单列表获取失败，请稍后重试');
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [searchForm]);

  useEffect(() => {
    void loadMenus();
  }, [loadMenus]);

  const parentTreeData = useMemo(
    () => [
      { title: '根目录', value: '', key: 'root' },
      ...buildParentTreeData(menus, editingRecord?.id),
    ],
    [editingRecord?.id, menus],
  );

  const columns = useMemo<TableProps<SystemMenuRecord>['columns']>(
    () => [
      {
        title: '菜单名称',
        dataIndex: 'name',
        width: 240,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.name}</strong>
            <span>{record.code}</span>
          </div>
        ),
      },
      {
        title: '类型',
        dataIndex: 'menuType',
        width: 90,
        render: (type: SystemMenuType) => renderMenuTypeTag(type),
      },
      { title: '图标', dataIndex: 'icon', width: 150, render: (icon) => icon || '-' },
      { title: '排序', dataIndex: 'orderNo', width: 80, align: 'right' },
      { title: '路由路径', dataIndex: 'routePath', width: 180, render: (path) => path || '-' },
      { title: '权限编码', dataIndex: 'permissionCode', width: 180, render: (code) => code || '-' },
      {
        title: '状态',
        dataIndex: 'status',
        width: 90,
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
        fixed: 'right',
        width: 220,
        render: (_, record) => (
          <Space size={4}>
            <Button type="link" onClick={() => openDetail(record)}>
              详情
            </Button>
            <Access action="system:menu:edit">
              <Button type="link" onClick={() => openEditModal(record)}>
                编辑
              </Button>
            </Access>
            <Access action="system:menu:status">
              <Popconfirm
                title={record.status === 'active' ? '确认停用该菜单？' : '确认启用该菜单？'}
                onConfirm={() => void handleStatusChange(record)}
              >
                <Button type="link">{record.status === 'active' ? '停用' : '启用'}</Button>
              </Popconfirm>
            </Access>
          </Space>
        ),
      },
    ],
    [],
  );

  function handleSearch() {
    void loadMenus();
  }

  function handleReset() {
    searchForm.resetFields();
    void loadMenus();
  }

  function openDetail(record: SystemMenuRecord) {
    setDetailRecord(record);
    setDetailOpen(true);
  }

  function openCreateModal() {
    setModalMode('create');
    setEditingRecord(undefined);
    saveForm.resetFields();
    saveForm.setFieldsValue({
      parentId: '',
      menuType: 'menu',
      status: 'active',
      orderNo: 99,
    });
    setModalOpen(true);
  }

  function openEditModal(record: SystemMenuRecord) {
    setModalMode('edit');
    setEditingRecord(record);
    saveForm.setFieldsValue({
      id: record.id,
      parentId: record.parentId || '',
      name: record.name,
      code: record.code,
      status: record.status,
      description: record.description,
      menuType: record.menuType,
      icon: record.icon,
      routePath: record.routePath,
      permissionCode: record.permissionCode,
      externalLink: record.externalLink,
      orderNo: record.orderNo,
    });
    setModalOpen(true);
  }

  async function handleSave(values: SystemMenuSaveParams) {
    setSaving(true);
    try {
      const response = await saveSystemMenu({ ...values, id: editingRecord?.id });
      if (response.code !== 0) {
        message.error(response.message || '菜单保存失败');
        return;
      }
      message.success(response.message);
      setModalOpen(false);
      void loadMenus();
    } catch {
      message.error('菜单保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(record: SystemMenuRecord) {
    const nextStatus = record.status === 'active' ? 'disabled' : 'active';
    const response = await updateSystemMenuStatus(record.id, nextStatus);
    if (response.code !== 0) {
      message.error(response.message || '菜单状态更新失败');
      return;
    }
    message.success(response.message);
    void loadMenus();
  }

  return (
    <div className="page-stack">
      {errorMessage ? <Alert message={errorMessage} type="error" showIcon /> : null}

      <Card>
        <Form form={searchForm} layout="inline" className="query-form" onFinish={handleSearch}>
          <Form.Item label="关键字" name="keyword">
            <Input placeholder="名称 / 编码 / 路由 / 权限" allowClear />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select allowClear placeholder="全部状态" style={{ width: 140 }} options={statusOptions} />
          </Form.Item>
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
        title="菜单管理"
        extra={
          <Access action="system:menu:add">
            <Button type="primary" onClick={openCreateModal}>
              新增菜单
            </Button>
          </Access>
        }
      >
        <p className="system-module-desc">
          维护目录、菜单、隐藏路由和外链节点，字段与动态菜单和权限编码保持一致。
        </p>
        <Table<SystemMenuRecord>
          columns={columns}
          dataSource={menus}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无菜单数据" /> }}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1380 }}
          expandable={{ defaultExpandAllRows: true }}
        />
      </Card>

      <EntityDetailDrawer<SystemMenuRecord>
        title="菜单详情"
        width={560}
        open={detailOpen}
        record={detailRecord}
        fields={detailFields}
        onClose={() => setDetailOpen(false)}
      />

      <SubmitModalForm<SystemMenuSaveParams>
        title={modalMode === 'create' ? '新增菜单' : '编辑菜单'}
        open={modalOpen}
        form={saveForm}
        loading={saving}
        className="query-save-form"
        onCancel={() => setModalOpen(false)}
        onFinish={handleSave}
      >
        <Form.Item label="父级菜单" name="parentId">
          <TreeSelect allowClear placeholder="请选择父级菜单" treeDefaultExpandAll treeData={parentTreeData} />
        </Form.Item>
        <Form.Item label="菜单名称" name="name" rules={[{ required: true, message: '请输入菜单名称' }]}>
          <Input placeholder="请输入菜单名称" maxLength={40} />
        </Form.Item>
        <Form.Item label="菜单编码" name="code" rules={[{ required: true, message: '请输入菜单编码' }]}>
          <Input placeholder="如 system_menu" maxLength={60} />
        </Form.Item>
        <Form.Item label="菜单类型" name="menuType" rules={[{ required: true, message: '请选择菜单类型' }]}>
          <Select options={menuTypeOptions} />
        </Form.Item>
        <Form.Item label="图标" name="icon">
          <Select allowClear showSearch placeholder="选择 Ant Design Icon 名称" options={iconOptions} />
        </Form.Item>
        <Form.Item label="排序" name="orderNo" rules={[{ required: true, message: '请输入排序值' }]}>
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="路由路径" name="routePath">
          <Input placeholder="如 /system/menus，目录可留空" maxLength={120} />
        </Form.Item>
        <Form.Item label="权限编码" name="permissionCode">
          <Input placeholder="如 system:menu:view" maxLength={120} />
        </Form.Item>
        <Form.Item label="外链地址" name="externalLink">
          <Input placeholder="外链类型填写 https://..." maxLength={180} />
        </Form.Item>
        <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
          <Select options={statusOptions} />
        </Form.Item>
        <Form.Item label="描述" name="description" rules={[{ required: true, message: '请输入描述' }]}>
          <Input.TextArea placeholder="请输入用途说明" rows={4} maxLength={160} />
        </Form.Item>
      </SubmitModalForm>
    </div>
  );
}

function buildParentTreeData(
  menus: SystemMenuRecord[],
  editingId?: string,
): NonNullable<TreeSelectProps['treeData']> {
  return menus.map((menu) => ({
    title: menu.name,
    value: menu.id,
    key: menu.id,
    disabled: menu.id === editingId,
    children: menu.children ? buildParentTreeData(menu.children, editingId) : undefined,
  }));
}

function renderMenuTypeTag(type: SystemMenuType) {
  const colorMap: Record<SystemMenuType, string> = {
    catalog: 'blue',
    menu: 'green',
    hidden: 'orange',
    external: 'purple',
  };
  const labelMap: Record<SystemMenuType, string> = {
    catalog: '目录',
    menu: '菜单',
    hidden: '隐藏',
    external: '外链',
  };
  return <Tag color={colorMap[type]}>{labelMap[type]}</Tag>;
}

function renderStatusTag(status: SystemStatus) {
  return status === 'active' ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>;
}

export default MenuManagementPage;

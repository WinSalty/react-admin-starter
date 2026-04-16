import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { Access } from '@/components/Access';
import {
  fetchQueryDetail,
  fetchQueryPage,
  saveQueryRecord,
} from '@/services/query';
import type { QueryRecord, QuerySaveParams, QueryStatus } from '@/types/query';

const { Title, Paragraph } = Typography;

interface QuerySearchForm {
  keyword?: string;
  status?: QueryStatus;
}

type QuerySaveForm = Omit<QuerySaveParams, 'id'>;

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
];

/**
 * 查询管理列表页面，提供筛选、分页、详情、新增和编辑模板能力。
 * 按钮权限已接入 Access 组件控制，无权限时按钮隐藏。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function QueryList() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<QuerySearchForm>();
  const [saveForm] = Form.useForm<QuerySaveForm>();
  const [records, setRecords] = useState<QueryRecord[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState<QueryRecord>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRecord, setEditingRecord] = useState<QueryRecord>();
  const [saving, setSaving] = useState(false);

  /**
   * 加载查询配置分页数据。
   */
  const loadRecords = useCallback(
    async (nextPageNo = pageNo, nextPageSize = pageSize) => {
      const values = searchForm.getFieldsValue();
      setLoading(true);
      try {
        const response = await fetchQueryPage({
          keyword: values.keyword,
          status: values.status,
          pageNo: nextPageNo,
          pageSize: nextPageSize,
        });
        if (response.code !== 0) {
          setErrorMessage(response.message || '查询配置列表获取失败');
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
        setErrorMessage('查询配置列表获取失败，请稍后重试');
        setRecords([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [pageNo, pageSize, searchForm],
  );

  useEffect(() => {
    void loadRecords(1, pageSize);
  }, []);

  const columns = useMemo<TableProps<QueryRecord>['columns']>(
    () => [
      {
        title: '名称',
        dataIndex: 'name',
        width: 220,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.name}</strong>
            <span>{record.code}</span>
          </div>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status: QueryStatus) => renderStatusTag(status),
      },
      {
        title: '负责人',
        dataIndex: 'owner',
        width: 120,
      },
      {
        title: '调用次数',
        dataIndex: 'callCount',
        width: 120,
        align: 'right',
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 180,
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
        fixed: 'right',
        render: (_, record) => (
          <Space size={4}>
            <Button type="link" onClick={() => void openDetail(record.id)}>
              详情
            </Button>
            <Access action="query:edit">
              <Button type="link" onClick={() => openEditModal(record)}>
                编辑
              </Button>
            </Access>
          </Space>
        ),
      },
    ],
    [],
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
  const handleTableChange: TableProps<QueryRecord>['onChange'] = (pagination) => {
    void loadRecords(pagination.current || 1, pagination.pageSize || pageSize);
  };

  /**
   * 打开详情抽屉。
   */
  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await fetchQueryDetail(id);
      if (response.code !== 0 || !response.data) {
        message.error(response.message || '查询配置详情获取失败');
        setDetailRecord(undefined);
      } else {
        setDetailRecord(response.data);
      }
    } catch {
      message.error('查询配置详情获取失败，请稍后重试');
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
  const openEditModal = (record: QueryRecord) => {
    setModalMode('edit');
    setEditingRecord(record);
    saveForm.setFieldsValue({
      name: record.name,
      code: record.code,
      status: record.status,
      owner: record.owner,
      description: record.description,
    });
    setModalOpen(true);
  };

  /**
   * 保存新增或编辑表单。
   */
  const handleSave = async () => {
    const values = await saveForm.validateFields();
    setSaving(true);
    try {
      const response = await saveQueryRecord({
        ...values,
        id: editingRecord?.id,
      });
      if (response.code !== 0) {
        message.error(response.message || '查询配置保存失败');
        return;
      }
      message.success(response.message);
      setModalOpen(false);
      void loadRecords(modalMode === 'create' ? 1 : pageNo, pageSize);
    } catch {
      message.error('查询配置保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="compact-page-header">
        <div>
          <Title level={3}>查询管理</Title>
          <Paragraph>标准列表页模板，支持筛选、分页、详情和新增编辑。</Paragraph>
        </div>
      </div>

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
              style={{ width: 160 }}
              options={statusOptions}
            />
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
        title="查询结果"
        extra={
          <Access action="query:add">
            <Button type="primary" onClick={openCreateModal}>
              新增
            </Button>
          </Access>
        }
      >
        <Table<QueryRecord>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无查询结果" /> }}
          pagination={{
            current: pageNo,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
          }}
          rowKey="id"
          scroll={{ x: 980 }}
          onChange={handleTableChange}
        />
      </Card>

      <Drawer
        title="查询配置详情"
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        <Descriptions
          bordered
          column={1}
          size="small"
          items={buildDetailItems(detailRecord, detailLoading)}
        />
      </Drawer>

      <Modal
        title={modalMode === 'create' ? '新增查询配置' : '编辑查询配置'}
        open={modalOpen}
        confirmLoading={saving}
        destroyOnHidden
        forceRender
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSave()}
      >
        <Form form={saveForm} layout="vertical" className="query-save-form">
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入查询配置名称" maxLength={40} />
          </Form.Item>
          <Form.Item
            label="编码"
            name="code"
            rules={[{ required: true, message: '请输入编码' }]}
          >
            <Input placeholder="请输入唯一编码" maxLength={60} />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item
            label="负责人"
            name="owner"
            rules={[{ required: true, message: '请输入负责人' }]}
          >
            <Input placeholder="请输入负责人或负责团队" maxLength={30} />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input.TextArea placeholder="请输入查询配置用途" rows={4} maxLength={160} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/**
 * 渲染查询配置状态。
 */
function renderStatusTag(status: QueryStatus) {
  return status === 'active' ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>;
}

/**
 * 构建详情抽屉描述项。
 */
function buildDetailItems(record?: QueryRecord, loading?: boolean) {
  if (loading) {
    return [{ key: 'loading', label: '加载状态', children: '加载中' }];
  }
  if (!record) {
    return [{ key: 'empty', label: '加载状态', children: '暂无详情' }];
  }
  return [
    { key: 'name', label: '名称', children: record.name },
    { key: 'code', label: '编码', children: record.code },
    { key: 'status', label: '状态', children: renderStatusTag(record.status) },
    { key: 'owner', label: '负责人', children: record.owner },
    { key: 'callCount', label: '调用次数', children: record.callCount },
    { key: 'createdAt', label: '创建时间', children: record.createdAt },
    { key: 'updatedAt', label: '更新时间', children: record.updatedAt },
    { key: 'description', label: '描述', children: record.description },
  ];
}

export default QueryList;

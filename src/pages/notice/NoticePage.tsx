import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import {
  Alert,
  App,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import { Access } from '@/components/Access';
import {
  fetchNoticeDetail,
  fetchNoticePage,
  saveNotice,
  updateNoticeStatus,
} from '@/services/notice';
import type {
  NoticeListParams,
  NoticePriority,
  NoticeRecord,
  NoticeSaveParams,
  NoticeStatus,
  NoticeType,
} from '@/types/notice';

interface NoticeSearchForm {
  keyword?: string;
  status?: NoticeStatus;
  noticeType?: NoticeType;
}

interface NoticeSaveForm {
  title: string;
  content: string;
  noticeType: NoticeType;
  priority: NoticePriority;
  publishTime?: dayjs.Dayjs;
  expireTime?: dayjs.Dayjs;
  status: NoticeStatus;
  sortOrder?: number;
}

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
  { label: '草稿', value: 'draft' },
  { label: '已过期', value: 'expired' },
];

const noticeTypeOptions = [
  { label: '系统公告', value: 'system' },
  { label: '业务通知', value: 'business' },
  { label: '安全提醒', value: 'security' },
  { label: '活动消息', value: 'event' },
];

const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
];

/**
 * 公告管理页面。
 * author: sunshengxian
 * 创建日期：2026-04-18
 */
function NoticePage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<NoticeSearchForm>();
  const [saveForm] = Form.useForm<NoticeSaveForm>();
  const [records, setRecords] = useState<NoticeRecord[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState<NoticeRecord>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRecord, setEditingRecord] = useState<NoticeRecord>();
  const [saving, setSaving] = useState(false);

  const loadRecords = useCallback(
    async (nextPageNo = pageNo, nextPageSize = pageSize) => {
      const values = searchForm.getFieldsValue();
      setLoading(true);
      try {
        const params: NoticeListParams = {
          keyword: values.keyword,
          status: values.status,
          noticeType: values.noticeType,
          pageNo: nextPageNo,
          pageSize: nextPageSize,
        };
        const response = await fetchNoticePage(params);
        if (response.code !== 0) {
          setErrorMessage(response.message || '公告列表获取失败');
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
        setErrorMessage('公告列表获取失败，请稍后重试');
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

  const columns = useMemo<TableProps<NoticeRecord>['columns']>(
    () => [
      {
        title: '标题',
        dataIndex: 'title',
        width: 240,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.title}</strong>
            <span>{renderNoticeType(record.noticeType)}</span>
          </div>
        ),
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        width: 100,
        render: (priority: string) => renderPriorityTag(priority),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status: NoticeStatus) => renderStatusTag(status),
      },
      { title: '发布人', dataIndex: 'publisherName', width: 120 },
      { title: '发布时间', dataIndex: 'publishTime', width: 180 },
      { title: '过期时间', dataIndex: 'expireTime', width: 180 },
      {
        title: '操作',
        key: 'action',
        width: 220,
        fixed: 'right',
        render: (_, record) => (
          <Space size={4}>
            <Button type="link" onClick={() => void openDetail(record.id)}>
              详情
            </Button>
            <Access action="system:notice:edit">
              <Button type="link" onClick={() => openEditModal(record)}>
                编辑
              </Button>
            </Access>
            <Access action="system:notice:status">
              <Popconfirm
                title={record.status === 'active' ? '确认停用该公告？' : '确认启用该公告？'}
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

  const handleSearch = () => {
    void loadRecords(1, pageSize);
  };

  const handleReset = () => {
    searchForm.resetFields();
    void loadRecords(1, pageSize);
  };

  const handleTableChange: TableProps<NoticeRecord>['onChange'] = (pagination) => {
    void loadRecords(pagination.current || 1, pagination.pageSize || pageSize);
  };

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await fetchNoticeDetail(id);
      if (response.code !== 0 || !response.data) {
        message.error(response.message || '公告详情获取失败');
        setDetailRecord(undefined);
      } else {
        setDetailRecord(response.data);
      }
    } catch {
      message.error('公告详情获取失败，请稍后重试');
      setDetailRecord(undefined);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingRecord(undefined);
    saveForm.resetFields();
    saveForm.setFieldsValue({
      status: 'draft',
      noticeType: 'system',
      priority: 'medium',
      sortOrder: 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (record: NoticeRecord) => {
    setModalMode('edit');
    setEditingRecord(record);
    saveForm.setFieldsValue({
      title: record.title,
      content: record.content,
      noticeType: normalizeNoticeType(record.noticeType),
      priority: normalizePriority(record.priority),
      publishTime: record.publishTime ? dayjs(record.publishTime) : undefined,
      expireTime: record.expireTime ? dayjs(record.expireTime) : undefined,
      status: record.status,
      sortOrder: record.sortOrder,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await saveForm.validateFields();
    setSaving(true);
    try {
      const params: NoticeSaveParams = {
        id: editingRecord?.id,
        title: values.title,
        content: values.content,
        noticeType: values.noticeType,
        priority: values.priority,
        publishTime: values.publishTime?.format('YYYY-MM-DD HH:mm:ss'),
        expireTime: values.expireTime?.format('YYYY-MM-DD HH:mm:ss'),
        status: values.status,
        sortOrder: values.sortOrder,
      };
      const response = await saveNotice(params);
      if (response.code !== 0) {
        message.error(response.message || '公告保存失败');
        return;
      }
      message.success(response.message);
      setModalOpen(false);
      void loadRecords(modalMode === 'create' ? 1 : pageNo, pageSize);
    } catch {
      message.error('公告保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (record: NoticeRecord) => {
    const nextStatus: NoticeStatus = record.status === 'active' ? 'disabled' : 'active';
    const response = await updateNoticeStatus(record.id, nextStatus);
    if (response.code !== 0) {
      message.error(response.message || '公告状态更新失败');
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
            <Input placeholder="标题 / 内容" allowClear />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select allowClear placeholder="全部状态" style={{ width: 140 }} options={statusOptions} />
          </Form.Item>
          <Form.Item label="类型" name="noticeType">
            <Select allowClear placeholder="全部类型" style={{ width: 140 }} options={noticeTypeOptions} />
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
        title="公告管理"
        extra={
          <Access action="system:notice:add">
            <Button type="primary" onClick={openCreateModal}>
              新增公告
            </Button>
          </Access>
        }
      >
        <Table<NoticeRecord>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无公告数据" /> }}
          pagination={{
            current: pageNo,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
          }}
          rowKey="id"
          scroll={{ x: 1200 }}
          onChange={handleTableChange}
        />
      </Card>

      <Drawer title="公告详情" width={640} open={detailOpen} onClose={() => setDetailOpen(false)}>
        <Descriptions bordered column={1} size="small" items={buildDetailItems(detailRecord, detailLoading)} />
      </Drawer>

      <Modal
        title={modalMode === 'create' ? '新增公告' : '编辑公告'}
        open={modalOpen}
        confirmLoading={saving}
        destroyOnHidden
        forceRender
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSave()}
      >
        <Form form={saveForm} layout="vertical">
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入公告标题" maxLength={80} />
          </Form.Item>
          <Form.Item label="类型" name="noticeType" rules={[{ required: true, message: '请选择类型' }]}>
            <Select options={noticeTypeOptions} />
          </Form.Item>
          <Form.Item label="优先级" name="priority" rules={[{ required: true, message: '请选择优先级' }]}>
            <Select options={priorityOptions} />
          </Form.Item>
          <Form.Item label="发布时间" name="publishTime">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="过期时间" name="expireTime">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="内容" name="content" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={6} placeholder="请输入公告内容" maxLength={1000} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function renderStatusTag(status: NoticeStatus) {
  if (status === 'active') {
    return <Tag color="success">启用</Tag>;
  }
  if (status === 'draft') {
    return <Tag color="gold">草稿</Tag>;
  }
  if (status === 'expired') {
    return <Tag color="default">已过期</Tag>;
  }
  return <Tag>停用</Tag>;
}

function renderPriorityTag(priority: string) {
  if (priority === 'urgent') {
    return <Tag color="red">紧急</Tag>;
  }
  if (priority === 'high') {
    return <Tag color="volcano">高</Tag>;
  }
  if (priority === 'medium') {
    return <Tag color="blue">中</Tag>;
  }
  return <Tag color="default">低</Tag>;
}

function renderNoticeType(noticeType: string) {
  return noticeTypeOptions.find((item) => item.value === noticeType)?.label || noticeType;
}

function buildDetailItems(record?: NoticeRecord, loading?: boolean) {
  if (loading) {
    return [{ key: 'loading', label: '加载状态', children: '加载中' }];
  }
  if (!record) {
    return [{ key: 'empty', label: '加载状态', children: '暂无详情' }];
  }
  return [
    { key: 'title', label: '标题', children: record.title },
    { key: 'type', label: '类型', children: renderNoticeType(record.noticeType) },
    { key: 'priority', label: '优先级', children: renderPriorityTag(record.priority) },
    { key: 'status', label: '状态', children: renderStatusTag(record.status) },
    { key: 'publisherName', label: '发布人', children: record.publisherName || '-' },
    { key: 'publishTime', label: '发布时间', children: record.publishTime || '-' },
    { key: 'expireTime', label: '过期时间', children: record.expireTime || '-' },
    { key: 'sortOrder', label: '排序', children: record.sortOrder },
    { key: 'content', label: '内容', children: record.content },
  ];
}

function normalizeNoticeType(value: string): NoticeType {
  if (value === 'business' || value === 'security' || value === 'event') {
    return value;
  }
  return 'system';
}

function normalizePriority(value: string): NoticePriority {
  if (value === 'low' || value === 'high' || value === 'urgent') {
    return value;
  }
  return 'medium';
}

export default NoticePage;

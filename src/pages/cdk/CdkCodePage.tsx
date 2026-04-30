import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import { App, Button, DatePicker, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { Access } from '@/components/Access';
import ListSearchCard from '@/components/admin/ListSearchCard';
import ListTableCard from '@/components/admin/ListTableCard';
import {
  createCdkExtractLink,
  disableCdkExtractLink,
  fetchCdkCodes,
  fetchCdkExtractAccessRecords,
  fetchCdkExtractLinks,
  updateCdkCodeStatus,
} from '@/services/cdk';
import type { CdkCode, CdkExtractAccessRecord, CdkExtractLink } from '@/types/cdk';
import { copyText } from '@/utils/clipboard';

interface CodeSearchForm {
  keyword?: string;
  batchId?: string;
  status?: string;
}

interface ExtractLinkForm {
  maxAccessCount: number;
  expireAt: dayjs.Dayjs;
  remark?: string;
}

const statusOptions = [
  { label: '可兑换', value: 'active' },
  { label: '已兑换', value: 'redeemed' },
  { label: '已失效', value: 'disabled' },
];

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DEFAULT_EXTRACT_ACCESS_COUNT = 1;
const DEFAULT_EXTRACT_EXPIRE_HOURS = 24;

/**
 * CDK 管理页面。
 * 默认展示全部 CDK，并支持按批次筛选、复制和变更 CDK 状态，不提供删除入口。
 * author: sunshengxian
 * 创建日期：2026-04-26
 */
function CdkCodePage() {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const [searchForm] = Form.useForm<CodeSearchForm>();
  const [extractForm] = Form.useForm<ExtractLinkForm>();
  const [records, setRecords] = useState<CdkCode[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [extractModalOpen, setExtractModalOpen] = useState(false);
  const [extractSaving, setExtractSaving] = useState(false);
  const [extractRecord, setExtractRecord] = useState<CdkCode>();
  const [extractLinks, setExtractLinks] = useState<CdkExtractLink[]>([]);
  const [createdExtractUrl, setCreatedExtractUrl] = useState('');
  const [accessRecords, setAccessRecords] = useState<CdkExtractAccessRecord[]>([]);
  const [accessRecordsLoading, setAccessRecordsLoading] = useState(false);

  const loadRecords = useCallback(
    async (nextPageNo = pageNo, nextPageSize = pageSize) => {
      const values = searchForm.getFieldsValue();
      setLoading(true);
      try {
        const response = await fetchCdkCodes({
          keyword: values.keyword,
          batchId: values.batchId,
          status: values.status,
          pageNo: nextPageNo,
          pageSize: nextPageSize,
        });
        if (response.code !== 0) {
          message.error(response.message || 'CDK 获取失败');
          return;
        }
        setRecords(response.data.records);
        setPageNo(response.data.pageNo);
        setPageSize(response.data.pageSize);
        setTotal(response.data.total);
      } finally {
        setLoading(false);
      }
    },
    [message, pageNo, pageSize, searchForm],
  );

  useEffect(() => {
    const batchId = searchParams.get('batchId') || undefined;
    searchForm.setFieldsValue({ batchId });
    void loadRecords(1, pageSize);
  }, []);

  const handleCopy = async (cdk: string) => {
    if (await copyText(cdk)) {
      message.success('已复制');
      return;
    }
    message.error('复制失败，请手动选中文本复制');
  };

  const handleStatus = async (record: CdkCode, status: string) => {
    const response = await updateCdkCodeStatus(record.id, status);
    if (response.code !== 0) {
      message.error(response.message || '状态更新失败');
      return;
    }
    message.success(response.message);
    void loadRecords(pageNo, pageSize);
  };

  const openExtractModal = async (record: CdkCode) => {
    setExtractRecord(record);
    setCreatedExtractUrl('');
    setAccessRecords([]);
    extractForm.setFieldsValue({
      maxAccessCount: DEFAULT_EXTRACT_ACCESS_COUNT,
      expireAt: dayjs().add(DEFAULT_EXTRACT_EXPIRE_HOURS, 'hour'),
      remark: '',
    });
    setExtractModalOpen(true);
    await loadExtractLinks(record.id);
  };

  const loadExtractLinks = async (codeId: string) => {
    const response = await fetchCdkExtractLinks(codeId);
    if (response.code !== 0) {
      message.error(response.message || '提取链接获取失败');
      return;
    }
    setExtractLinks(response.data);
  };

  const handleCreateExtractLink = async (values: ExtractLinkForm) => {
    if (!extractRecord) {
      return;
    }
    setExtractSaving(true);
    try {
      const response = await createCdkExtractLink(extractRecord.id, {
        maxAccessCount: values.maxAccessCount,
        expireAt: values.expireAt.format(DATE_TIME_FORMAT),
        remark: values.remark,
      });
      if (response.code !== 0) {
        message.error(response.message || '提取链接生成失败');
        return;
      }
      setCreatedExtractUrl(response.data.url || '');
      message.success('提取链接已生成');
      await loadExtractLinks(extractRecord.id);
    } finally {
      setExtractSaving(false);
    }
  };

  const handleCopyExtractUrl = async (url: string) => {
    if (await copyText(url)) {
      message.success('链接已复制');
      return;
    }
    message.error('复制失败，请手动选中文本复制');
  };

  const handleDisableExtractLink = async (link: CdkExtractLink) => {
    const response = await disableCdkExtractLink(link.id, '管理员手动停用');
    if (response.code !== 0) {
      message.error(response.message || '提取链接停用失败');
      return;
    }
    message.success(response.message);
    if (extractRecord) {
      await loadExtractLinks(extractRecord.id);
    }
  };

  const loadAccessRecords = async (link: CdkExtractLink) => {
    setAccessRecordsLoading(true);
    try {
      const response = await fetchCdkExtractAccessRecords(link.id, { pageNo: 1, pageSize: 10 });
      if (response.code !== 0) {
        message.error(response.message || '访问记录获取失败');
        return;
      }
      setAccessRecords(response.data.records);
    } finally {
      setAccessRecordsLoading(false);
    }
  };

  const columns = useMemo<TableProps<CdkCode>['columns']>(
    () => [
      {
        title: 'CDK',
        dataIndex: 'cdk',
        width: 360,
        render: (_, record) => (
          <Space size={8}>
            <Input value={record.cdk || '历史码不可查看'} readOnly disabled={!record.cdk} style={{ width: 280 }} />
            <Button size="small" icon={<CopyOutlined />} disabled={!record.cdk} onClick={() => void handleCopy(record.cdk)}>
              复制
            </Button>
          </Space>
        ),
      },
      {
        title: '批次',
        key: 'batch',
        width: 260,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.batchName || '-'}</strong>
            <span>{record.batchNo || `ID ${record.batchId}`}</span>
          </div>
        ),
      },
      { title: '积分', dataIndex: 'benefitConfig', width: 120, render: renderBenefitConfig },
      { title: '状态', dataIndex: 'status', width: 110, render: (_, record) => renderCodeStatus(record.status, record.batchStatus) },
      { title: '批次状态', dataIndex: 'batchStatus', width: 110, render: renderBatchStatus },
      { title: '有效期', key: 'valid', width: 300, render: (_, record) => `${record.validFrom || '-'} 至 ${record.validTo || '-'}` },
      {
        title: '兑换信息',
        key: 'redeem',
        width: 260,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.redeemedUserId || '-'}</strong>
            <span>{record.redeemRecordNo || record.redeemedAt || '-'}</span>
          </div>
        ),
      },
      { title: '创建时间', dataIndex: 'createdAt', width: 180 },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 230,
        render: (_, record) => (
          <Space size={4}>
            <Access action="cdk:code:status">
              <Popconfirm title="确认失效该 CDK？" onConfirm={() => void handleStatus(record, 'disabled')}>
                <Button type="link" danger disabled={record.status !== 'active'}>
                  失效
                </Button>
              </Popconfirm>
              <Popconfirm title="确认启用该 CDK？" onConfirm={() => void handleStatus(record, 'active')}>
                <Button type="link" disabled={record.status !== 'disabled' || record.batchStatus !== 'active'}>
                  启用
                </Button>
              </Popconfirm>
            </Access>
            <Access action="cdk:code:extract-link:create">
              <Button type="link" icon={<LinkOutlined />} disabled={!canCreateExtractLink(record)} onClick={() => void openExtractModal(record)}>
                提取链接
              </Button>
            </Access>
          </Space>
        ),
      },
    ],
    [handleStatus, openExtractModal],
  );

  const handleSearch = () => {
    void loadRecords(1, pageSize);
  };

  const handleReset = () => {
    searchForm.resetFields();
    void loadRecords(1, pageSize);
  };

  return (
    <div className="page-stack">
      <ListSearchCard<CodeSearchForm>
        form={searchForm}
        loading={loading}
        onReset={handleReset}
        onFinish={handleSearch}
      >
        <Form.Item label="关键字" name="keyword">
          <Input placeholder="批次号 / 名称" allowClear />
        </Form.Item>
        <Form.Item label="批次ID" name="batchId">
          <Input placeholder="精确批次ID" allowClear />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select allowClear placeholder="全部状态" style={{ width: 140 }} options={statusOptions} />
        </Form.Item>
      </ListSearchCard>

      <ListTableCard title="CDK 管理">
        <Table<CdkCode>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无 CDK" /> }}
          pagination={{ current: pageNo, pageSize, total, showSizeChanger: true, showTotal: (count) => `共 ${count} 条` }}
          rowKey="id"
          scroll={{ x: 1860 }}
          onChange={(pagination) => void loadRecords(pagination.current || 1, pagination.pageSize || pageSize)}
        />
      </ListTableCard>

      <Modal
        title="CDK 提取链接"
        open={extractModalOpen}
        width={860}
        confirmLoading={extractSaving}
        okText="生成链接"
        cancelText="关闭"
        destroyOnHidden
        onCancel={() => setExtractModalOpen(false)}
        onOk={() => extractForm.submit()}
      >
        <Form form={extractForm} layout="vertical" onFinish={(values) => void handleCreateExtractLink(values)}>
          <Form.Item label="访问次数" name="maxAccessCount" rules={[{ required: true, message: '请输入访问次数' }]}>
            <InputNumber min={1} max={100} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="过期时间" name="expireAt" rules={[{ required: true, message: '请选择过期时间' }]}>
            <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} maxLength={512} showCount placeholder="可填写发放渠道、活动或工单信息" />
          </Form.Item>
        </Form>

        {createdExtractUrl ? (
          <div className="cdk-extract-created-url">
            <Input value={createdExtractUrl} readOnly />
            <Button type="primary" icon={<CopyOutlined />} onClick={() => void handleCopyExtractUrl(createdExtractUrl)}>
              复制链接
            </Button>
          </div>
        ) : null}

        <Table<CdkExtractLink>
          size="small"
          rowKey="id"
          dataSource={extractLinks}
          pagination={false}
          style={{ marginTop: 16 }}
          columns={[
            { title: '链接编号', dataIndex: 'linkNo', width: 180 },
            { title: '状态', dataIndex: 'status', width: 100, render: renderExtractLinkStatus },
            { title: '访问次数', key: 'count', width: 120, render: (_, record) => `${record.accessedCount} / ${record.maxAccessCount}` },
            { title: '过期时间', dataIndex: 'expireAt', width: 180 },
            { title: '创建人', dataIndex: 'createdBy', width: 110 },
            {
              title: '操作',
              key: 'action',
              width: 160,
              render: (_, record) => (
                <Space size={4}>
                  <Button type="link" onClick={() => void loadAccessRecords(record)}>
                    访问记录
                  </Button>
                  <Popconfirm title="确认停用该链接？" onConfirm={() => void handleDisableExtractLink(record)}>
                    <Button type="link" danger disabled={record.status !== 'active'}>
                      停用
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />

        <Table<CdkExtractAccessRecord>
          size="small"
          rowKey="id"
          loading={accessRecordsLoading}
          dataSource={accessRecords}
          pagination={false}
          style={{ marginTop: 16 }}
          columns={[
            { title: '访问结果', dataIndex: 'result', width: 100, render: renderAccessResult },
            { title: 'IP', dataIndex: 'clientIp', width: 130 },
            { title: '浏览器指纹', dataIndex: 'browserFingerprint', ellipsis: true },
            { title: '失败原因', dataIndex: 'failureMessage', ellipsis: true },
            { title: '访问时间', dataIndex: 'createdAt', width: 180 },
          ]}
        />
      </Modal>
    </div>
  );
}

function canCreateExtractLink(record: CdkCode) {
  return record.status === 'active' && record.batchStatus === 'active' && !!record.cdk;
}

function renderCodeStatus(status: string, batchStatus?: string) {
  if (status === 'active' && batchStatus && batchStatus !== 'active') {
    return <Tag color="error">批次失效</Tag>;
  }
  if (status === 'active') {
    return <Tag color="success">可兑换</Tag>;
  }
  if (status === 'redeemed') {
    return <Tag color="processing">已兑换</Tag>;
  }
  return <Tag color="error">已失效</Tag>;
}

function renderBatchStatus(status?: string) {
  if (status === 'active') {
    return <Tag color="success">可用</Tag>;
  }
  if (status === 'paused') {
    return <Tag color="warning">不可用</Tag>;
  }
  if (status === 'voided') {
    return <Tag color="error">整批失效</Tag>;
  }
  return <Tag>{status || '-'}</Tag>;
}

function renderExtractLinkStatus(status: string) {
  if (status === 'active') {
    return <Tag color="success">可用</Tag>;
  }
  if (status === 'exhausted') {
    return <Tag color="warning">次数用完</Tag>;
  }
  if (status === 'disabled') {
    return <Tag color="error">已停用</Tag>;
  }
  return <Tag>{status}</Tag>;
}

function renderAccessResult(result: string) {
  if (result === 'success') {
    return <Tag color="success">成功</Tag>;
  }
  return <Tag color="error">失败</Tag>;
}

function renderBenefitConfig(value?: string) {
  if (!value) {
    return '-';
  }
  try {
    const config = JSON.parse(value) as { points?: number };
    return `${(config.points || 0).toLocaleString()} 积分`;
  } catch {
    return '-';
  }
}

export default CdkCodePage;

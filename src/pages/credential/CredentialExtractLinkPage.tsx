import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, DatePicker, Drawer, Empty, Form, Input, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { CopyOutlined, EyeOutlined, LinkOutlined, StopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Access } from '@/components/Access';
import ListSearchCard from '@/components/admin/ListSearchCard';
import ListTableCard from '@/components/admin/ListTableCard';
import SubmitModalForm from '@/components/admin/SubmitModalForm';
import { buildCredentialExpireAtPresets } from '@/pages/credential/credentialDatePresets';
import {
  copyCredentialExtractLinkUrl,
  disableCredentialExtractLink,
  extendCredentialExtractLink,
  fetchCredentialExtractAccessRecords,
  fetchCredentialExtractLinkItems,
  fetchCredentialExtractLinks,
  reissueCredentialExtractLink,
} from '@/services/credential';
import type { CredentialExtractAccessRecord, CredentialExtractLink, CredentialItem } from '@/types/credential';
import { copyText } from '@/utils/clipboard';

interface SearchForm {
  keyword?: string;
  status?: string;
}

interface ExtendForm {
  expireAt: dayjs.Dayjs;
}

/**
 * 凭证提取链接管理页。
 * 支持全局查看、筛选、复制 URL、停用、延期以及查看覆盖明细和访问记录。
 * author: sunshengxian
 * 创建日期：2026-05-01
 */
function CredentialExtractLinkPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<SearchForm>();
  const [extendForm] = Form.useForm<ExtendForm>();
  const [records, setRecords] = useState<CredentialExtractLink[]>([]);
  const [items, setItems] = useState<CredentialItem[]>([]);
  const [accessRecords, setAccessRecords] = useState<CredentialExtractAccessRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState<CredentialExtractLink>();
  const [extendRecord, setExtendRecord] = useState<CredentialExtractLink>();
  const expireAtPresets = buildCredentialExpireAtPresets();

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const response = await fetchCredentialExtractLinks({ ...values, pageNo: 1, pageSize: 100 });
      if (response.code !== 0) {
        message.error(response.message || '提取链接获取失败');
        return;
      }
      setRecords(response.data.records);
    } finally {
      setLoading(false);
    }
  }, [form, message]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const handleReset = () => {
    form.resetFields();
    void loadRecords();
  };

  const openDetail = async (record: CredentialExtractLink) => {
    setDetailRecord(record);
    setDetailLoading(true);
    try {
      const [itemResponse, accessResponse] = await Promise.all([
        fetchCredentialExtractLinkItems(record.id),
        fetchCredentialExtractAccessRecords(record.id, { pageNo: 1, pageSize: 20 }),
      ]);
      setItems(itemResponse.code === 0 ? itemResponse.data : []);
      setAccessRecords(accessResponse.code === 0 ? accessResponse.data.records : []);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCopyUrl = async (record: CredentialExtractLink) => {
    const response = await copyCredentialExtractLinkUrl(record.id);
    if (response.code !== 0) {
      message.error(response.message || '复制链接失败');
      return;
    }
    if (await copyText(response.data.url)) {
      message.success('提取链接已复制');
    }
  };

  const handleDisable = async (record: CredentialExtractLink) => {
    const response = await disableCredentialExtractLink(record.id, '管理员手动停用');
    if (response.code !== 0) {
      message.error(response.message || '停用失败');
      return;
    }
    message.success('已停用');
    void loadRecords();
  };

  const handleReissue = async (record: CredentialExtractLink) => {
    const response = await reissueCredentialExtractLink(record.id, {
      itemsPerLink: Math.max(record.itemCount || 1, 1),
      maxAccessCount: record.maxAccessCount || 3,
      remark: record.remark || '补发链接',
    });
    if (response.code !== 0) {
      message.error(response.message || '补发失败');
      return;
    }
    if (await copyText(response.data.url)) {
      message.success('补发链接已复制');
    }
    void loadRecords();
  };

  const openExtendModal = (record: CredentialExtractLink) => {
    setExtendRecord(record);
    extendForm.setFieldsValue({
      expireAt: record.expireAt ? dayjs(record.expireAt) : dayjs().add(1, 'day'),
    });
  };

  const handleExtend = async (values: ExtendForm) => {
    if (!extendRecord) {
      return;
    }
    const response = await extendCredentialExtractLink(extendRecord.id, values.expireAt.format('YYYY-MM-DD HH:mm:ss'));
    if (response.code !== 0) {
      message.error(response.message || '延期失败');
      return;
    }
    message.success('延期成功');
    setExtendRecord(undefined);
    void loadRecords();
  };

  const columns = useMemo<TableProps<CredentialExtractLink>['columns']>(
    () => [
      {
        title: '链接',
        dataIndex: 'linkNo',
        width: 240,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.linkNo}</strong>
            <span>{record.remark || '-'}</span>
          </div>
        ),
      },
      { title: '分类', dataIndex: 'categoryName', width: 150, render: (value) => value || '-' },
      {
        title: '批次',
        key: 'batch',
        width: 220,
        render: (_, record) => record.batchName || record.batchNo || '-',
      },
      {
        title: '凭证数',
        dataIndex: 'itemCount',
        width: 100,
        render: (value: number) => value?.toLocaleString() || 0,
      },
      {
        title: '访问次数',
        key: 'access',
        width: 150,
        render: (_, record) => `${record.accessedCount || 0}/${record.maxAccessCount || 0}`,
      },
      { title: '状态', dataIndex: 'status', width: 110, render: renderStatusTag },
      { title: '过期时间', dataIndex: 'expireAt', width: 180, render: (value) => value || '-' },
      { title: '最近访问', dataIndex: 'lastAccessedAt', width: 180, render: (value) => value || '-' },
      {
        title: '操作',
        key: 'actions',
        fixed: 'right',
        width: 260,
        render: (_, record) => (
          <Space size={4}>
            <Button type="link" icon={<EyeOutlined />} onClick={() => void openDetail(record)}>
              详情
            </Button>
            <Access action="credential:extract-link:copy">
              <Button type="link" icon={<CopyOutlined />} disabled={!record.copyable || record.status !== 'active'} onClick={() => void handleCopyUrl(record)}>
                复制
              </Button>
            </Access>
            <Access action="credential:extract-link:extend">
              <Button type="link" disabled={record.status !== 'active'} onClick={() => openExtendModal(record)}>
                延期
              </Button>
            </Access>
            <Access action="credential:extract-link:disable">
              <Popconfirm title="确认停用该提取链接？" onConfirm={() => void handleDisable(record)}>
                <Button type="link" danger icon={<StopOutlined />} disabled={record.status !== 'active'}>
                  停用
                </Button>
              </Popconfirm>
            </Access>
            <Access action="credential:extract-link:reissue">
              <Button type="link" onClick={() => void handleReissue(record)}>
                补发
              </Button>
            </Access>
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <div className="page-stack">
      <ListSearchCard<SearchForm> form={form} loading={loading} onFinish={() => void loadRecords()} onReset={handleReset}>
        <Form.Item label="关键字" name="keyword">
          <Input allowClear placeholder="链接编号 / 批次" style={{ width: 220 }} />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            allowClear
            placeholder="全部状态"
            style={{ width: 140 }}
            options={[
              { label: '启用', value: 'active' },
              { label: '停用', value: 'disabled' },
              { label: '过期', value: 'expired' },
              { label: '用尽', value: 'exhausted' },
            ]}
          />
        </Form.Item>
      </ListSearchCard>

      <ListTableCard title={<span className="wallet-section-title"><span><LinkOutlined /></span>提取链接</span>}>
        <Table<CredentialExtractLink>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无提取链接" /> }}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1540 }}
        />
      </ListTableCard>

      <Drawer
        title={detailRecord ? `提取链接 ${detailRecord.linkNo}` : '提取链接详情'}
        width={960}
        open={!!detailRecord}
        onClose={() => setDetailRecord(undefined)}
      >
        <div className="page-stack">
          <ListTableCard title="关联凭证">
            <Table<CredentialItem>
              columns={itemColumns}
              dataSource={items}
              loading={detailLoading}
              locale={{ emptyText: <Empty description="暂无关联凭证" /> }}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 900 }}
            />
          </ListTableCard>
          <ListTableCard title="访问记录">
            <Table<CredentialExtractAccessRecord>
              columns={accessColumns}
              dataSource={accessRecords}
              loading={detailLoading}
              locale={{ emptyText: <Empty description="暂无访问记录" /> }}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 1100 }}
            />
          </ListTableCard>
        </div>
      </Drawer>

      <SubmitModalForm<ExtendForm>
        title="延期提取链接"
        open={!!extendRecord}
        form={extendForm}
        onCancel={() => setExtendRecord(undefined)}
        onFinish={(values) => void handleExtend(values)}
      >
        <Form.Item label="过期时间" name="expireAt" rules={[{ required: true, message: '请选择过期时间' }]}>
          <DatePicker showTime presets={expireAtPresets} style={{ width: '100%' }} />
        </Form.Item>
      </SubmitModalForm>
    </div>
  );
}

const itemColumns: TableProps<CredentialItem>['columns'] = [
  { title: '编号', dataIndex: 'itemNo', width: 220 },
  { title: '脱敏值', dataIndex: 'secretMask', width: 220, render: (value) => value || '-' },
  { title: '来源', dataIndex: 'sourceType', width: 120 },
  { title: '状态', dataIndex: 'status', width: 120, render: renderStatusTag },
  { title: '消费时间', dataIndex: 'consumedAt', width: 180, render: (value) => value || '-' },
];

const accessColumns: TableProps<CredentialExtractAccessRecord>['columns'] = [
  { title: '流水号', dataIndex: 'accessNo', width: 220 },
  { title: '结果', dataIndex: 'success', width: 100, render: (value: boolean) => <Tag color={value ? 'success' : 'error'}>{value ? '成功' : '失败'}</Tag> },
  { title: '失败原因', dataIndex: 'failureReason', width: 160, render: (value) => value || '-' },
  { title: 'IP', dataIndex: 'clientIp', width: 140, render: (value) => value || '-' },
  { title: '指纹', dataIndex: 'browserFingerprint', width: 220, ellipsis: true },
  { title: '凭证数', dataIndex: 'itemCount', width: 100 },
  { title: '访问时间', dataIndex: 'createdAt', width: 180 },
];

function renderStatusTag(status: string) {
  const colorMap: Record<string, string> = {
    active: 'success',
    disabled: 'default',
    expired: 'warning',
    exhausted: 'volcano',
    linked: 'processing',
    extracted: 'blue',
    redeemed: 'purple',
  };
  return <Tag color={colorMap[status] || 'default'}>{status || '-'}</Tag>;
}

export default CredentialExtractLinkPage;

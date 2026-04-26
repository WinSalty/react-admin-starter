import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import { App, Button, DatePicker, Empty, Form, Input, InputNumber, Popconfirm, Progress, Select, Space, Spin, Table, Tag } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Access } from '@/components/Access';
import CreateButton from '@/components/admin/CreateButton';
import EntityDetailDrawer, { type DetailField } from '@/components/admin/EntityDetailDrawer';
import ListSearchCard from '@/components/admin/ListSearchCard';
import ListTableCard from '@/components/admin/ListTableCard';
import SubmitModalForm from '@/components/admin/SubmitModalForm';
import {
  createCdkBatch,
  fetchCdkCodes,
  fetchCdkBatches,
  voidCdkBatch,
} from '@/services/cdk';
import type { CdkBatch, CdkBatchCreateParams, CdkCode } from '@/types/cdk';
import { copyText } from '@/utils/clipboard';

interface BatchSearchForm {
  keyword?: string;
  status?: string;
}

interface BatchCreateForm {
  batchName?: string;
  points: number;
  totalCount: number;
  validRange: [dayjs.Dayjs, dayjs.Dayjs];
  remark?: string;
}

const statusOptions = [
  { label: '已启用', value: 'active' },
  { label: '已作废', value: 'voided' },
];

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const BENEFIT_TYPE_POINTS = 'points';
const DEFAULT_RISK_LEVEL = 'normal';
const DEFAULT_VALID_DAYS = 30;
const DEFAULT_POINTS = 100;
const DEFAULT_TOTAL_COUNT = 10;
const DETAIL_CODE_PAGE_SIZE = 100;

const detailFields: Array<DetailField<CdkBatch>> = [
  { key: 'batchName', label: '批次名称', render: (record) => record.batchName },
  { key: 'batchNo', label: '批次号', render: (record) => record.batchNo },
  { key: 'benefitConfig', label: '权益', render: (record) => renderBenefitConfig(record.benefitConfig) },
  { key: 'totalCount', label: '总数', render: (record) => record.totalCount },
  { key: 'generatedCount', label: '已生成', render: (record) => record.generatedCount },
  { key: 'redeemedCount', label: '已兑换', render: (record) => record.redeemedCount },
  { key: 'valid', label: '有效期', render: (record) => `${record.validFrom} 至 ${record.validTo}` },
  { key: 'status', label: '状态', render: (record) => renderBatchStatus(record.status) },
  { key: 'totalPoints', label: '积分总量', render: (record) => calculateTotalPoints(record).toLocaleString() },
  { key: 'createdAt', label: '创建时间', render: (record) => record.createdAt },
  { key: 'updatedAt', label: '更新时间', render: (record) => record.updatedAt },
];

/**
 * CDK 批次管理页面。
 * 作为积分 CDK 生成记录页，保留整批失效能力，具体码管理由 CDK 管理页统一承载。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
function CdkBatchPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<BatchSearchForm>();
  const [createForm] = Form.useForm<BatchCreateForm>();
  const [records, setRecords] = useState<CdkBatch[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<CdkBatch>();
  const [detailCodeText, setDetailCodeText] = useState('');
  const [detailCodeTotal, setDetailCodeTotal] = useState(0);
  const [detailCodesLoading, setDetailCodesLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadRecords = useCallback(
    async (nextPageNo = pageNo, nextPageSize = pageSize) => {
      const values = searchForm.getFieldsValue();
      setLoading(true);
      try {
        const response = await fetchCdkBatches({
          keyword: values.keyword,
          status: values.status,
          benefitType: BENEFIT_TYPE_POINTS,
          pageNo: nextPageNo,
          pageSize: nextPageSize,
        });
        if (response.code !== 0) {
          message.error(response.message || 'CDK 批次获取失败');
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
    void loadRecords(1, pageSize);
  }, []);

  const loadDetailCodes = useCallback(
    async (batchId: string) => {
      setDetailCodesLoading(true);
      try {
        const firstResponse = await fetchCdkCodes({
          batchId,
          pageNo: 1,
          pageSize: DETAIL_CODE_PAGE_SIZE,
        });
        if (firstResponse.code !== 0) {
          message.error(firstResponse.message || '批次 CDK 获取失败');
          return;
        }
        const codes = [...firstResponse.data.records];
        const totalCount = firstResponse.data.total;
        const pageCount = Math.ceil(totalCount / DETAIL_CODE_PAGE_SIZE);
        for (let currentPage = 2; currentPage <= pageCount; currentPage += 1) {
          const response = await fetchCdkCodes({
            batchId,
            pageNo: currentPage,
            pageSize: DETAIL_CODE_PAGE_SIZE,
          });
          if (response.code !== 0) {
            message.error(response.message || '批次 CDK 获取失败');
            return;
          }
          codes.push(...response.data.records);
        }
        setDetailCodeText(buildCodeText(codes));
        setDetailCodeTotal(totalCount);
      } finally {
        setDetailCodesLoading(false);
      }
    },
    [message],
  );

  const handleCopyAllCodes = async () => {
    if (!detailCodeText) {
      message.error('没有可复制 CDK');
      return;
    }
    if (await copyText(detailCodeText)) {
      message.success('已复制全部 CDK');
      return;
    }
    message.error('复制失败，请手动选中文本复制');
  };

  const columns = useMemo<TableProps<CdkBatch>['columns']>(
    () => [
      {
        title: '批次',
        dataIndex: 'batchName',
        width: 260,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.batchName}</strong>
            <span>{record.batchNo}</span>
          </div>
        ),
      },
      {
        title: '生成规则',
        key: 'rule',
        width: 220,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{renderBenefitConfig(record.benefitConfig)} / 张</strong>
            <span>{record.totalCount.toLocaleString()} 张，共 {calculateTotalPoints(record).toLocaleString()} 积分</span>
          </div>
        ),
      },
      {
        title: '兑换进度',
        key: 'progress',
        width: 220,
        render: (_, record) => {
          const percent = record.totalCount > 0 ? Math.round((record.redeemedCount / record.totalCount) * 100) : 0;
          return (
            <div className="query-name-cell">
              <Progress percent={percent} size="small" />
              <span>{record.redeemedCount.toLocaleString()} / {record.totalCount.toLocaleString()}</span>
            </div>
          );
        },
      },
      { title: '有效期', key: 'valid', width: 300, render: (_, record) => `${record.validFrom} 至 ${record.validTo}` },
      { title: '状态', dataIndex: 'status', width: 120, render: renderBatchStatus },
      { title: '创建人', dataIndex: 'createdBy', width: 120 },
      { title: '创建时间', dataIndex: 'createdAt', width: 180 },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 160,
        render: (_, record) => (
          <Space size={4}>
            <Button type="link" onClick={() => openDetail(record)}>
              详情
            </Button>
            <Access action="cdk:batch:void">
              <Popconfirm title="确认整批失效？" onConfirm={() => void handleVoid(record)}>
                <Button type="link" danger disabled={record.status === 'voided'}>
                  整批失效
                </Button>
              </Popconfirm>
            </Access>
          </Space>
        ),
      },
    ],
    [],
  );

  const openDetail = (record: CdkBatch) => {
    setDetailRecord(record);
    setDetailOpen(true);
    setDetailCodeText('');
    setDetailCodeTotal(0);
    void loadDetailCodes(record.id);
  };

  const handleSearch = () => {
    void loadRecords(1, pageSize);
  };

  const handleReset = () => {
    searchForm.resetFields();
    void loadRecords(1, pageSize);
  };

  const openCreateModal = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      totalCount: DEFAULT_TOTAL_COUNT,
      points: DEFAULT_POINTS,
      validRange: [dayjs(), dayjs().add(DEFAULT_VALID_DAYS, 'day')],
    });
    setModalOpen(true);
  };

  const handleCreate = async (values: BatchCreateForm) => {
    setSaving(true);
    try {
      const params: CdkBatchCreateParams = {
        batchName: values.batchName || `积分CDK-${dayjs().format('YYYYMMDDHHmm')}`,
        benefitType: BENEFIT_TYPE_POINTS,
        points: values.points,
        totalCount: values.totalCount,
        validFrom: values.validRange[0].format(DATE_TIME_FORMAT),
        validTo: values.validRange[1].format(DATE_TIME_FORMAT),
        riskLevel: DEFAULT_RISK_LEVEL,
        remark: values.remark,
      };
      const response = await createCdkBatch(params);
      if (response.code !== 0) {
        message.error(response.message || '创建失败');
        return;
      }
      message.success(response.message);
      setModalOpen(false);
      void loadRecords(1, pageSize);
    } finally {
      setSaving(false);
    }
  };

  const handleVoid = async (record: CdkBatch) => {
    await handleAction(() => voidCdkBatch(record.id));
  };

  const handleAction = async (action: () => Promise<{ code: number; message: string }>) => {
    const response = await action();
    if (response.code !== 0) {
      message.error(response.message || '操作失败');
      return;
    }
    message.success(response.message);
    void loadRecords(pageNo, pageSize);
  };

  return (
    <div className="page-stack">
      <ListSearchCard<BatchSearchForm>
        form={searchForm}
        loading={loading}
        onReset={handleReset}
        onFinish={handleSearch}
      >
        <Form.Item label="关键字" name="keyword">
          <Input placeholder="批次号 / 名称" allowClear />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select allowClear placeholder="全部状态" style={{ width: 140 }} options={statusOptions} />
        </Form.Item>
      </ListSearchCard>

      <ListTableCard
        title="积分 CDK 生成记录"
        extra={
          <Access action="cdk:batch:create">
            <CreateButton onClick={openCreateModal}>
              生成积分 CDK
            </CreateButton>
          </Access>
        }
      >
        <Table<CdkBatch>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无批次" /> }}
          pagination={{ current: pageNo, pageSize, total, showSizeChanger: true, showTotal: (count) => `共 ${count} 条` }}
          rowKey="id"
          scroll={{ x: 1480 }}
          onChange={(pagination) => void loadRecords(pagination.current || 1, pagination.pageSize || pageSize)}
        />
      </ListTableCard>

      <EntityDetailDrawer<CdkBatch>
        title="CDK 批次详情"
        width={920}
        open={detailOpen}
        record={detailRecord}
        fields={detailFields}
        onClose={() => setDetailOpen(false)}
      >
        <div style={{ marginTop: 16 }}>
          <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <strong>批次 CDK（{detailCodeTotal.toLocaleString()}）</strong>
            <Button icon={<CopyOutlined />} disabled={!detailCodeText} onClick={() => void handleCopyAllCodes()}>
              复制全部
            </Button>
          </Space>
          <Spin spinning={detailCodesLoading}>
            <Input.TextArea
              value={detailCodeText}
              readOnly
              rows={14}
              placeholder="暂无 CDK"
            />
          </Spin>
        </div>
      </EntityDetailDrawer>

      <SubmitModalForm<BatchCreateForm>
        title="生成积分 CDK"
        open={modalOpen}
        form={createForm}
        loading={saving}
        onCancel={() => setModalOpen(false)}
        onFinish={handleCreate}
      >
        <Form.Item label="批次名称" name="batchName">
          <Input maxLength={80} placeholder="不填自动使用当前时间命名" />
        </Form.Item>
        <Form.Item label="积分数量" name="points" rules={[{ required: true, message: '请输入积分数量' }]}>
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="生成数量" name="totalCount" rules={[{ required: true, message: '请输入生成数量' }]}>
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="有效期" name="validRange" rules={[{ required: true, message: '请选择有效期' }]}>
          <DatePicker.RangePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={3} maxLength={200} />
        </Form.Item>
      </SubmitModalForm>
    </div>
  );
}

function renderBatchStatus(status: string) {
  const statusMap: Record<string, { color: string; text: string }> = {
    active: { color: 'success', text: '可兑换' },
    paused: { color: 'warning', text: '不可用' },
    voided: { color: 'error', text: '整批失效' },
  };
  const matched = statusMap[status];
  return <Tag color={matched?.color || 'default'}>{matched?.text || status}</Tag>;
}

function renderBenefitConfig(value: string) {
  try {
    const config = JSON.parse(value) as { points?: number };
    return `${config.points || 0} 积分`;
  } catch {
    return '-';
  }
}

function calculateTotalPoints(record: CdkBatch) {
  try {
    const config = JSON.parse(record.benefitConfig) as { points?: number };
    return (config.points || 0) * record.totalCount;
  } catch {
    return 0;
  }
}

function buildCodeText(codes: CdkCode[]) {
  return codes.map((code) => code.cdk).filter(Boolean).join('\n');
}

export default CdkBatchPage;

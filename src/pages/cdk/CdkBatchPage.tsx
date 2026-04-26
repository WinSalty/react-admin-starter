import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import { App, Button, DatePicker, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Access } from '@/components/Access';
import CreateButton from '@/components/admin/CreateButton';
import EntityDetailDrawer, { type DetailField } from '@/components/admin/EntityDetailDrawer';
import ListSearchCard from '@/components/admin/ListSearchCard';
import ListTableCard from '@/components/admin/ListTableCard';
import SubmitModalForm from '@/components/admin/SubmitModalForm';
import {
  createCdkBatch,
  exportCdkBatch,
  fetchCdkBatches,
  pauseCdkBatch,
  voidCdkBatch,
} from '@/services/cdk';
import type { CdkBatch, CdkBatchCreateParams, CdkExportResult } from '@/types/cdk';

interface BatchSearchForm {
  keyword?: string;
  status?: string;
}

interface BatchCreateForm {
  batchName: string;
  points: number;
  totalCount: number;
  validFrom: dayjs.Dayjs;
  validTo: dayjs.Dayjs;
  riskLevel: string;
  remark?: string;
}

const statusOptions = [
  { label: '已启用', value: 'active' },
  { label: '已暂停', value: 'paused' },
  { label: '已作废', value: 'voided' },
];

const riskOptions = [
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '关键', value: 'critical' },
];

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const detailFields: Array<DetailField<CdkBatch>> = [
  { key: 'batchName', label: '批次名称', render: (record) => record.batchName },
  { key: 'batchNo', label: '批次号', render: (record) => record.batchNo },
  { key: 'benefitConfig', label: '权益', render: (record) => renderBenefitConfig(record.benefitConfig) },
  { key: 'totalCount', label: '总数', render: (record) => record.totalCount },
  { key: 'generatedCount', label: '已生成', render: (record) => record.generatedCount },
  { key: 'redeemedCount', label: '已兑换', render: (record) => record.redeemedCount },
  { key: 'valid', label: '有效期', render: (record) => `${record.validFrom} 至 ${record.validTo}` },
  { key: 'status', label: '状态', render: (record) => renderBatchStatus(record.status) },
  { key: 'riskLevel', label: '风险等级', render: (record) => renderRiskTag(record.riskLevel) },
  { key: 'exportCount', label: '导出次数', render: (record) => record.exportCount },
  { key: 'createdAt', label: '创建时间', render: (record) => record.createdAt },
  { key: 'updatedAt', label: '更新时间', render: (record) => record.updatedAt },
];

/**
 * CDK 批次管理页面。
 * 支持管理员直接生成批次、纯文本导出、在线查看、暂停和作废。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
function CdkBatchPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchForm] = Form.useForm<BatchSearchForm>();
  const [createForm] = Form.useForm<BatchCreateForm>();
  const [records, setRecords] = useState<CdkBatch[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<CdkBatch>();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exportResult, setExportResult] = useState<CdkExportResult>();

  const loadRecords = useCallback(
    async (nextPageNo = pageNo, nextPageSize = pageSize) => {
      const values = searchForm.getFieldsValue();
      setLoading(true);
      try {
        const response = await fetchCdkBatches({
          keyword: values.keyword,
          status: values.status,
          benefitType: 'points',
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

  const columns = useMemo<TableProps<CdkBatch>['columns']>(
    () => [
      {
        title: '批次',
        dataIndex: 'batchName',
        width: 240,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.batchName}</strong>
            <span>{record.batchNo}</span>
          </div>
        ),
      },
      { title: '权益', dataIndex: 'benefitConfig', width: 160, render: renderBenefitConfig },
      { title: '总数', dataIndex: 'totalCount', width: 90, align: 'right' },
      { title: '已生成', dataIndex: 'generatedCount', width: 90, align: 'right' },
      { title: '已兑换', dataIndex: 'redeemedCount', width: 90, align: 'right' },
      { title: '有效期', key: 'valid', width: 300, render: (_, record) => `${record.validFrom} 至 ${record.validTo}` },
      { title: '状态', dataIndex: 'status', width: 120, render: renderBatchStatus },
      { title: '风险', dataIndex: 'riskLevel', width: 100, render: renderRiskTag },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 280,
        render: (_, record) => (
          <Space size={4}>
            <Button type="link" onClick={() => openDetail(record)}>
              详情
            </Button>
            <Access action="cdk:code:view">
              <Button type="link" onClick={() => navigate(`/system/cdk/codes?batchId=${record.id}`)}>
                CDK
              </Button>
            </Access>
            <Access action="cdk:batch:export">
              <Button type="link" disabled={record.generatedCount <= 0} onClick={() => void handleExport(record)}>
                导出
              </Button>
            </Access>
            <Access action="cdk:batch:pause">
              <Button type="link" disabled={record.status !== 'active'} onClick={() => void handlePause(record)}>
                暂停
              </Button>
            </Access>
            <Access action="cdk:batch:void">
              <Popconfirm title="确认作废该批次？" onConfirm={() => void handleVoid(record)}>
                <Button type="link" danger disabled={record.status === 'voided'}>
                  作废
                </Button>
              </Popconfirm>
            </Access>
          </Space>
        ),
      },
    ],
    [navigate],
  );

  const openDetail = (record: CdkBatch) => {
    setDetailRecord(record);
    setDetailOpen(true);
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
      totalCount: 100,
      points: 100,
      riskLevel: 'normal',
      validFrom: dayjs(),
      validTo: dayjs().add(30, 'day'),
    });
    setModalOpen(true);
  };

  const handleCreate = async (values: BatchCreateForm) => {
    setSaving(true);
    try {
      const params: CdkBatchCreateParams = {
        batchName: values.batchName,
        benefitType: 'points',
        points: values.points,
        totalCount: values.totalCount,
        validFrom: values.validFrom.format(DATE_TIME_FORMAT),
        validTo: values.validTo.format(DATE_TIME_FORMAT),
        riskLevel: values.riskLevel,
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

  const handlePause = async (record: CdkBatch) => {
    await handleAction(() => pauseCdkBatch(record.id));
  };

  const handleVoid = async (record: CdkBatch) => {
    await handleAction(() => voidCdkBatch(record.id));
  };

  const handleExport = async (record: CdkBatch) => {
    const response = await exportCdkBatch(record.id);
    if (response.code !== 0) {
      message.error(response.message || '导出失败');
      return;
    }
    setExportResult(response.data);
    void loadRecords(pageNo, pageSize);
  };

  const handleCopyExport = async () => {
    if (!exportResult?.content) {
      return;
    }
    await navigator.clipboard.writeText(exportResult.content);
    message.success('已复制');
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
        title="CDK 批次"
        extra={
          <Access action="cdk:batch:create">
            <CreateButton onClick={openCreateModal}>
              新建批次
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
          scroll={{ x: 1360 }}
          onChange={(pagination) => void loadRecords(pagination.current || 1, pagination.pageSize || pageSize)}
        />
      </ListTableCard>

      <EntityDetailDrawer<CdkBatch>
        title="CDK 批次详情"
        width={640}
        open={detailOpen}
        record={detailRecord}
        fields={detailFields}
        onClose={() => setDetailOpen(false)}
      />

      <SubmitModalForm<BatchCreateForm>
        title="新建 CDK 批次"
        open={modalOpen}
        form={createForm}
        loading={saving}
        onCancel={() => setModalOpen(false)}
        onFinish={handleCreate}
      >
        <Form.Item label="批次名称" name="batchName" rules={[{ required: true, message: '请输入批次名称' }]}>
          <Input maxLength={80} />
        </Form.Item>
        <Form.Item label="积分数量" name="points" rules={[{ required: true, message: '请输入积分数量' }]}>
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="生成数量" name="totalCount" rules={[{ required: true, message: '请输入生成数量' }]}>
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="生效时间" name="validFrom" rules={[{ required: true, message: '请选择生效时间' }]}>
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="失效时间" name="validTo" rules={[{ required: true, message: '请选择失效时间' }]}>
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="风险等级" name="riskLevel" rules={[{ required: true, message: '请选择风险等级' }]}>
          <Select options={riskOptions} />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={3} maxLength={200} />
        </Form.Item>
      </SubmitModalForm>

      <Modal
        title="CDK 导出"
        open={!!exportResult}
        footer={(
          <Space>
            <Button onClick={handleCopyExport}>复制全部</Button>
            <Button type="primary" onClick={() => setExportResult(undefined)}>关闭</Button>
          </Space>
        )}
        width={760}
        onCancel={() => setExportResult(undefined)}
      >
        <p>批次：{exportResult?.batchNo}，数量：{exportResult?.count}</p>
        <p>文件：{exportResult?.fileName}，指纹：{exportResult?.fingerprint}</p>
        <Input.TextArea value={exportResult?.content} rows={12} readOnly />
      </Modal>
    </div>
  );
}

function renderBatchStatus(status: string) {
  const colorMap: Record<string, string> = {
    active: 'success',
    paused: 'warning',
    voided: 'error',
  };
  return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
}

function renderRiskTag(riskLevel: string) {
  if (riskLevel === 'critical') {
    return <Tag color="red">关键</Tag>;
  }
  if (riskLevel === 'high') {
    return <Tag color="volcano">高</Tag>;
  }
  return <Tag color="blue">普通</Tag>;
}

function renderBenefitConfig(value: string) {
  try {
    const config = JSON.parse(value) as { points?: number };
    return `${config.points || 0} 积分`;
  } catch {
    return '-';
  }
}

export default CdkBatchPage;

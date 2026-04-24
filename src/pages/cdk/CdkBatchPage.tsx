import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import { App, Button, Card, DatePicker, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { Access } from '@/components/Access';
import {
  approveCdkBatch,
  createCdkBatch,
  exportCdkBatch,
  fetchCdkBatches,
  pauseCdkBatch,
  secondApproveCdkBatch,
  submitCdkBatch,
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

interface BatchExportForm {
  exportPassword: string;
}

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '待审批', value: 'pending_approval' },
  { label: '已启用', value: 'active' },
  { label: '已暂停', value: 'paused' },
  { label: '已作废', value: 'voided' },
];

const riskOptions = [
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '关键', value: 'critical' },
];

/**
 * CDK 批次管理页面。
 * 支持批次创建、提交审批、审批生成、一次性导出、暂停和作废。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
function CdkBatchPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<BatchSearchForm>();
  const [createForm] = Form.useForm<BatchCreateForm>();
  const [exportForm] = Form.useForm<BatchExportForm>();
  const [records, setRecords] = useState<CdkBatch[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [exportingRecord, setExportingRecord] = useState<CdkBatch>();
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
        title: '审批',
        key: 'approval',
        width: 180,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.approvedBy || '-'}</strong>
            <span>{record.secondApprovedBy ? `复核：${record.secondApprovedBy}` : '待复核'}</span>
          </div>
        ),
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 300,
        render: (_, record) => (
          <Space size={4}>
            <Access action="cdk:batch:approve">
              <Button type="link" disabled={record.status !== 'draft'} onClick={() => void handleSubmit(record)}>
                提交
              </Button>
              <Popconfirm title="确认审批并生成 CDK？" onConfirm={() => void handleApprove(record)}>
                <Button type="link" disabled={record.status !== 'pending_approval'}>
                  审批
                </Button>
              </Popconfirm>
            </Access>
            <Access action="cdk:batch:second-approve">
              <Popconfirm title="确认二次复核并生成 CDK？" onConfirm={() => void handleSecondApprove(record)}>
                <Button type="link" disabled={record.status !== 'pending_approval' || !record.approvedBy}>
                  复核
                </Button>
              </Popconfirm>
            </Access>
            <Access action="cdk:batch:export">
              <Button type="link" disabled={record.status !== 'active'} onClick={() => openExportModal(record)}>
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
    [],
  );

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

  const handleCreate = async () => {
    const values = await createForm.validateFields();
    setSaving(true);
    try {
      const params: CdkBatchCreateParams = {
        batchName: values.batchName,
        benefitType: 'points',
        points: values.points,
        totalCount: values.totalCount,
        validFrom: values.validFrom.format('YYYY-MM-DD HH:mm:ss'),
        validTo: values.validTo.format('YYYY-MM-DD HH:mm:ss'),
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

  const handleSubmit = async (record: CdkBatch) => {
    await handleAction(() => submitCdkBatch(record.id));
  };

  const handleApprove = async (record: CdkBatch) => {
    await handleAction(() => approveCdkBatch(record.id));
  };

  const handleSecondApprove = async (record: CdkBatch) => {
    await handleAction(() => secondApproveCdkBatch(record.id));
  };

  const handlePause = async (record: CdkBatch) => {
    await handleAction(() => pauseCdkBatch(record.id));
  };

  const handleVoid = async (record: CdkBatch) => {
    await handleAction(() => voidCdkBatch(record.id));
  };

  const openExportModal = (record: CdkBatch) => {
    exportForm.resetFields();
    setExportingRecord(record);
  };

  const handleExport = async () => {
    if (!exportingRecord) {
      return;
    }
    const values = await exportForm.validateFields();
    const response = await exportCdkBatch(exportingRecord.id, values.exportPassword);
    if (response.code !== 0) {
      message.error(response.message || '导出失败');
      return;
    }
    setExportResult(response.data);
    downloadBase64File(response.data.fileName, response.data.encryptedPackageBase64);
    setExportingRecord(undefined);
    void loadRecords(pageNo, pageSize);
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
      <Card>
        <Form form={searchForm} layout="inline" className="query-form" onFinish={handleSearch}>
          <Form.Item label="关键字" name="keyword">
            <Input placeholder="批次号 / 名称" allowClear />
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
        title="CDK 批次"
        extra={
          <Access action="cdk:batch:create">
            <Button type="primary" onClick={openCreateModal}>
              新建批次
            </Button>
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
      </Card>

      <Modal
        title="新建 CDK 批次"
        open={modalOpen}
        confirmLoading={saving}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleCreate()}
      >
        <Form form={createForm} layout="vertical">
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
        </Form>
      </Modal>

      <Modal
        title="加密导出 CDK"
        open={!!exportingRecord}
        onCancel={() => setExportingRecord(undefined)}
        onOk={() => void handleExport()}
      >
        <Form form={exportForm} layout="vertical">
          <Form.Item
            label="导出密码"
            name="exportPassword"
            rules={[{ required: true, min: 12, message: '请输入至少 12 位导出密码' }]}
          >
            <Input.Password maxLength={128} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="CDK 一次性导出"
        open={!!exportResult}
        footer={<Button type="primary" onClick={() => setExportResult(undefined)}>关闭</Button>}
        width={760}
        onCancel={() => setExportResult(undefined)}
      >
        <p>批次：{exportResult?.batchNo}，数量：{exportResult?.count}</p>
        <p>文件：{exportResult?.fileName}，算法：{exportResult?.encryptionAlgorithm}</p>
        <Input.TextArea value={exportResult?.fingerprint} rows={3} readOnly />
      </Modal>
    </div>
  );
}

function downloadBase64File(fileName: string, base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function renderBatchStatus(status: string) {
  const colorMap: Record<string, string> = {
    draft: 'default',
    pending_approval: 'processing',
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

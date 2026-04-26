import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps, TabsProps } from 'antd';
import { App, Button, Card, Empty, Form, Input, InputNumber, Modal, Select, Space, Table, Tabs, Tag } from 'antd';
import { Access } from '@/components/Access';
import CreateButton from '@/components/admin/CreateButton';
import ListSearchCard from '@/components/admin/ListSearchCard';
import SubmitModalForm from '@/components/admin/SubmitModalForm';
import {
  approvePointAdjustment,
  createPointAdjustment,
  fetchAdminPointAccounts,
  fetchAdminPointLedger,
  fetchPointReconciliation,
} from '@/services/points';
import type {
  PointAccount,
  PointAdjustmentOrder,
  PointLedgerRecord,
  PointReconciliation,
} from '@/types/points';

interface AccountSearchForm {
  keyword?: string;
  status?: string;
}

interface LedgerSearchForm {
  userId?: string;
  direction?: string;
  bizType?: string;
  bizNo?: string;
}

interface AdjustmentForm {
  userId: string;
  direction: 'earn' | 'spend';
  amount: number;
  reason: string;
  ticketNo: string;
}

const accountStatusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
  { label: '冻结', value: 'frozen' },
];

const directionOptions = [
  { label: '获得', value: 'earn' },
  { label: '消耗', value: 'spend' },
  { label: '冻结', value: 'freeze' },
  { label: '解冻', value: 'unfreeze' },
  { label: '退款', value: 'refund' },
];

/**
 * 积分审计页面。
 * 汇总管理端积分账户、流水、对账和人工调整入口。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
function PointAuditPage() {
  const { message } = App.useApp();
  const [accountForm] = Form.useForm<AccountSearchForm>();
  const [ledgerForm] = Form.useForm<LedgerSearchForm>();
  const [adjustmentForm] = Form.useForm<AdjustmentForm>();
  const [accounts, setAccounts] = useState<PointAccount[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<PointLedgerRecord[]>([]);
  const [accountTotal, setAccountTotal] = useState(0);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [accountPageNo, setAccountPageNo] = useState(1);
  const [ledgerPageNo, setLedgerPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [reconciliation, setReconciliation] = useState<PointReconciliation>();
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [lastAdjustment, setLastAdjustment] = useState<PointAdjustmentOrder>();

  const loadAccounts = useCallback(
    async (nextPageNo = accountPageNo, nextPageSize = pageSize) => {
      const values = accountForm.getFieldsValue();
      setLoadingAccounts(true);
      try {
        const response = await fetchAdminPointAccounts({
          keyword: values.keyword,
          status: values.status,
          pageNo: nextPageNo,
          pageSize: nextPageSize,
        });
        if (response.code !== 0) {
          message.error(response.message || '积分账户获取失败');
          return;
        }
        setAccounts(response.data.records);
        setAccountPageNo(response.data.pageNo);
        setPageSize(response.data.pageSize);
        setAccountTotal(response.data.total);
      } finally {
        setLoadingAccounts(false);
      }
    },
    [accountForm, accountPageNo, message, pageSize],
  );

  const loadLedger = useCallback(
    async (nextPageNo = ledgerPageNo, nextPageSize = pageSize) => {
      const values = ledgerForm.getFieldsValue();
      setLoadingLedger(true);
      try {
        const response = await fetchAdminPointLedger({
          userId: values.userId,
          direction: values.direction,
          bizType: values.bizType,
          bizNo: values.bizNo,
          pageNo: nextPageNo,
          pageSize: nextPageSize,
        });
        if (response.code !== 0) {
          message.error(response.message || '积分流水获取失败');
          return;
        }
        setLedgerRecords(response.data.records);
        setLedgerPageNo(response.data.pageNo);
        setPageSize(response.data.pageSize);
        setLedgerTotal(response.data.total);
      } finally {
        setLoadingLedger(false);
      }
    },
    [ledgerForm, ledgerPageNo, message, pageSize],
  );

  const loadReconciliation = useCallback(async () => {
    const response = await fetchPointReconciliation();
    if (response.code === 0) {
      setReconciliation(response.data);
    }
  }, []);

  useEffect(() => {
    void loadAccounts(1, pageSize);
    void loadLedger(1, pageSize);
    void loadReconciliation();
  }, []);

  const accountColumns = useMemo<TableProps<PointAccount>['columns']>(
    () => [
      { title: '用户ID', dataIndex: 'userId', width: 100 },
      {
        title: '用户',
        key: 'user',
        width: 180,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.nickname || record.username || '-'}</strong>
            <span>{record.username || '-'}</span>
          </div>
        ),
      },
      { title: '可用积分', dataIndex: 'availablePoints', width: 120, align: 'right' },
      { title: '冻结积分', dataIndex: 'frozenPoints', width: 120, align: 'right' },
      { title: '累计获得', dataIndex: 'totalEarnedPoints', width: 120, align: 'right' },
      { title: '累计消费', dataIndex: 'totalSpentPoints', width: 120, align: 'right' },
      { title: '状态', dataIndex: 'status', width: 100, render: renderAccountStatus },
      { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
    ],
    [],
  );

  const ledgerColumns = useMemo<TableProps<PointLedgerRecord>['columns']>(
    () => [
      { title: '流水号', dataIndex: 'ledgerNo', width: 220 },
      { title: '用户ID', dataIndex: 'userId', width: 100 },
      { title: '方向', dataIndex: 'direction', width: 110, render: renderDirectionTag },
      { title: '积分', dataIndex: 'amount', width: 100, align: 'right' },
      { title: '业务类型', dataIndex: 'bizType', width: 160 },
      { title: '业务单号', dataIndex: 'bizNo', width: 220 },
      { title: 'TraceId', dataIndex: 'traceId', width: 220 },
      { title: '时间', dataIndex: 'createdAt', width: 180 },
    ],
    [],
  );

  const tabItems = useMemo<TabsProps['items']>(
    () => [
      {
        key: 'accounts',
        label: '积分账户',
        children: (
          <div className="page-stack">
            <ListSearchCard<AccountSearchForm>
              form={accountForm}
              loading={loadingAccounts}
              onReset={() => { accountForm.resetFields(); void loadAccounts(1, pageSize); }}
              onFinish={() => void loadAccounts(1, pageSize)}
            >
              <Form.Item label="关键字" name="keyword">
                <Input placeholder="用户ID / 用户名" allowClear />
              </Form.Item>
              <Form.Item label="状态" name="status">
                <Select allowClear placeholder="全部状态" style={{ width: 140 }} options={accountStatusOptions} />
              </Form.Item>
            </ListSearchCard>
            <Table<PointAccount>
              columns={accountColumns}
              dataSource={accounts}
              loading={loadingAccounts}
              locale={{ emptyText: <Empty description="暂无账户" /> }}
              pagination={{ current: accountPageNo, pageSize, total: accountTotal, showSizeChanger: true }}
              rowKey="id"
              scroll={{ x: 1080 }}
              onChange={(pagination) => void loadAccounts(pagination.current || 1, pagination.pageSize || pageSize)}
            />
          </div>
        ),
      },
      {
        key: 'ledger',
        label: '流水审计',
        children: (
          <div className="page-stack">
            <ListSearchCard<LedgerSearchForm>
              form={ledgerForm}
              loading={loadingLedger}
              onReset={() => { ledgerForm.resetFields(); void loadLedger(1, pageSize); }}
              onFinish={() => void loadLedger(1, pageSize)}
            >
              <Form.Item label="用户ID" name="userId">
                <Input placeholder="用户ID" allowClear />
              </Form.Item>
              <Form.Item label="方向" name="direction">
                <Select allowClear placeholder="全部方向" style={{ width: 140 }} options={directionOptions} />
              </Form.Item>
              <Form.Item label="业务类型" name="bizType">
                <Input placeholder="业务类型" allowClear />
              </Form.Item>
              <Form.Item label="业务单号" name="bizNo">
                <Input placeholder="业务单号" allowClear />
              </Form.Item>
            </ListSearchCard>
            <Table<PointLedgerRecord>
              columns={ledgerColumns}
              dataSource={ledgerRecords}
              loading={loadingLedger}
              locale={{ emptyText: <Empty description="暂无流水" /> }}
              pagination={{ current: ledgerPageNo, pageSize, total: ledgerTotal, showSizeChanger: true }}
              rowKey="id"
              scroll={{ x: 1320 }}
              onChange={(pagination) => void loadLedger(pagination.current || 1, pagination.pageSize || pageSize)}
            />
          </div>
        ),
      },
      {
        key: 'reconciliation',
        label: '对账结果',
        children: (
          <Card
            title="当前对账"
            extra={<Button onClick={() => void loadReconciliation()}>刷新</Button>}
          >
            <div className="points-reconcile-grid">
              <StatisticCard title="检查账户" value={reconciliation?.checkedAccounts || 0} />
              <StatisticCard title="差异账户" value={reconciliation?.differentAccounts || 0} />
              <StatisticCard title="可用差异" value={reconciliation?.totalAvailableDiff || 0} />
              <StatisticCard title="冻结差异" value={reconciliation?.totalFrozenDiff || 0} />
            </div>
            <p className="points-reconcile-time">检查时间：{reconciliation?.checkedAt || '-'}</p>
          </Card>
        ),
      },
    ],
    [
      accountColumns,
      accountForm,
      accountPageNo,
      accountTotal,
      accounts,
      ledgerColumns,
      ledgerForm,
      ledgerPageNo,
      ledgerRecords,
      ledgerTotal,
      loadAccounts,
      loadLedger,
      loadReconciliation,
      loadingAccounts,
      loadingLedger,
      pageSize,
      reconciliation,
    ],
  );

  const openAdjustmentModal = () => {
    adjustmentForm.resetFields();
    adjustmentForm.setFieldsValue({ direction: 'earn' });
    setAdjustmentOpen(true);
  };

  const handleCreateAdjustment = async (values: AdjustmentForm) => {
    setSavingAdjustment(true);
    try {
      const response = await createPointAdjustment({
        ...values,
        idempotencyKey: `adjust-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      });
      if (response.code !== 0) {
        message.error(response.message || '调整申请失败');
        return;
      }
      message.success(response.message);
      setAdjustmentOpen(false);
      setLastAdjustment(response.data);
    } finally {
      setSavingAdjustment(false);
    }
  };

  const handleApproveAdjustment = async (approved: boolean) => {
    if (!lastAdjustment) {
      return;
    }
    const response = await approvePointAdjustment(lastAdjustment.id, approved);
    if (response.code !== 0) {
      message.error(response.message || '审批失败');
      return;
    }
    message.success(response.message);
    setLastAdjustment(undefined);
    void loadAccounts(accountPageNo, pageSize);
    void loadLedger(1, pageSize);
    void loadReconciliation();
  };

  return (
    <div className="page-stack">
      <Card
        title="积分审计"
        extra={
          <Access action="points:adjust:apply">
            <CreateButton onClick={openAdjustmentModal}>
              人工调整
            </CreateButton>
          </Access>
        }
      >
        <Tabs items={tabItems} />
      </Card>

      <SubmitModalForm<AdjustmentForm>
        title="积分人工调整"
        open={adjustmentOpen}
        form={adjustmentForm}
        loading={savingAdjustment}
        onCancel={() => setAdjustmentOpen(false)}
        onFinish={handleCreateAdjustment}
      >
        <Form.Item label="用户ID" name="userId" rules={[{ required: true, message: '请输入用户ID' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="方向" name="direction" rules={[{ required: true, message: '请选择方向' }]}>
          <Select options={directionOptions.slice(0, 2)} />
        </Form.Item>
        <Form.Item label="积分" name="amount" rules={[{ required: true, message: '请输入积分' }]}>
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="原因" name="reason" rules={[{ required: true, message: '请输入原因' }]}>
          <Input.TextArea rows={3} maxLength={300} />
        </Form.Item>
        <Form.Item label="工单号" name="ticketNo" rules={[{ required: true, message: '请输入工单号' }]}>
          <Input maxLength={80} />
        </Form.Item>
      </SubmitModalForm>

      <Modal
        title="调整单审批"
        open={!!lastAdjustment}
        onCancel={() => setLastAdjustment(undefined)}
        footer={
          <Space>
            <Button onClick={() => void handleApproveAdjustment(false)}>驳回</Button>
            <Access action="points:adjust:approve">
              <Button type="primary" onClick={() => void handleApproveAdjustment(true)}>通过</Button>
            </Access>
          </Space>
        }
      >
        <p>调整单：{lastAdjustment?.adjustNo}</p>
        <p>用户ID：{lastAdjustment?.userId}</p>
        <p>方向：{lastAdjustment?.direction}</p>
        <p>积分：{lastAdjustment?.amount}</p>
        <p>原因：{lastAdjustment?.reason}</p>
      </Modal>
    </div>
  );
}

function StatisticCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="points-reconcile-item">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function renderAccountStatus(status: string) {
  if (status === 'active') {
    return <Tag color="success">启用</Tag>;
  }
  if (status === 'frozen') {
    return <Tag color="warning">冻结</Tag>;
  }
  return <Tag>停用</Tag>;
}

function renderDirectionTag(direction: string) {
  const labelMap: Record<string, string> = {
    earn: '获得',
    spend: '消耗',
    freeze: '冻结',
    unfreeze: '解冻',
    refund: '退款',
  };
  const color = direction === 'earn' || direction === 'refund' || direction === 'unfreeze' ? 'success' : 'volcano';
  return <Tag color={direction === 'freeze' ? 'blue' : color}>{labelMap[direction] || direction}</Tag>;
}

export default PointAuditPage;

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { App, Button, Card, Empty, Form, Input, InputNumber, Table, Tabs, Tag, Tooltip } from 'antd';
import type { TableProps, TabsProps } from 'antd';
import {
  DatabaseOutlined,
  FilterOutlined,
  GiftOutlined,
  LockOutlined,
  PieChartOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  ShoppingOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  fetchPointAccount,
  fetchPointConsumeOrders,
  fetchPointFreezeOrders,
  fetchPointLedger,
  fetchPointRechargeOrders,
} from '@/services/points';
import { redeemCdk } from '@/services/cdk';
import { createOnlineRecharge } from '@/services/trade';
import type { PointAccount, PointFreezeOrder, PointLedgerRecord, PointRechargeOrder } from '@/types/points';

interface RedeemForm {
  cdk: string;
}

interface OnlineRechargeForm {
  amount: number;
}

/**
 * 积分钱包页面。
 * 展示当前用户积分余额、CDK 兑换入口和积分相关记录。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
function WalletPage() {
  const { message } = App.useApp();
  const [redeemForm] = Form.useForm<RedeemForm>();
  const [onlineRechargeForm] = Form.useForm<OnlineRechargeForm>();
  const [account, setAccount] = useState<PointAccount>();
  const [ledgerRecords, setLedgerRecords] = useState<PointLedgerRecord[]>([]);
  const [rechargeRecords, setRechargeRecords] = useState<PointRechargeOrder[]>([]);
  const [consumeRecords, setConsumeRecords] = useState<PointLedgerRecord[]>([]);
  const [freezeRecords, setFreezeRecords] = useState<PointFreezeOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [recharging, setRecharging] = useState(false);
  const [recordKeyword, setRecordKeyword] = useState('');

  const loadWallet = useCallback(async () => {
    setLoading(true);
    try {
      const [accountResponse, ledgerResponse, rechargeResponse, consumeResponse, freezeResponse] = await Promise.all([
        fetchPointAccount(),
        fetchPointLedger({ pageNo: 1, pageSize: 10 }),
        fetchPointRechargeOrders({ pageNo: 1, pageSize: 10 }),
        fetchPointConsumeOrders({ pageNo: 1, pageSize: 10 }),
        fetchPointFreezeOrders({ pageNo: 1, pageSize: 10 }),
      ]);
      if (accountResponse.code === 0) {
        setAccount(accountResponse.data);
      }
      setLedgerRecords(ledgerResponse.code === 0 ? ledgerResponse.data.records : []);
      setRechargeRecords(rechargeResponse.code === 0 ? rechargeResponse.data.records : []);
      setConsumeRecords(consumeResponse.code === 0 ? consumeResponse.data.records : []);
      setFreezeRecords(freezeResponse.code === 0 ? freezeResponse.data.records : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  const ledgerColumns = useMemo<TableProps<PointLedgerRecord>['columns']>(
    () => [
      { title: '业务类型', dataIndex: 'bizType', width: 160, render: renderBusinessType },
      {
        title: '方向',
        dataIndex: 'direction',
        width: 110,
        render: (value: PointLedgerRecord['direction']) => renderDirectionTag(value),
      },
      { title: '积分', dataIndex: 'amount', width: 100, align: 'right' },
      {
        title: '可用余额',
        key: 'balance',
        width: 180,
        render: (_, record) => `${record.balanceBefore} -> ${record.balanceAfter}`,
      },
      {
        title: '冻结余额',
        key: 'frozen',
        width: 180,
        render: (_, record) => `${record.frozenBefore} -> ${record.frozenAfter}`,
      },
      { title: '业务单号', dataIndex: 'bizNo', width: 220 },
      { title: '时间', dataIndex: 'createdAt', width: 180 },
    ],
    [],
  );

  const rechargeColumns = useMemo<TableProps<PointRechargeOrder>['columns']>(
    () => [
      { title: '充值单号', dataIndex: 'rechargeNo', width: 220 },
      { title: '渠道', dataIndex: 'channel', width: 120 },
      { title: '积分', dataIndex: 'amount', width: 100, align: 'right' },
      { title: '状态', dataIndex: 'status', width: 120, render: renderStatusTag },
      { title: '外部流水', dataIndex: 'externalNo', width: 220 },
      { title: '时间', dataIndex: 'createdAt', width: 180 },
    ],
    [],
  );

  const freezeColumns = useMemo<TableProps<PointFreezeOrder>['columns']>(
    () => [
      { title: '冻结单号', dataIndex: 'freezeNo', width: 220 },
      { title: '业务类型', dataIndex: 'bizType', width: 160, render: renderBusinessType },
      { title: '积分', dataIndex: 'amount', width: 100, align: 'right' },
      { title: '状态', dataIndex: 'status', width: 120, render: renderStatusTag },
      { title: '过期时间', dataIndex: 'expireAt', width: 180 },
      { title: '时间', dataIndex: 'createdAt', width: 180 },
    ],
    [],
  );

  const filteredLedgerRecords = useMemo(
    () => filterRecords(ledgerRecords, recordKeyword),
    [ledgerRecords, recordKeyword],
  );
  const filteredRechargeRecords = useMemo(
    () => filterRecords(rechargeRecords, recordKeyword),
    [rechargeRecords, recordKeyword],
  );
  const filteredConsumeRecords = useMemo(
    () => filterRecords(consumeRecords, recordKeyword),
    [consumeRecords, recordKeyword],
  );
  const filteredFreezeRecords = useMemo(
    () => filterRecords(freezeRecords, recordKeyword),
    [freezeRecords, recordKeyword],
  );

  const tabItems = useMemo<TabsProps['items']>(
    () => [
      {
        key: 'ledger',
        label: '积分流水',
        children: renderTable(ledgerColumns, filteredLedgerRecords, loading),
      },
      {
        key: 'recharge',
        label: '充值记录',
        children: renderTable(rechargeColumns, filteredRechargeRecords, loading),
      },
      {
        key: 'consume',
        label: '消费记录',
        children: renderTable(ledgerColumns, filteredConsumeRecords, loading),
      },
      {
        key: 'freeze',
        label: '冻结记录',
        children: renderTable(freezeColumns, filteredFreezeRecords, loading),
      },
    ],
    [
      filteredConsumeRecords,
      filteredFreezeRecords,
      filteredLedgerRecords,
      filteredRechargeRecords,
      freezeColumns,
      ledgerColumns,
      loading,
      rechargeColumns,
    ],
  );

  const handleRedeem = async (values: RedeemForm) => {
    setRedeeming(true);
    try {
      const response = await redeemCdk(values.cdk, createClientIdempotencyKey());
      if (response.code !== 0) {
        message.error(response.message || '兑换失败');
        return;
      }
      message.success(`兑换成功，到账 ${response.data.grantedPoints} 积分`);
      redeemForm.resetFields();
      void loadWallet();
    } finally {
      setRedeeming(false);
    }
  };

  const handleOnlineRecharge = async (values: OnlineRechargeForm) => {
    setRecharging(true);
    try {
      const response = await createOnlineRecharge(values.amount, createClientIdempotencyKey('online'));
      if (response.code !== 0) {
        message.error(response.message || '创建充值单失败');
        return;
      }
      message.success(`充值单已创建：${response.data.rechargeNo}`);
      onlineRechargeForm.resetFields();
      void loadWallet();
    } finally {
      setRecharging(false);
    }
  };

  return (
    <div className="page-stack points-wallet-page">
      <div className="wallet-page-title">
        <span className="wallet-page-title-icon">
          <WalletOutlined />
        </span>
        <h2>积分钱包</h2>
        <Tag color="orange">重要</Tag>
        <span>权限联调提醒</span>
      </div>

      <div className="wallet-metric-grid">
        <WalletMetricCard
          title="可用积分"
          value={account?.availablePoints || 0}
          loading={loading && !account}
          tone="blue"
          icon={<DatabaseOutlined />}
        />
        <WalletMetricCard
          title="冻结积分"
          value={account?.frozenPoints || 0}
          loading={loading && !account}
          tone="violet"
          icon={<LockOutlined />}
        />
        <WalletMetricCard
          title="累计获得"
          value={account?.totalEarnedPoints || 0}
          loading={loading && !account}
          tone="green"
          icon={<PieChartOutlined />}
        />
        <WalletMetricCard
          title="累计消费"
          value={account?.totalSpentPoints || 0}
          loading={loading && !account}
          tone="orange"
          icon={<ShoppingOutlined />}
        />
      </div>

      <div className="wallet-action-grid">
        <WalletActionCard
          title="CDK 兑换"
          description="输入 CDK 兑换码，兑换积分到您的账户"
          icon={<GiftOutlined />}
          artwork="gift"
        >
          <Form form={redeemForm} layout="inline" className="wallet-action-form" onFinish={(values) => void handleRedeem(values)}>
            <Form.Item name="cdk" rules={[{ required: true, message: '请输入 CDK' }]}>
              <Input className="wallet-cdk-input" placeholder="XXXX-XXXX-XXXX-XXXX-C" allowClear />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={redeeming}>
                兑换
              </Button>
            </Form.Item>
          </Form>
        </WalletActionCard>

        <WalletActionCard
          title="在线充值"
          description="通过在线充值，快速获取更多积分"
          icon={<WalletOutlined />}
          artwork="card"
        >
          <Form
            form={onlineRechargeForm}
            layout="inline"
            className="wallet-action-form"
            onFinish={(values) => void handleOnlineRecharge(values)}
          >
            <Form.Item name="amount" rules={[{ required: true, message: '请输入充值积分' }]}>
              <InputNumber min={1} precision={0} placeholder="输入充值积分" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={recharging}>
                创建充值单
              </Button>
            </Form.Item>
          </Form>
        </WalletActionCard>
      </div>

      <Card className="wallet-record-card" title={<WalletSectionTitle icon={<GiftOutlined />} title="积分记录" />}>
        <Tabs
          items={tabItems}
          tabBarExtraContent={
            <div className="wallet-record-tools">
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="搜索业务单号"
                value={recordKeyword}
                onChange={(event) => setRecordKeyword(event.target.value)}
              />
              <Button icon={<FilterOutlined />}>筛选</Button>
            </div>
          }
        />
      </Card>
    </div>
  );
}

/**
 * 积分钱包顶部指标卡片。
 * author: sunshengxian
 * 创建日期：2026-04-26
 */
function WalletMetricCard({
  title,
  value,
  loading,
  tone,
  icon,
}: {
  title: string;
  value: number;
  loading: boolean;
  tone: 'blue' | 'violet' | 'green' | 'orange';
  icon: ReactNode;
}) {
  return (
    <Card className={`wallet-metric-card is-${tone}`} loading={loading}>
      <div className="wallet-metric-card-body">
        <span className="wallet-metric-icon">{icon}</span>
        <div className="wallet-metric-content">
          <span>
            {title}
            <Tooltip title={`${title}说明`}>
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
          <strong>{formatPoints(value)}</strong>
        </div>
        <span className="wallet-metric-watermark" aria-hidden="true" />
      </div>
    </Card>
  );
}

/**
 * 钱包操作卡片，承载 CDK 兑换与在线充值表单。
 * author: sunshengxian
 * 创建日期：2026-04-26
 */
function WalletActionCard({
  title,
  description,
  icon,
  artwork,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  artwork: 'gift' | 'card';
  children: ReactNode;
}) {
  return (
    <Card className={`wallet-action-card is-${artwork}`}>
      <div className="wallet-action-card-content">
        <div className="wallet-action-heading">
          <span>{icon}</span>
          <div>
            <strong>{title}</strong>
            <em>{description}</em>
          </div>
        </div>
        {children}
      </div>
      <div className="wallet-action-art" aria-hidden="true">
        <span />
        <i />
      </div>
    </Card>
  );
}

/**
 * 卡片标题，统一钱包页面模块标题样式。
 * author: sunshengxian
 * 创建日期：2026-04-26
 */
function WalletSectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <span className="wallet-section-title">
      <span>{icon}</span>
      {title}
    </span>
  );
}

function renderTable<T extends { id: string }>(columns: TableProps<T>['columns'], records: T[], loading: boolean) {
  return (
    <Table<T>
      className="wallet-record-table"
      columns={columns}
      dataSource={records}
      loading={loading}
      locale={{ emptyText: <Empty description="暂无记录" /> }}
      pagination={false}
      rowKey="id"
      scroll={{ x: 980 }}
      size="small"
    />
  );
}

function renderBusinessType(value: string) {
  return (
    <span className="wallet-business-type">
      <span>
        <DatabaseOutlined />
      </span>
      {value || '-'}
    </span>
  );
}

function renderDirectionTag(direction: PointLedgerRecord['direction']) {
  if (direction === 'earn' || direction === 'refund' || direction === 'unfreeze') {
    return <Tag className="wallet-direction-tag is-earn" color="success">{directionLabel(direction)}</Tag>;
  }
  if (direction === 'freeze') {
    return <Tag className="wallet-direction-tag is-freeze" color="blue">{directionLabel(direction)}</Tag>;
  }
  return <Tag className="wallet-direction-tag is-spend" color="volcano">{directionLabel(direction)}</Tag>;
}

function renderStatusTag(status: string) {
  if (status === 'success' || status === 'frozen') {
    return <Tag color="success">{status}</Tag>;
  }
  if (status === 'processing' || status === 'created') {
    return <Tag color="processing">{status}</Tag>;
  }
  return <Tag>{status}</Tag>;
}

function directionLabel(direction: string) {
  const labels: Record<string, string> = {
    earn: '获得',
    spend: '消耗',
    freeze: '冻结',
    unfreeze: '解冻',
    refund: '退款',
  };
  return labels[direction] || direction;
}

function createClientIdempotencyKey(prefix = 'cdk') {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function filterRecords<T>(records: T[], keyword: string): T[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return records;
  }
  return records.filter((record) => JSON.stringify(record).toLowerCase().includes(normalizedKeyword));
}

function formatPoints(value: number) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(value || 0);
}

export default WalletPage;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Col, Empty, Form, Input, InputNumber, Row, Space, Statistic, Table, Tabs, Tag } from 'antd';
import type { TableProps, TabsProps } from 'antd';
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
      { title: '业务类型', dataIndex: 'bizType', width: 160 },
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
      { title: '业务类型', dataIndex: 'bizType', width: 160 },
      { title: '积分', dataIndex: 'amount', width: 100, align: 'right' },
      { title: '状态', dataIndex: 'status', width: 120, render: renderStatusTag },
      { title: '过期时间', dataIndex: 'expireAt', width: 180 },
      { title: '时间', dataIndex: 'createdAt', width: 180 },
    ],
    [],
  );

  const tabItems = useMemo<TabsProps['items']>(
    () => [
      {
        key: 'ledger',
        label: '积分流水',
        children: renderTable(ledgerColumns, ledgerRecords, loading),
      },
      {
        key: 'recharge',
        label: '充值记录',
        children: renderTable(rechargeColumns, rechargeRecords, loading),
      },
      {
        key: 'consume',
        label: '消费记录',
        children: renderTable(ledgerColumns, consumeRecords, loading),
      },
      {
        key: 'freeze',
        label: '冻结记录',
        children: renderTable(freezeColumns, freezeRecords, loading),
      },
    ],
    [consumeRecords, freezeColumns, freezeRecords, ledgerColumns, ledgerRecords, loading, rechargeColumns, rechargeRecords],
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
      <Row gutter={[12, 12]}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="可用积分" value={account?.availablePoints || 0} loading={loading && !account} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="冻结积分" value={account?.frozenPoints || 0} loading={loading && !account} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="累计获得" value={account?.totalEarnedPoints || 0} loading={loading && !account} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="累计消费" value={account?.totalSpentPoints || 0} loading={loading && !account} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={14}>
          <Card title="CDK 兑换">
            <Form form={redeemForm} layout="inline" className="query-form" onFinish={(values) => void handleRedeem(values)}>
              <Form.Item name="cdk" rules={[{ required: true, message: '请输入 CDK' }]}>
                <Input className="wallet-cdk-input" placeholder="XXXX-XXXX-XXXX-C" allowClear />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={redeeming}>
                  兑换
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="在线充值">
            <Form
              form={onlineRechargeForm}
              layout="inline"
              className="query-form"
              onFinish={(values) => void handleOnlineRecharge(values)}
            >
              <Form.Item name="amount" rules={[{ required: true, message: '请输入充值积分' }]}>
                <InputNumber min={1} precision={0} placeholder="充值积分" style={{ width: 180 }} />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={recharging}>
                    创建充值单
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Card title="积分记录">
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}

function renderTable<T extends { id: string }>(columns: TableProps<T>['columns'], records: T[], loading: boolean) {
  return (
    <Table<T>
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

function renderDirectionTag(direction: PointLedgerRecord['direction']) {
  if (direction === 'earn' || direction === 'refund' || direction === 'unfreeze') {
    return <Tag color="success">{directionLabel(direction)}</Tag>;
  }
  if (direction === 'freeze') {
    return <Tag color="blue">{directionLabel(direction)}</Tag>;
  }
  return <Tag color="volcano">{directionLabel(direction)}</Tag>;
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

export default WalletPage;

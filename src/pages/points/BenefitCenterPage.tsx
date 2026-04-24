import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps, TabsProps } from 'antd';
import { App, Button, Card, Empty, Popconfirm, Table, Tabs, Tag } from 'antd';
import { exchangeBenefitProduct, fetchBenefitProducts, fetchMyBenefits } from '@/services/benefit';
import type { BenefitProduct, UserBenefit } from '@/types/benefit';

/**
 * 权益兑换中心页面。
 * 展示可兑换权益、已获得权益，并通过幂等键发起积分兑换。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
function BenefitCenterPage() {
  const { message } = App.useApp();
  const [products, setProducts] = useState<BenefitProduct[]>([]);
  const [benefits, setBenefits] = useState<UserBenefit[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productResponse, benefitResponse] = await Promise.all([
        fetchBenefitProducts({ pageNo: 1, pageSize: 50, status: 'active' }),
        fetchMyBenefits({ pageNo: 1, pageSize: 50 }),
      ]);
      setProducts(productResponse.code === 0 ? productResponse.data.records : []);
      setBenefits(benefitResponse.code === 0 ? benefitResponse.data.records : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const productColumns = useMemo<TableProps<BenefitProduct>['columns']>(
    () => [
      {
        title: '权益',
        dataIndex: 'productName',
        width: 240,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.productName}</strong>
            <span>{record.benefitName}</span>
          </div>
        ),
      },
      { title: '类型', dataIndex: 'benefitType', width: 120 },
      { title: '编码', dataIndex: 'benefitCode', width: 180 },
      { title: '消耗积分', dataIndex: 'costPoints', width: 120, align: 'right' },
      { title: '库存', key: 'stock', width: 120, render: (_, record) => renderStock(record) },
      { title: '有效期', key: 'valid', width: 300, render: (_, record) => `${record.validFrom} 至 ${record.validTo}` },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 120,
        render: (_, record) => (
          <Popconfirm title="确认使用积分兑换？" onConfirm={() => void handleExchange(record)}>
            <Button type="link" disabled={record.status !== 'active'}>
              兑换
            </Button>
          </Popconfirm>
        ),
      },
    ],
    [],
  );

  const benefitColumns = useMemo<TableProps<UserBenefit>['columns']>(
    () => [
      { title: '权益名称', dataIndex: 'benefitName', width: 220 },
      { title: '类型', dataIndex: 'benefitType', width: 120 },
      { title: '权益编码', dataIndex: 'benefitCode', width: 180 },
      { title: '来源单号', dataIndex: 'sourceNo', width: 220 },
      { title: '状态', dataIndex: 'status', width: 120, render: renderStatusTag },
      { title: '生效时间', dataIndex: 'effectiveAt', width: 180 },
      { title: '失效时间', dataIndex: 'expireAt', width: 180, render: (value) => value || '-' },
    ],
    [],
  );

  const tabItems = useMemo<TabsProps['items']>(
    () => [
      {
        key: 'products',
        label: '可兑换权益',
        children: renderTable(productColumns, products, loading),
      },
      {
        key: 'mine',
        label: '我的权益',
        children: renderTable(benefitColumns, benefits, loading),
      },
    ],
    [benefitColumns, benefits, loading, productColumns, products],
  );

  const handleExchange = async (record: BenefitProduct) => {
    const response = await exchangeBenefitProduct(record.id, createIdempotencyKey());
    if (response.code !== 0) {
      message.error(response.message || '兑换失败');
      return;
    }
    message.success('兑换成功');
    void loadData();
  };

  return (
    <div className="page-stack">
      <Card title="权益兑换">
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
      locale={{ emptyText: <Empty description="暂无数据" /> }}
      pagination={false}
      rowKey="id"
      scroll={{ x: 1160 }}
      size="small"
    />
  );
}

function renderStock(record: BenefitProduct) {
  if (record.stockTotal < 0) {
    return '不限';
  }
  return `${record.stockUsed}/${record.stockTotal}`;
}

function renderStatusTag(status: string) {
  return <Tag color={status === 'active' ? 'success' : 'default'}>{status}</Tag>;
}

function createIdempotencyKey() {
  return `benefit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default BenefitCenterPage;

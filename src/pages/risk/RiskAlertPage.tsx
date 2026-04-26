import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import { App, Empty, Form, Select, Table, Tag } from 'antd';
import ListSearchCard from '@/components/admin/ListSearchCard';
import ListTableCard from '@/components/admin/ListTableCard';
import { fetchRiskAlerts } from '@/services/risk';
import type { RiskAlert } from '@/types/risk';

/**
 * 风控告警页面。
 * 展示异常兑换锁定、高价值批次复核等运营风险事件。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
function RiskAlertPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<{ status?: string; alertType?: string }>();
  const [records, setRecords] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const response = await fetchRiskAlerts({ ...values, pageNo: 1, pageSize: 100 });
      if (response.code !== 0) {
        message.error(response.message || '风控告警获取失败');
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

  const columns = useMemo<TableProps<RiskAlert>['columns']>(
    () => [
      {
        title: '告警',
        dataIndex: 'alertNo',
        width: 260,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.alertNo}</strong>
            <span>{renderAlertTypeText(record.alertType)}</span>
          </div>
        ),
      },
      { title: '风险', dataIndex: 'riskLevel', width: 110, render: renderRiskTag },
      { title: '对象', key: 'subject', width: 240, render: (_, record) => `${record.subjectType}:${record.subjectNo}` },
      { title: '用户', dataIndex: 'userId', width: 120, render: (value) => value || '-' },
      { title: '状态', dataIndex: 'status', width: 120, render: renderStatusTag },
      { title: '详情', dataIndex: 'detailSnapshot', width: 320, ellipsis: true },
      { title: '创建时间', dataIndex: 'createdAt', width: 180 },
    ],
    [],
  );

  return (
    <div className="page-stack">
      <ListSearchCard<{ status?: string; alertType?: string }>
        form={form}
        showActions={false}
        onValuesChange={() => void loadRecords()}
      >
        <Form.Item label="状态" name="status">
          <Select
            allowClear
            placeholder="全部状态"
            style={{ width: 140 }}
            options={[{ label: '待处理', value: 'open' }]}
          />
        </Form.Item>
        <Form.Item label="类型" name="alertType">
          <Select
            allowClear
            placeholder="全部类型"
            style={{ width: 220 }}
            options={[
              { label: '兑换锁定', value: 'cdk_redeem_locked' },
              { label: '双人复核', value: 'cdk_batch_double_review' },
            ]}
          />
        </Form.Item>
      </ListSearchCard>
      <ListTableCard title="风控告警">
        <Table<RiskAlert>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无风控告警" /> }}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1360 }}
        />
      </ListTableCard>
    </div>
  );
}

function renderRiskTag(riskLevel: string) {
  if (riskLevel === 'critical') {
    return <Tag color="red">关键</Tag>;
  }
  if (riskLevel === 'high') {
    return <Tag color="volcano">高</Tag>;
  }
  return <Tag color="blue">{riskLevel}</Tag>;
}

function renderStatusTag(status: string) {
  return <Tag color={status === 'open' ? 'processing' : 'default'}>{status}</Tag>;
}

function renderAlertTypeText(alertType: string) {
  const map: Record<string, string> = {
    cdk_redeem_locked: '兑换锁定',
    cdk_batch_double_review: '双人复核',
  };
  return map[alertType] || alertType;
}

export default RiskAlertPage;

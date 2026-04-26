import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import { App, Empty, Form, Input, Select, Table, Tag } from 'antd';
import ListSearchCard from '@/components/admin/ListSearchCard';
import ListTableCard from '@/components/admin/ListTableCard';
import { fetchCdkRedeemRecords } from '@/services/cdk';
import type { CdkRedeemRecord } from '@/types/cdk';

interface RedeemSearchForm {
  userId?: string;
  batchId?: string;
  status?: string;
}

const statusOptions = [
  { label: '处理中', value: 'processing' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
];

/**
 * CDK 兑换记录页面。
 * 支持按用户、批次和状态查询兑换审计记录。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
function CdkRedeemRecordPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<RedeemSearchForm>();
  const [records, setRecords] = useState<CdkRedeemRecord[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadRecords = useCallback(
    async (nextPageNo = pageNo, nextPageSize = pageSize) => {
      const values = searchForm.getFieldsValue();
      setLoading(true);
      try {
        const response = await fetchCdkRedeemRecords({
          userId: values.userId,
          batchId: values.batchId,
          status: values.status,
          pageNo: nextPageNo,
          pageSize: nextPageSize,
        });
        if (response.code !== 0) {
          message.error(response.message || '兑换记录获取失败');
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

  const columns = useMemo<TableProps<CdkRedeemRecord>['columns']>(
    () => [
      { title: '兑换单号', dataIndex: 'redeemNo', width: 220 },
      { title: '用户ID', dataIndex: 'userId', width: 100 },
      { title: '批次ID', dataIndex: 'batchId', width: 100 },
      { title: '权益类型', dataIndex: 'benefitType', width: 120 },
      { title: '状态', dataIndex: 'status', width: 110, render: renderStatusTag },
      { title: '失败原因', dataIndex: 'failureMessage', width: 220 },
      { title: '客户端IP', dataIndex: 'clientIp', width: 150 },
      { title: 'TraceId', dataIndex: 'traceId', width: 220 },
      { title: '时间', dataIndex: 'createdAt', width: 180 },
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

  return (
    <div className="page-stack">
      <ListSearchCard<RedeemSearchForm>
        form={searchForm}
        loading={loading}
        onReset={handleReset}
        onFinish={handleSearch}
      >
        <Form.Item label="用户ID" name="userId">
          <Input placeholder="用户ID" allowClear />
        </Form.Item>
        <Form.Item label="批次ID" name="batchId">
          <Input placeholder="批次ID" allowClear />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select allowClear placeholder="全部状态" style={{ width: 140 }} options={statusOptions} />
        </Form.Item>
      </ListSearchCard>

      <ListTableCard title="CDK 兑换记录">
        <Table<CdkRedeemRecord>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无兑换记录" /> }}
          pagination={{ current: pageNo, pageSize, total, showSizeChanger: true, showTotal: (count) => `共 ${count} 条` }}
          rowKey="id"
          scroll={{ x: 1320 }}
          onChange={(pagination) => void loadRecords(pagination.current || 1, pagination.pageSize || pageSize)}
        />
      </ListTableCard>
    </div>
  );
}

function renderStatusTag(status: string) {
  if (status === 'success') {
    return <Tag color="success">成功</Tag>;
  }
  if (status === 'processing') {
    return <Tag color="processing">处理中</Tag>;
  }
  return <Tag color="error">失败</Tag>;
}

export default CdkRedeemRecordPage;

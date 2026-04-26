import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import { App, Button, Empty, Form, Input, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { Access } from '@/components/Access';
import ListSearchCard from '@/components/admin/ListSearchCard';
import ListTableCard from '@/components/admin/ListTableCard';
import { fetchCdkCodes, updateCdkCodeStatus } from '@/services/cdk';
import type { CdkCode } from '@/types/cdk';

interface CodeSearchForm {
  keyword?: string;
  batchId?: string;
  status?: string;
}

const statusOptions = [
  { label: '可兑换', value: 'active' },
  { label: '已兑换', value: 'redeemed' },
  { label: '已失效', value: 'disabled' },
];

/**
 * CDK 管理页面。
 * 默认展示全部 CDK，并支持按批次筛选、复制和变更 CDK 状态，不提供删除入口。
 * author: sunshengxian
 * 创建日期：2026-04-26
 */
function CdkCodePage() {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const [searchForm] = Form.useForm<CodeSearchForm>();
  const [records, setRecords] = useState<CdkCode[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadRecords = useCallback(
    async (nextPageNo = pageNo, nextPageSize = pageSize) => {
      const values = searchForm.getFieldsValue();
      setLoading(true);
      try {
        const response = await fetchCdkCodes({
          keyword: values.keyword,
          batchId: values.batchId,
          status: values.status,
          pageNo: nextPageNo,
          pageSize: nextPageSize,
        });
        if (response.code !== 0) {
          message.error(response.message || 'CDK 获取失败');
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
    const batchId = searchParams.get('batchId') || undefined;
    searchForm.setFieldsValue({ batchId });
    void loadRecords(1, pageSize);
  }, []);

  const handleCopy = async (cdk: string) => {
    await navigator.clipboard.writeText(cdk);
    message.success('已复制');
  };

  const handleStatus = async (record: CdkCode, status: string) => {
    const response = await updateCdkCodeStatus(record.id, status);
    if (response.code !== 0) {
      message.error(response.message || '状态更新失败');
      return;
    }
    message.success(response.message);
    void loadRecords(pageNo, pageSize);
  };

  const columns = useMemo<TableProps<CdkCode>['columns']>(
    () => [
      {
        title: 'CDK',
        dataIndex: 'cdk',
        width: 360,
        render: (_, record) => (
          <Space size={8}>
            <Input value={record.cdk || '历史码不可查看'} readOnly disabled={!record.cdk} style={{ width: 280 }} />
            <Button size="small" icon={<CopyOutlined />} disabled={!record.cdk} onClick={() => void handleCopy(record.cdk)}>
              复制
            </Button>
          </Space>
        ),
      },
      {
        title: '批次',
        key: 'batch',
        width: 260,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.batchName || '-'}</strong>
            <span>{record.batchNo || `ID ${record.batchId}`}</span>
          </div>
        ),
      },
      { title: '积分', dataIndex: 'benefitConfig', width: 120, render: renderBenefitConfig },
      { title: '状态', dataIndex: 'status', width: 110, render: renderCodeStatus },
      { title: '批次状态', dataIndex: 'batchStatus', width: 110, render: renderBatchStatus },
      { title: '有效期', key: 'valid', width: 300, render: (_, record) => `${record.validFrom || '-'} 至 ${record.validTo || '-'}` },
      {
        title: '兑换信息',
        key: 'redeem',
        width: 260,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.redeemedUserId || '-'}</strong>
            <span>{record.redeemRecordNo || record.redeemedAt || '-'}</span>
          </div>
        ),
      },
      { title: '创建时间', dataIndex: 'createdAt', width: 180 },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 150,
        render: (_, record) => (
          <Access action="cdk:code:status">
            <Space size={4}>
              <Popconfirm title="确认失效该 CDK？" onConfirm={() => void handleStatus(record, 'disabled')}>
                <Button type="link" danger disabled={record.status !== 'active'}>
                  失效
                </Button>
              </Popconfirm>
              <Popconfirm title="确认启用该 CDK？" onConfirm={() => void handleStatus(record, 'active')}>
                <Button type="link" disabled={record.status !== 'disabled'}>
                  启用
                </Button>
              </Popconfirm>
            </Space>
          </Access>
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

  return (
    <div className="page-stack">
      <ListSearchCard<CodeSearchForm>
        form={searchForm}
        loading={loading}
        onReset={handleReset}
        onFinish={handleSearch}
      >
        <Form.Item label="关键字" name="keyword">
          <Input placeholder="批次号 / 名称 / CDK前缀" allowClear />
        </Form.Item>
        <Form.Item label="批次ID" name="batchId">
          <Input placeholder="精确批次ID" allowClear />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select allowClear placeholder="全部状态" style={{ width: 140 }} options={statusOptions} />
        </Form.Item>
      </ListSearchCard>

      <ListTableCard title="CDK 管理">
        <Table<CdkCode>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无 CDK" /> }}
          pagination={{ current: pageNo, pageSize, total, showSizeChanger: true, showTotal: (count) => `共 ${count} 条` }}
          rowKey="id"
          scroll={{ x: 1860 }}
          onChange={(pagination) => void loadRecords(pagination.current || 1, pagination.pageSize || pageSize)}
        />
      </ListTableCard>
    </div>
  );
}

function renderCodeStatus(status: string) {
  if (status === 'active') {
    return <Tag color="success">可兑换</Tag>;
  }
  if (status === 'redeemed') {
    return <Tag color="processing">已兑换</Tag>;
  }
  return <Tag color="error">已失效</Tag>;
}

function renderBatchStatus(status?: string) {
  if (status === 'active') {
    return <Tag color="success">可用</Tag>;
  }
  if (status === 'paused') {
    return <Tag color="warning">暂停</Tag>;
  }
  if (status === 'voided') {
    return <Tag color="error">整批失效</Tag>;
  }
  return <Tag>{status || '-'}</Tag>;
}

function renderBenefitConfig(value?: string) {
  if (!value) {
    return '-';
  }
  try {
    const config = JSON.parse(value) as { points?: number };
    return `${(config.points || 0).toLocaleString()} 积分`;
  } catch {
    return '-';
  }
}

export default CdkCodePage;

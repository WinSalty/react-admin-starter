import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableProps } from 'antd';
import { App, Button, Card, DatePicker, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { Access } from '@/components/Access';
import { fetchAdminBenefitProducts, saveBenefitProduct, updateBenefitProductStatus } from '@/services/benefit';
import type { BenefitProduct, BenefitProductSaveParams } from '@/types/benefit';

interface BenefitProductForm {
  productName: string;
  benefitType: string;
  benefitCode: string;
  benefitName: string;
  benefitConfig?: string;
  costPoints: number;
  stockTotal: number;
  validFrom: dayjs.Dayjs;
  validTo: dayjs.Dayjs;
}

/**
 * 权益商品管理页面。
 * 管理积分可兑换的权限、服务包和后续业务权益商品。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
function BenefitProductPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<BenefitProductForm>();
  const [records, setRecords] = useState<BenefitProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BenefitProduct>();

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAdminBenefitProducts({ pageNo: 1, pageSize: 100 });
      if (response.code !== 0) {
        message.error(response.message || '权益商品获取失败');
        return;
      }
      setRecords(response.data.records);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const columns = useMemo<TableProps<BenefitProduct>['columns']>(
    () => [
      {
        title: '商品',
        dataIndex: 'productName',
        width: 240,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.productName}</strong>
            <span>{record.productNo}</span>
          </div>
        ),
      },
      { title: '权益类型', dataIndex: 'benefitType', width: 120 },
      { title: '权益编码', dataIndex: 'benefitCode', width: 180 },
      { title: '积分', dataIndex: 'costPoints', width: 100, align: 'right' },
      { title: '库存', key: 'stock', width: 120, render: (_, record) => (record.stockTotal < 0 ? '不限' : `${record.stockUsed}/${record.stockTotal}`) },
      { title: '状态', dataIndex: 'status', width: 110, render: renderStatusTag },
      { title: '有效期', key: 'valid', width: 300, render: (_, record) => `${record.validFrom} 至 ${record.validTo}` },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 180,
        render: (_, record) => (
          <Space size={4}>
            <Access action="benefit:product:update">
              <Button type="link" onClick={() => openEditModal(record)}>
                编辑
              </Button>
            </Access>
            <Access action="benefit:product:status">
              <Popconfirm title="确认切换状态？" onConfirm={() => void handleStatus(record)}>
                <Button type="link">{record.status === 'active' ? '停用' : '启用'}</Button>
              </Popconfirm>
            </Access>
          </Space>
        ),
      },
    ],
    [],
  );

  const openCreateModal = () => {
    setEditingRecord(undefined);
    form.resetFields();
    form.setFieldsValue({
      benefitType: 'permission',
      costPoints: 100,
      stockTotal: -1,
      validFrom: dayjs(),
      validTo: dayjs().add(365, 'day'),
    });
    setModalOpen(true);
  };

  const openEditModal = (record: BenefitProduct) => {
    setEditingRecord(record);
    form.setFieldsValue({
      productName: record.productName,
      benefitType: record.benefitType,
      benefitCode: record.benefitCode,
      benefitName: record.benefitName,
      benefitConfig: record.benefitConfig,
      costPoints: record.costPoints,
      stockTotal: record.stockTotal,
      validFrom: dayjs(record.validFrom),
      validTo: dayjs(record.validTo),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const params: BenefitProductSaveParams = {
      ...values,
      validFrom: values.validFrom.format('YYYY-MM-DD HH:mm:ss'),
      validTo: values.validTo.format('YYYY-MM-DD HH:mm:ss'),
    };
    const response = await saveBenefitProduct(params, editingRecord?.id);
    if (response.code !== 0) {
      message.error(response.message || '保存失败');
      return;
    }
    message.success(response.message || '保存成功');
    setModalOpen(false);
    void loadRecords();
  };

  const handleStatus = async (record: BenefitProduct) => {
    const nextStatus = record.status === 'active' ? 'disabled' : 'active';
    const response = await updateBenefitProductStatus(record.id, nextStatus);
    if (response.code !== 0) {
      message.error(response.message || '状态更新失败');
      return;
    }
    message.success(response.message || '状态已更新');
    void loadRecords();
  };

  return (
    <div className="page-stack">
      <Card
        title="权益商品"
        extra={
          <Access action="benefit:product:create">
            <Button type="primary" onClick={openCreateModal}>
              新建权益
            </Button>
          </Access>
        }
      >
        <Table<BenefitProduct>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无权益商品" /> }}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1260 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑权益商品' : '新建权益商品'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSave()}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="商品名称" name="productName" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item label="权益类型" name="benefitType" rules={[{ required: true, message: '请选择权益类型' }]}>
            <Select options={[{ label: '权限', value: 'permission' }, { label: '服务包', value: 'service_package' }]} />
          </Form.Item>
          <Form.Item label="权益编码" name="benefitCode" rules={[{ required: true, message: '请输入权益编码' }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item label="权益名称" name="benefitName" rules={[{ required: true, message: '请输入权益名称' }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item label="权益配置" name="benefitConfig">
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
          <Form.Item label="消耗积分" name="costPoints" rules={[{ required: true, message: '请输入消耗积分' }]}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="总库存" name="stockTotal" rules={[{ required: true, message: '请输入总库存' }]}>
            <InputNumber min={-1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="生效时间" name="validFrom" rules={[{ required: true, message: '请选择生效时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="失效时间" name="validTo" rules={[{ required: true, message: '请选择失效时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function renderStatusTag(status: string) {
  return <Tag color={status === 'active' ? 'success' : 'default'}>{status}</Tag>;
}

export default BenefitProductPage;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, DatePicker, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import {
  AppstoreOutlined,
  EyeOutlined,
  FileSearchOutlined,
  GiftOutlined,
  ImportOutlined,
  KeyOutlined,
  LinkOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ListSearchCard from '@/components/admin/ListSearchCard';
import ListTableCard from '@/components/admin/ListTableCard';
import SubmitModalForm from '@/components/admin/SubmitModalForm';
import {
  confirmCredentialImport,
  createBatchCredentialExtractLinks,
  createCredentialCategory,
  createGeneratedCredentialBatch,
  createItemCredentialExtractLink,
  disableCredentialBatch,
  disableCredentialItem,
  enableCredentialItem,
  fetchCredentialBatches,
  fetchCredentialCategories,
  fetchCredentialImportTasks,
  fetchCredentialItems,
  fetchCredentialRedeemRecords,
  previewCredentialImport,
  revealCredentialItem,
} from '@/services/credential';
import type {
  CredentialBatch,
  CredentialCategory,
  CredentialImportPreview,
  CredentialImportTask,
  CredentialItem,
  CredentialRedeemRecord,
} from '@/types/credential';

type CredentialModuleKind = 'batches' | 'items' | 'extractLinks' | 'categories' | 'importTasks' | 'redeemRecords';
type CredentialRow = CredentialBatch | CredentialItem | CredentialCategory | CredentialImportTask | CredentialRedeemRecord;

interface CredentialModulePageProps {
  moduleKind: CredentialModuleKind;
}

interface SearchForm {
  keyword?: string;
  categoryId?: string;
  status?: string;
  batchId?: string;
}

interface GeneratedBatchForm {
  categoryId?: string;
  batchName?: string;
  totalCount: number;
  points: number;
  validRange?: [dayjs.Dayjs, dayjs.Dayjs];
  remark?: string;
}

interface ImportBatchForm {
  categoryId?: string;
  batchName?: string;
  rawText: string;
  delimiter: string;
  validRange?: [dayjs.Dayjs, dayjs.Dayjs];
  createExtractLinks?: boolean;
  itemsPerLink?: number;
  maxAccessCount?: number;
  expireAt?: dayjs.Dayjs;
  remark?: string;
}

interface LinkForm {
  itemsPerLink: number;
  maxAccessCount: number;
  expireAt?: dayjs.Dayjs;
  remark?: string;
}

interface CategoryForm {
  categoryCode: string;
  categoryName: string;
  fulfillmentType: string;
  generationMode: string;
}

const moduleMeta: Record<CredentialModuleKind, { title: string; icon: JSX.Element }> = {
  batches: { title: '凭证批次', icon: <GiftOutlined /> },
  items: { title: '凭证明细', icon: <KeyOutlined /> },
  extractLinks: { title: '提取链接', icon: <LinkOutlined /> },
  categories: { title: '凭证分类', icon: <AppstoreOutlined /> },
  importTasks: { title: '导入任务', icon: <ImportOutlined /> },
  redeemRecords: { title: '兑换记录', icon: <FileSearchOutlined /> },
};

/**
 * 凭证中心模块页面。
 * 承载批次、明细、分类、导入任务和兑换记录的真实列表与核心操作。
 * author: sunshengxian
 * 创建日期：2026-05-01
 */
function CredentialModulePage({ moduleKind }: CredentialModulePageProps) {
  const { message, modal } = App.useApp();
  const [searchForm] = Form.useForm<SearchForm>();
  const [generatedForm] = Form.useForm<GeneratedBatchForm>();
  const [importForm] = Form.useForm<ImportBatchForm>();
  const [linkForm] = Form.useForm<LinkForm>();
  const [categoryForm] = Form.useForm<CategoryForm>();
  const meta = moduleMeta[moduleKind];
  const [categories, setCategories] = useState<CredentialCategory[]>([]);
  const [records, setRecords] = useState<CredentialRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedOpen, setGeneratedOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState<CredentialBatch | CredentialItem>();
  const [importPreview, setImportPreview] = useState<CredentialImportPreview>();

  const loadCategories = useCallback(async () => {
    const response = await fetchCredentialCategories();
    if (response.code === 0) {
      setCategories(response.data);
    }
  }, []);

  const loadRecords = useCallback(async () => {
    if (moduleKind === 'extractLinks') {
      return;
    }
    setLoading(true);
    try {
      const values = searchForm.getFieldsValue();
      if (moduleKind === 'categories') {
        const response = await fetchCredentialCategories();
        setRecords(response.code === 0 ? response.data : []);
      }
      if (moduleKind === 'batches') {
        const response = await fetchCredentialBatches({ ...values, pageNo: 1, pageSize: 100 });
        setRecords(response.code === 0 ? response.data.records : []);
      }
      if (moduleKind === 'items') {
        const response = await fetchCredentialItems({ ...values, pageNo: 1, pageSize: 100 });
        setRecords(response.code === 0 ? response.data.records : []);
      }
      if (moduleKind === 'importTasks') {
        const response = await fetchCredentialImportTasks({ ...values, pageNo: 1, pageSize: 100 });
        setRecords(response.code === 0 ? response.data.records : []);
      }
      if (moduleKind === 'redeemRecords') {
        const response = await fetchCredentialRedeemRecords({ ...values, pageNo: 1, pageSize: 100 });
        setRecords(response.code === 0 ? response.data.records : []);
      }
    } finally {
      setLoading(false);
    }
  }, [moduleKind, searchForm]);

  const defaultCategoryId = useCallback((fulfillmentType: string) => {
    return categories.find((item) => item.fulfillmentType === fulfillmentType)?.id;
  }, [categories]);

  useEffect(() => {
    void loadCategories();
    void loadRecords();
  }, [loadCategories, loadRecords]);

  const handleGeneratedSubmit = async (values: GeneratedBatchForm) => {
    const response = await createGeneratedCredentialBatch({
      categoryId: values.categoryId,
      batchName: values.batchName,
      totalCount: values.totalCount,
      points: values.points,
      validFrom: values.validRange?.[0].format('YYYY-MM-DD HH:mm:ss'),
      validTo: values.validRange?.[1].format('YYYY-MM-DD HH:mm:ss'),
      remark: values.remark,
    });
    if (response.code !== 0) {
      return;
    }
    message.success('系统生成批次已创建');
    setGeneratedOpen(false);
    generatedForm.resetFields();
    void loadRecords();
  };

  const handlePreviewImport = async () => {
    const values = await importForm.validateFields();
    const response = await previewCredentialImport({
      categoryId: values.categoryId,
      rawText: values.rawText,
      delimiter: values.delimiter,
      trimBlank: true,
      batchDeduplicate: true,
      globalDeduplicate: true,
      caseSensitive: true,
    });
    if (response.code === 0) {
      setImportPreview(response.data);
    }
  };

  const handleImportSubmit = async (values: ImportBatchForm) => {
    const response = await confirmCredentialImport({
      categoryId: values.categoryId,
      batchName: values.batchName,
      rawText: values.rawText,
      delimiter: values.delimiter,
      validFrom: values.validRange?.[0].format('YYYY-MM-DD HH:mm:ss'),
      validTo: values.validRange?.[1].format('YYYY-MM-DD HH:mm:ss'),
      remark: values.remark,
      trimBlank: true,
      batchDeduplicate: true,
      globalDeduplicate: true,
      caseSensitive: true,
      createExtractLinks: values.createExtractLinks,
      itemsPerLink: values.itemsPerLink,
      maxAccessCount: values.maxAccessCount,
      expireAt: values.expireAt?.format('YYYY-MM-DD HH:mm:ss'),
    });
    if (response.code !== 0) {
      return;
    }
    message.success('卡密批次已导入');
    setImportOpen(false);
    setImportPreview(undefined);
    importForm.resetFields();
    void loadRecords();
  };

  const handleCreateLink = async (values: LinkForm) => {
    if (!linkTarget) {
      return;
    }
    const payload = {
      itemsPerLink: values.itemsPerLink,
      maxAccessCount: values.maxAccessCount,
      expireAt: values.expireAt?.format('YYYY-MM-DD HH:mm:ss'),
      remark: values.remark,
    };
    const response = 'batchNo' in linkTarget
      ? await createBatchCredentialExtractLinks(linkTarget.id, payload)
      : await createItemCredentialExtractLink(linkTarget.id, payload);
    if (response.code !== 0) {
      return;
    }
    message.success(`已生成 ${response.data.linkCount} 个提取链接`);
    setLinkTarget(undefined);
    linkForm.resetFields();
    void loadRecords();
  };

  const handleCreateCategory = async (values: CategoryForm) => {
    const response = await createCredentialCategory({ ...values, status: 'active' });
    if (response.code !== 0) {
      return;
    }
    message.success('凭证分类已创建');
    setCategoryOpen(false);
    categoryForm.resetFields();
    void loadRecords();
    void loadCategories();
  };

  const handleReveal = async (record: CredentialItem) => {
    const response = await revealCredentialItem(record.id);
    if (response.code !== 0) {
      return;
    }
    modal.info({
      title: `凭证明文 ${record.itemNo}`,
      content: <Input.TextArea value={response.data.secretText} readOnly autoSize />,
      okText: '关闭',
    });
  };

  const columns = useMemo<TableProps<CredentialRow>['columns']>(() => buildColumns(moduleKind, {
    onDisableBatch: async (record) => {
      await disableCredentialBatch(record.id);
      void loadRecords();
    },
    onCreateLink: (record) => {
      setLinkTarget(record);
      linkForm.setFieldsValue({ itemsPerLink: 1, maxAccessCount: 3, expireAt: undefined });
    },
    onDisableItem: async (record) => {
      await disableCredentialItem(record.id);
      void loadRecords();
    },
    onEnableItem: async (record) => {
      await enableCredentialItem(record.id);
      void loadRecords();
    },
    onReveal: (record) => void handleReveal(record),
  }), [linkForm, loadRecords, moduleKind]);

  const extra = (
    <Space>
      {moduleKind === 'categories' ? <Button type="primary" icon={<PlusOutlined />} onClick={() => setCategoryOpen(true)}>新增分类</Button> : null}
      {moduleKind === 'batches' ? (
        <>
          <Button icon={<ImportOutlined />} onClick={() => {
            importForm.setFieldsValue({
              categoryId: defaultCategoryId('TEXT_SECRET'),
              delimiter: '\\n',
              createExtractLinks: false,
              itemsPerLink: 1,
              maxAccessCount: 3,
            });
            setImportOpen(true);
          }}>导入卡密批次</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            generatedForm.setFieldsValue({
              categoryId: defaultCategoryId('POINTS_REDEEM'),
              totalCount: 100,
              points: 100,
            });
            setGeneratedOpen(true);
          }}>生成积分 CDK</Button>
        </>
      ) : null}
    </Space>
  );

  return (
    <div className="page-stack">
      {moduleKind !== 'categories' ? (
        <ListSearchCard<SearchForm> form={searchForm} loading={loading} onFinish={() => void loadRecords()} onReset={() => {
          searchForm.resetFields();
          void loadRecords();
        }}>
          {moduleKind !== 'importTasks' && moduleKind !== 'redeemRecords' ? (
            <Form.Item label="关键字" name="keyword">
              <Input allowClear placeholder="编号 / 名称" style={{ width: 220 }} />
            </Form.Item>
          ) : null}
          {(moduleKind === 'batches' || moduleKind === 'items' || moduleKind === 'importTasks') ? (
            <Form.Item label="分类" name="categoryId">
              <Select allowClear placeholder="全部分类" style={{ width: 180 }} options={categories.map((item) => ({ label: item.categoryName, value: item.id }))} />
            </Form.Item>
          ) : null}
          <Form.Item label="状态" name="status">
            <Select allowClear placeholder="全部状态" style={{ width: 140 }} options={statusOptions} />
          </Form.Item>
        </ListSearchCard>
      ) : null}

      <ListTableCard title={<span className="wallet-section-title"><span>{meta.icon}</span>{meta.title}</span>} extra={extra}>
        <Table<CredentialRow>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无记录" /> }}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1280 }}
          size="small"
        />
      </ListTableCard>

      <SubmitModalForm<GeneratedBatchForm> title="生成积分 CDK 批次" open={generatedOpen} form={generatedForm} width={680} onCancel={() => setGeneratedOpen(false)} onFinish={(values) => void handleGeneratedSubmit(values)}>
        <Form.Item label="分类" name="categoryId">
          <Select options={categories.filter((item) => item.fulfillmentType === 'POINTS_REDEEM').map((item) => ({ label: item.categoryName, value: item.id }))} />
        </Form.Item>
        <Form.Item label="批次名称" name="batchName">
          <Input placeholder="不填则自动生成" />
        </Form.Item>
        <Space.Compact block>
          <Form.Item label="数量" name="totalCount" rules={[{ required: true, message: '请输入数量' }]} style={{ width: '50%' }}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="每张积分" name="points" rules={[{ required: true, message: '请输入积分' }]} style={{ width: '50%' }}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        </Space.Compact>
        <Form.Item label="有效期" name="validRange">
          <DatePicker.RangePicker showTime style={{ width: '100%' }} placeholder={['默认当前时间', '默认永久有效']} />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input />
        </Form.Item>
      </SubmitModalForm>

      <SubmitModalForm<ImportBatchForm> title="导入卡密批次" open={importOpen} form={importForm} width={820} onCancel={() => {
        setImportOpen(false);
        setImportPreview(undefined);
      }} onFinish={(values) => void handleImportSubmit(values)}>
        <Form.Item label="分类" name="categoryId">
          <Select options={categories.filter((item) => item.fulfillmentType === 'TEXT_SECRET').map((item) => ({ label: item.categoryName, value: item.id }))} />
        </Form.Item>
        <Form.Item label="批次名称" name="batchName">
          <Input placeholder="不填则自动生成" />
        </Form.Item>
        <Form.Item label="有效期" name="validRange">
          <DatePicker.RangePicker showTime style={{ width: '100%' }} placeholder={['默认当前时间', '默认永久有效']} />
        </Form.Item>
        <Form.Item label="分隔符" name="delimiter" rules={[{ required: true, message: '请选择分隔符' }]}>
          <Select options={[
            { label: '换行', value: '\\n' },
            { label: '逗号', value: ',' },
            { label: '分号', value: ';' },
            { label: 'Tab', value: '\\t' },
          ]} />
        </Form.Item>
        <Form.Item label="卡密文本" name="rawText" rules={[{ required: true, message: '请粘贴卡密文本' }]}>
          <Input.TextArea rows={8} />
        </Form.Item>
        <Space>
          <Button onClick={() => void handlePreviewImport()}>解析预览</Button>
          {importPreview ? <Tag color="blue">有效 {importPreview.validRows} / 重复 {importPreview.duplicateRows} / 错误 {importPreview.invalidRows}</Tag> : null}
        </Space>
        {importPreview ? (
          <Table
            style={{ marginTop: 12 }}
            size="small"
            pagination={false}
            rowKey="lineNo"
            dataSource={importPreview.previews}
            columns={[
              { title: '行号', dataIndex: 'lineNo', width: 80 },
              { title: '脱敏值', dataIndex: 'secretMask', width: 180 },
              { title: '状态', dataIndex: 'status', width: 110, render: renderStatusTag },
              { title: '说明', dataIndex: 'message' },
            ]}
          />
        ) : null}
        <Form.Item label="导入后生成提取链接" name="createExtractLinks" valuePropName="checked" style={{ marginTop: 16 }}>
          <Switch />
        </Form.Item>
        <Space.Compact block>
          <Form.Item label="每链接数量" name="itemsPerLink" style={{ width: '33%' }}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="访问次数" name="maxAccessCount" style={{ width: '33%' }}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="链接过期时间" name="expireAt" style={{ width: '34%' }}>
            <DatePicker showTime style={{ width: '100%' }} placeholder="默认永久有效" />
          </Form.Item>
        </Space.Compact>
      </SubmitModalForm>

      <SubmitModalForm<LinkForm> title="生成提取链接" open={!!linkTarget} form={linkForm} onCancel={() => setLinkTarget(undefined)} onFinish={(values) => void handleCreateLink(values)}>
        <Form.Item label="每链接数量" name="itemsPerLink" rules={[{ required: true, message: '请输入每链接数量' }]}>
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="访问次数" name="maxAccessCount" rules={[{ required: true, message: '请输入访问次数' }]}>
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="过期时间" name="expireAt">
          <DatePicker showTime style={{ width: '100%' }} placeholder="默认永久有效" />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input />
        </Form.Item>
      </SubmitModalForm>

      <SubmitModalForm<CategoryForm> title="新增凭证分类" open={categoryOpen} form={categoryForm} onCancel={() => setCategoryOpen(false)} onFinish={(values) => void handleCreateCategory(values)}>
        <Form.Item label="编码" name="categoryCode" rules={[{ required: true, message: '请输入分类编码' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="名称" name="categoryName" rules={[{ required: true, message: '请输入分类名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="履约类型" name="fulfillmentType" rules={[{ required: true, message: '请选择履约类型' }]}>
          <Select options={[{ label: '积分兑换', value: 'POINTS_REDEEM' }, { label: '文本卡密', value: 'TEXT_SECRET' }]} />
        </Form.Item>
        <Form.Item label="生成模式" name="generationMode" rules={[{ required: true, message: '请选择生成模式' }]}>
          <Select options={[{ label: '系统生成', value: 'SYSTEM_GENERATED' }, { label: '文本导入', value: 'TEXT_IMPORTED' }, { label: '混合', value: 'MIXED' }]} />
        </Form.Item>
      </SubmitModalForm>
    </div>
  );
}

function buildColumns(
  moduleKind: CredentialModuleKind,
  handlers: {
    onDisableBatch: (record: CredentialBatch) => Promise<void>;
    onCreateLink: (record: CredentialBatch | CredentialItem) => void;
    onDisableItem: (record: CredentialItem) => Promise<void>;
    onEnableItem: (record: CredentialItem) => Promise<void>;
    onReveal: (record: CredentialItem) => void;
  },
): TableProps<CredentialRow>['columns'] {
  if (moduleKind === 'categories') {
    return [
      { title: '编码', dataIndex: 'categoryCode', width: 180 },
      { title: '名称', dataIndex: 'categoryName', width: 160 },
      { title: '履约类型', dataIndex: 'fulfillmentType', width: 160, render: renderFulfillment },
      { title: '生成模式', dataIndex: 'generationMode', width: 160 },
      { title: '状态', dataIndex: 'status', width: 110, render: renderStatusTag },
      { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
    ];
  }
  if (moduleKind === 'batches') {
    return [
      { title: '批次', dataIndex: 'batchName', width: 240, render: (_, record) => renderBatchCell(record as CredentialBatch) },
      { title: '分类', dataIndex: 'categoryName', width: 140 },
      { title: '履约类型', dataIndex: 'fulfillmentType', width: 140, render: renderFulfillment },
      { title: '总数', dataIndex: 'totalCount', width: 90, align: 'right' },
      { title: '可用', dataIndex: 'availableCount', width: 90, align: 'right' },
      { title: '已消费', dataIndex: 'consumedCount', width: 90, align: 'right' },
      { title: '已链接', dataIndex: 'linkedCount', width: 90, align: 'right' },
      { title: '状态', dataIndex: 'status', width: 110, render: renderStatusTag },
      { title: '有效期', key: 'valid', width: 320, render: (_, record) => `${(record as CredentialBatch).validFrom} 至 ${(record as CredentialBatch).validTo}` },
      {
        title: '操作',
        key: 'actions',
        fixed: 'right',
        width: 210,
        render: (_, record) => {
          const batch = record as CredentialBatch;
          return (
            <Space size={4}>
              <Button type="link" icon={<LinkOutlined />} disabled={batch.status !== 'active'} onClick={() => handlers.onCreateLink(batch)}>生成链接</Button>
              <Popconfirm title="确认停用该批次？" onConfirm={() => void handlers.onDisableBatch(batch)}>
                <Button type="link" danger icon={<StopOutlined />} disabled={batch.status !== 'active'}>停用</Button>
              </Popconfirm>
            </Space>
          );
        },
      },
    ];
  }
  if (moduleKind === 'items') {
    return [
      { title: '编号', dataIndex: 'itemNo', width: 220 },
      { title: '脱敏值', dataIndex: 'secretMask', width: 180 },
      { title: '来源', dataIndex: 'sourceType', width: 120 },
      { title: '状态', dataIndex: 'status', width: 110, render: renderStatusTag },
      { title: '消费单号', dataIndex: 'consumeBizNo', width: 220, render: (value) => value || '-' },
      { title: '时间', dataIndex: 'updatedAt', width: 180 },
      {
        title: '操作',
        key: 'actions',
        fixed: 'right',
        width: 260,
        render: (_, record) => {
          const item = record as CredentialItem;
          return (
            <Space size={4}>
              <Button type="link" icon={<EyeOutlined />} onClick={() => handlers.onReveal(item)}>明文</Button>
              <Button type="link" icon={<LinkOutlined />} disabled={item.status !== 'active'} onClick={() => handlers.onCreateLink(item)}>生成链接</Button>
              {item.status === 'disabled' ? (
                <Button type="link" onClick={() => void handlers.onEnableItem(item)}>启用</Button>
              ) : (
                <Popconfirm title="确认停用该凭证？" onConfirm={() => void handlers.onDisableItem(item)}>
                  <Button type="link" danger disabled={item.status !== 'active' && item.status !== 'linked'}>停用</Button>
                </Popconfirm>
              )}
            </Space>
          );
        },
      },
    ];
  }
  if (moduleKind === 'importTasks') {
    return [
      { title: '任务号', dataIndex: 'taskNo', width: 220 },
      { title: '分类', dataIndex: 'categoryName', width: 140 },
      { title: '总行', dataIndex: 'totalRows', width: 90, align: 'right' },
      { title: '有效', dataIndex: 'validRows', width: 90, align: 'right' },
      { title: '重复', dataIndex: 'duplicateRows', width: 90, align: 'right' },
      { title: '错误', dataIndex: 'invalidRows', width: 90, align: 'right' },
      { title: '状态', dataIndex: 'status', width: 110, render: renderStatusTag },
      { title: '时间', dataIndex: 'createdAt', width: 180 },
    ];
  }
  return [
    { title: '记录号', dataIndex: 'recordNo', width: 220 },
    { title: '用户', dataIndex: 'userId', width: 120 },
    { title: '积分', dataIndex: 'points', width: 100, align: 'right' },
    { title: '账本流水', dataIndex: 'ledgerNo', width: 220, render: (value) => value || '-' },
    { title: '状态', dataIndex: 'status', width: 110, render: renderStatusTag },
    { title: '失败原因', dataIndex: 'failureReason', width: 160, render: (value) => value || '-' },
    { title: '时间', dataIndex: 'createdAt', width: 180 },
  ];
}

function renderBatchCell(record: CredentialBatch) {
  return (
    <div className="query-name-cell">
      <strong>{record.batchName}</strong>
      <span>{record.batchNo}</span>
    </div>
  );
}

function renderFulfillment(value: string) {
  const text = value === 'POINTS_REDEEM' ? '积分兑换' : value === 'TEXT_SECRET' ? '文本卡密' : value;
  return <Tag color={value === 'POINTS_REDEEM' ? 'purple' : 'blue'}>{text}</Tag>;
}

function renderStatusTag(status: string) {
  const colorMap: Record<string, string> = {
    active: 'success',
    disabled: 'default',
    success: 'success',
    failed: 'error',
    previewed: 'processing',
    linked: 'processing',
    extracted: 'blue',
    redeemed: 'purple',
    duplicate: 'warning',
    invalid: 'error',
    valid: 'success',
  };
  return <Tag color={colorMap[status] || 'default'}>{status || '-'}</Tag>;
}

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '已链接', value: 'linked' },
  { label: '已提取', value: 'extracted' },
  { label: '已兑换', value: 'redeemed' },
];

export default CredentialModulePage;

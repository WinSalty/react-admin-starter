import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Empty, Input, InputNumber, Space, Switch, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { Access } from '@/components/Access';
import { fetchSystemConfigs, saveSystemConfig } from '@/services/system';
import type { SystemConfigRecord, SystemConfigType } from '@/types/system';

/**
 * 系统配置页面模板。
 * 覆盖基础参数、开关配置和前端缓存配置入口，数据统一通过后端配置接口获取。
 * author: sunshengxian
 * 创建日期：2026-04-17
 */
function SystemConfigPage() {
  const { message } = App.useApp();
  const [records, setRecords] = useState<SystemConfigRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState('');

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchSystemConfigs();
      if (response.code !== 0) {
        message.error(response.message || '系统配置获取失败');
        return;
      }
      setRecords(response.data);
    } catch {
      message.error('系统配置获取失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadConfigs();
  }, [loadConfigs]);

  const columns = useMemo<TableProps<SystemConfigRecord>['columns']>(
    () => [
      {
        title: '配置项',
        dataIndex: 'name',
        width: 240,
        render: (_, record) => (
          <div className="query-name-cell">
            <strong>{record.name}</strong>
            <span>{record.code}</span>
          </div>
        ),
      },
      {
        title: '类型',
        dataIndex: 'type',
        width: 120,
        render: (type: SystemConfigType) => renderConfigType(type),
      },
      {
        title: '当前值',
        dataIndex: 'value',
        width: 260,
        render: (_, record) => renderConfigValue(record, (value) => void handleSave(record.id, value)),
      },
      { title: '说明', dataIndex: 'description', width: 360 },
      { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
      {
        title: '操作',
        key: 'action',
        width: 110,
        fixed: 'right',
        render: (_, record) => (
          <Access action="system:config:edit">
            <Button
              type="link"
              loading={savingId === record.id}
              onClick={() => void handleSave(record.id, record.value)}
            >
              保存
            </Button>
          </Access>
        ),
      },
    ],
    [savingId],
  );

  async function handleSave(id: string, value: SystemConfigRecord['value']) {
    setSavingId(id);
    try {
      const response = await saveSystemConfig(id, value);
      if (response.code !== 0 || !response.data) {
        message.error(response.message || '配置保存失败');
        return;
      }
      message.success(response.message);
      setRecords((prev) => prev.map((item) => (item.id === id ? response.data as SystemConfigRecord : item)));
    } catch {
      message.error('配置保存失败，请稍后重试');
    } finally {
      setSavingId('');
    }
  }

  function patchLocalValue(id: string, value: SystemConfigRecord['value']) {
    setRecords((prev) => prev.map((item) => (item.id === id ? { ...item, value } : item)));
  }

  function renderConfigValue(
    record: SystemConfigRecord,
    onCommit: (value: SystemConfigRecord['value']) => void,
  ) {
    if (record.type === 'switch') {
      return (
        <Switch
          checked={Boolean(record.value)}
          checkedChildren="开启"
          unCheckedChildren="关闭"
          onChange={(checked) => {
            patchLocalValue(record.id, checked);
            onCommit(checked);
          }}
        />
      );
    }
    if (typeof record.value === 'number') {
      return (
        <InputNumber
          value={record.value}
          min={0}
          style={{ width: '100%' }}
          onChange={(value) => patchLocalValue(record.id, Number(value || 0))}
        />
      );
    }
    return (
      <Input
        value={String(record.value)}
        onChange={(event) => patchLocalValue(record.id, event.target.value)}
      />
    );
  }

  return (
    <div className="page-stack">
      <Card title="系统配置">
        <p className="system-module-desc">
          系统配置页面提供基础参数、开关配置和前端缓存配置入口。
        </p>
        <Space size={[8, 8]} wrap className="config-entry-tags">
          <Tag color="blue">基础参数</Tag>
          <Tag color="green">开关配置</Tag>
          <Tag color="orange">前端缓存</Tag>
        </Space>
        <Table<SystemConfigRecord>
          columns={columns}
          dataSource={records}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无系统配置" /> }}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1180 }}
        />
      </Card>
    </div>
  );
}

function renderConfigType(type: SystemConfigType) {
  const labelMap: Record<SystemConfigType, string> = {
    basic: '基础参数',
    switch: '开关配置',
    cache: '缓存配置',
  };
  const colorMap: Record<SystemConfigType, string> = {
    basic: 'blue',
    switch: 'green',
    cache: 'orange',
  };
  return <Tag color={colorMap[type]}>{labelMap[type]}</Tag>;
}

export default SystemConfigPage;

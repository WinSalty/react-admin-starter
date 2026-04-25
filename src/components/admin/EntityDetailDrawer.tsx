import type { ReactNode } from 'react';
import type { DescriptionsProps } from 'antd';
import { Descriptions, Drawer } from 'antd';

export interface DetailField<RecordType> {
  key: string;
  label: ReactNode;
  render: (record: RecordType) => ReactNode;
}

interface EntityDetailDrawerProps<RecordType> {
  title: ReactNode;
  open: boolean;
  record?: RecordType;
  loading?: boolean;
  width?: number;
  fields: Array<DetailField<RecordType>>;
  emptyText?: ReactNode;
  onClose: () => void;
}

/**
 * 实体详情抽屉。
 * 统一渲染列表详情页的加载态、空态和描述字段，减少页面内重复分支。
 * author: sunshengxian
 * 创建日期：2026-04-25
 */
function EntityDetailDrawer<RecordType>({
  title,
  open,
  record,
  loading = false,
  width = 560,
  fields,
  emptyText = '暂无详情',
  onClose,
}: EntityDetailDrawerProps<RecordType>) {
  return (
    <Drawer title={title} width={width} open={open} onClose={onClose}>
      <Descriptions bordered column={1} size="small" items={buildItems(record, fields, loading, emptyText)} />
    </Drawer>
  );
}

function buildItems<RecordType>(
  record: RecordType | undefined,
  fields: Array<DetailField<RecordType>>,
  loading: boolean,
  emptyText: ReactNode,
): DescriptionsProps['items'] {
  if (loading) {
    return [{ key: 'loading', label: '加载状态', children: '加载中' }];
  }
  if (!record) {
    return [{ key: 'empty', label: '加载状态', children: emptyText }];
  }
  return fields.map((field) => ({
    key: field.key,
    label: field.label,
    children: field.render(record),
  }));
}

export default EntityDetailDrawer;

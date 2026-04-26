import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { FormInstance, FormProps } from 'antd';
import { Button, Card, Form, Space } from 'antd';

const DEFAULT_SEARCH_TITLE = '筛选查询';
const DEFAULT_SEARCH_TEXT = '查询';
const DEFAULT_RESET_TEXT = '重置';

interface ListSearchCardProps<FormValues extends object> {
  form: FormInstance<FormValues>;
  children: ReactNode;
  title?: ReactNode;
  loading?: boolean;
  className?: string;
  showActions?: boolean;
  onFinish?: FormProps<FormValues>['onFinish'];
  onReset?: () => void;
  onValuesChange?: FormProps<FormValues>['onValuesChange'];
}

/**
 * 列表筛选查询卡片。
 * 统一承载列表页的查询条件、重置按钮和提交按钮。
 * author: sunshengxian
 * 创建日期：2026-04-26
 */
function ListSearchCard<FormValues extends object>({
  form,
  children,
  title = DEFAULT_SEARCH_TITLE,
  loading = false,
  className,
  showActions = true,
  onFinish,
  onReset,
  onValuesChange,
}: ListSearchCardProps<FormValues>) {
  const formClassName = ['query-form', 'admin-search-form', className].filter(Boolean).join(' ');

  return (
    <Card className="admin-search-card" title={title}>
      <Form
        form={form}
        layout="inline"
        className={formClassName}
        onFinish={onFinish}
        onValuesChange={onValuesChange}
      >
        {children}
        {showActions ? (
          <Form.Item className="admin-search-actions">
            <Space>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                {DEFAULT_RESET_TEXT}
              </Button>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                {DEFAULT_SEARCH_TEXT}
              </Button>
            </Space>
          </Form.Item>
        ) : null}
      </Form>
    </Card>
  );
}

export default ListSearchCard;

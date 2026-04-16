import { Button, Card, Empty, Form, Input, Select, Space, Table, Typography } from 'antd';
import { Access } from '@/components/Access';

const { Title, Paragraph } = Typography;

/**
 * 查询管理占位页面，阶段 6 会接入真实查询模板。
 * 按钮权限已接入 Access 组件控制，无权限时按钮隐藏。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function QueryList() {
  return (
    <div className="page-stack">
      <div className="compact-page-header">
        <div>
          <Title level={3}>查询管理</Title>
          <Paragraph>标准列表页模板，后续接入 service、分页、详情和新增编辑弹窗。</Paragraph>
        </div>
      </div>

      <Card>
        <Form layout="inline" className="query-form">
          <Form.Item label="关键字" name="keyword">
            <Input placeholder="名称 / 编码 / 描述" allowClear />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              allowClear
              placeholder="全部状态"
              style={{ width: 160 }}
              options={[
                { label: '启用', value: 'active' },
                { label: '停用', value: 'disabled' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button>重置</Button>
              <Button type="primary">查询</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="查询结果" extra={
        <Access action="query:add">
          <Button type="primary">新增</Button>
        </Access>
      }>
        <Table
          columns={[
            { title: '名称', dataIndex: 'name' },
            { title: '状态', dataIndex: 'status' },
            { title: '创建时间', dataIndex: 'createdAt' },
          ]}
          dataSource={[]}
          locale={{ emptyText: <Empty description="暂无查询结果" /> }}
          rowKey="id"
        />
      </Card>
    </div>
  );
}

export default QueryList;

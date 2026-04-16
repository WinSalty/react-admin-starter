import { Card, Descriptions, Typography } from 'antd';

const { Title, Paragraph } = Typography;

/**
 * 权限目录占位页面，阶段 4 将接入权限接口。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function PermissionPage() {
  return (
    <div className="page-stack">
      <div className="compact-page-header">
        <div>
          <Title level={3}>权限目录</Title>
          <Paragraph>预留菜单权限、路由权限、按钮权限和后端字段 mapper。</Paragraph>
        </div>
      </div>
      <Card title="权限接入计划">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="菜单权限">控制侧边栏目录显示</Descriptions.Item>
          <Descriptions.Item label="路由权限">控制页面访问</Descriptions.Item>
          <Descriptions.Item label="按钮权限">控制页面按钮和表格操作列</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}

export default PermissionPage;

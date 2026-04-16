import { Card, Descriptions, Tag, Typography } from 'antd';
import { PageHeader } from '@/components/PageHeader';
import { useAuthStore } from '@/stores/auth';

const { Paragraph } = Typography;

/**
 * 权限目录页面，展示当前用户的权限信息和权限模型说明。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function PermissionPage() {
  const routeCodes = useAuthStore((state) => state.routeCodes);
  const actions = useAuthStore((state) => state.actions);
  const role = useAuthStore((state) => state.role);

  return (
    <div className="page-stack">
      <PageHeader title="权限目录" description={`当前登录用户：${role || '未知账号'}`} />

      <Card title="路由权限">
        {routeCodes.length === 0 ? (
          <Paragraph type="secondary">暂无路由权限或权限数据未加载。</Paragraph>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {routeCodes.map((code) => (
              <Tag key={code} color="blue">{code}</Tag>
            ))}
          </div>
        )}
      </Card>

      <Card title="按钮权限">
        {actions.length === 0 ? (
          <Paragraph type="secondary">暂无按钮权限。</Paragraph>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {actions.map((action) => (
              <Tag key={action.code} color="green">{action.name}（{action.code}）</Tag>
            ))}
          </div>
        )}
      </Card>

      <Card title="权限接入计划">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="菜单权限">控制侧边栏目录显示，通过 routeCodes 过滤</Descriptions.Item>
          <Descriptions.Item label="路由权限">控制页面访问，无权限时跳转至 403</Descriptions.Item>
          <Descriptions.Item label="按钮权限">控制页面按钮和表格操作列，使用 Access 组件</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}

export default PermissionPage;

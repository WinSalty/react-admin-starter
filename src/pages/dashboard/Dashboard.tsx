import { Card, Result, Space, Typography } from 'antd';

const { Paragraph, Title } = Typography;

/**
 * Ant Design 版后台首页占位页面。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function Dashboard() {
  return (
    <main className="starter-page">
      <Card>
        <Space direction="vertical" size={16}>
          <Title level={2}>React Admin Starter</Title>
          <Paragraph>
            Ant Design 版基础工程已启动。后续阶段会接入后台布局、菜单权限、登录注册、查询管理和
            ECharts 数据统计。
          </Paragraph>
          <Result status="success" title="Ant Design 基础工程已准备" subTitle="当前页面用于验证主题、路由和构建配置。" />
        </Space>
      </Card>
    </main>
  );
}

export default Dashboard;

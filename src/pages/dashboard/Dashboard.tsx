import { Card, Col, Row, Statistic, Typography } from 'antd';

const { Paragraph, Title } = Typography;

/**
 * Ant Design 版后台首页占位页面。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function Dashboard() {
  return (
    <div className="page-stack">
      <Card>
        <div className="page-title-block">
          <Title level={2}>React Admin Starter</Title>
          <Paragraph>
            Ant Design 版后台基础布局已启动。后续阶段会接入权限、认证、查询管理和 ECharts 数据统计。
          </Paragraph>
        </div>
      </Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="菜单数量" value={4} suffix="项" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="页面模板" value={6} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="权限占位" value={3} suffix="类" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="构建状态" value="通过" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;

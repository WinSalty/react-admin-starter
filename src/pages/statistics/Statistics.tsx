import { Card, Col, Row } from 'antd';
import { PageHeader } from '@/components/PageHeader';

/**
 * 数据统计占位页面，阶段 5 将接入 ECharts。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function Statistics() {
  return (
    <div className="page-stack">
      <PageHeader title="数据统计" description="趋势图、柱状图和状态分布图区域。" />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="访问趋势">
            <div className="chart-placeholder">ECharts Line</div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="分类统计">
            <div className="chart-placeholder">ECharts Bar</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Statistics;

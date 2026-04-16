import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons';
import { Alert, Card, Col, Row, Skeleton, Statistic, Typography } from 'antd';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { fetchDashboardOverview } from '@/services/dashboard';
import type {
  CategoryBarItem,
  DashboardMetric,
  DashboardOverview,
  StatusPieItem,
  TrendPoint,
} from '@/types/dashboard';

const { Paragraph, Title } = Typography;

/**
 * Ant Design 版后台首页，展示统计卡片和 ECharts 数据看板。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview>();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchDashboardOverview()
      .then((response) => {
        if (!mounted) {
          return;
        }
        if (response.code !== 0) {
          setErrorMessage(response.message || 'Dashboard 数据获取失败');
          return;
        }
        setOverview(response.data);
        setErrorMessage('');
      })
      .catch(() => {
        if (mounted) {
          setErrorMessage('Dashboard 数据获取失败，请稍后重试');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const trendOption = useMemo(
    () => (overview ? buildTrendOption(overview.trend) : undefined),
    [overview],
  );
  const categoryOption = useMemo(
    () => (overview ? buildCategoryOption(overview.categories) : undefined),
    [overview],
  );
  const statusOption = useMemo(
    () => (overview ? buildStatusOption(overview.statusDistribution) : undefined),
    [overview],
  );

  return (
    <div className="page-stack">
      <div className="compact-page-header">
        <div>
          <Title level={3}>工作台</Title>
          <Paragraph>核心指标、访问趋势和业务分布概览。</Paragraph>
        </div>
      </div>

      {errorMessage ? <Alert message={errorMessage} type="error" showIcon /> : null}

      <Row gutter={[16, 16]}>
        {(overview?.metrics || []).map((metric) => (
          <Col xs={24} sm={12} xl={6} key={metric.key}>
            <MetricCard metric={metric} loading={loading} />
          </Col>
        ))}
        {loading && !overview
          ? Array.from({ length: 4 }).map((_, index) => (
              <Col xs={24} sm={12} xl={6} key={index}>
                <Card>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Card>
              </Col>
            ))
          : null}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="访问与订单趋势" loading={loading && !trendOption}>
            <ChartPanel option={trendOption} height={320} />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="模块使用排行" loading={loading && !categoryOption}>
            <ChartPanel option={categoryOption} height={320} />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="业务状态分布" loading={loading && !statusOption}>
            <ChartPanel option={statusOption} height={320} />
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card title="运行摘要">
            <div className="dashboard-summary-grid">
              <div>
                <span>权限菜单</span>
                <strong>动态下发</strong>
              </div>
              <div>
                <span>图表来源</span>
                <strong>service/mock</strong>
              </div>
              <div>
                <span>页面状态</span>
                <strong>loading/error</strong>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

/**
 * 统计卡片组件，统一展示指标数值和趋势。
 */
function MetricCard({ metric, loading }: { metric: DashboardMetric; loading: boolean }) {
  const trendClassName = `metric-trend metric-trend-${metric.trendType}`;
  const iconMap = {
    up: <ArrowUpOutlined />,
    down: <ArrowDownOutlined />,
    stable: <MinusOutlined />,
  };

  return (
    <Card className="metric-card">
      <Skeleton loading={loading} active paragraph={false}>
        <Statistic
          title={metric.title}
          value={metric.value}
          precision={metric.precision}
          suffix={metric.suffix}
        />
        <div className={trendClassName}>
          {iconMap[metric.trendType]}
          <span>{metric.trendLabel}</span>
          <strong>{metric.trendValue}</strong>
        </div>
      </Skeleton>
    </Card>
  );
}

/**
 * ECharts 容器组件，负责初始化、更新和销毁图表实例。
 */
function ChartPanel({ option, height }: { option?: EChartsOption; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !option) {
      return undefined;
    }

    const chart = echarts.init(containerRef.current);
    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [option]);

  return <div ref={containerRef} className="dashboard-chart" style={{ height }} />;
}

/**
 * 构建趋势图配置。
 */
function buildTrendOption(points: TrendPoint[]): EChartsOption {
  return {
    color: ['#1677ff', '#52c41a'],
    tooltip: { trigger: 'axis' },
    legend: { top: 0, data: ['访问量', '订单量'] },
    grid: { top: 48, right: 24, bottom: 28, left: 44 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: points.map((item) => item.date),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.12 },
        data: points.map((item) => item.visits),
      },
      {
        name: '订单量',
        type: 'line',
        smooth: true,
        data: points.map((item) => item.orders),
      },
    ],
  };
}

/**
 * 构建柱状图配置。
 */
function buildCategoryOption(items: CategoryBarItem[]): EChartsOption {
  return {
    color: ['#1677ff'],
    tooltip: { trigger: 'axis' },
    grid: { top: 24, right: 18, bottom: 64, left: 44 },
    xAxis: {
      type: 'category',
      axisLabel: { interval: 0, rotate: 28 },
      data: items.map((item) => item.name),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        barWidth: 28,
        data: items.map((item) => item.value),
      },
    ],
  };
}

/**
 * 构建饼图配置。
 */
function buildStatusOption(items: StatusPieItem[]): EChartsOption {
  return {
    color: ['#1677ff', '#faad14', '#52c41a', '#ff4d4f'],
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        name: '业务状态',
        type: 'pie',
        radius: ['46%', '70%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        label: { formatter: '{b}: {d}%' },
        data: items,
      },
    ],
  };
}

export default Dashboard;

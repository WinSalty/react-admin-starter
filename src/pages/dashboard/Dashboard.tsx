import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertOutlined,
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  FundOutlined,
  MinusOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Card,
  Col,
  List,
  Row,
  Skeleton,
  Statistic,
  Table,
  Typography,
} from 'antd';
import type { TableProps } from 'antd';
import * as echarts from 'echarts';
import { NoticeDetailModal } from '@/components/NoticeHighlights';
import { useActiveNotices } from '@/hooks/useActiveNotices';
import type { EChartsOption } from 'echarts';
import { fetchDashboardOverview } from '@/services/dashboard';
import type {
  CategoryBarItem,
  DashboardMetric,
  DashboardOverview,
  StatusPieItem,
  TrendPoint,
} from '@/types/dashboard';
import type { NoticeRecord } from '@/types/notice';

const { Text } = Typography;

interface DashboardTableRow {
  key: string;
  moduleName: string;
  usageCount: number;
  usageRatio: number;
  peakDate: string;
  peakVisits: number;
}

/**
 * Ant Design 版后台首页，展示统计卡片和 ECharts 数据看板。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview>();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const {
    notices,
    loading: noticesLoading,
    errorMessage: noticeErrorMessage,
  } = useActiveNotices();

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
  const statusOption = useMemo(
    () => (overview ? buildStatusOption(overview.statusDistribution) : undefined),
    [overview],
  );
  const trendRange = useMemo(() => buildTrendRangeLabel(overview?.trend), [overview]);
  const statusLegend = useMemo(
    () => buildStatusLegend(overview?.statusDistribution || []),
    [overview?.statusDistribution],
  );
  const moduleRows = useMemo(
    () => buildModuleRows(overview?.categories || [], overview?.trend || []),
    [overview?.categories, overview?.trend],
  );
  const moduleColumns = useMemo<TableProps<DashboardTableRow>['columns']>(
    () => [
      {
        title: '模块名称',
        dataIndex: 'moduleName',
        key: 'moduleName',
      },
      {
        title: '使用次数',
        dataIndex: 'usageCount',
        key: 'usageCount',
        align: 'right',
      },
      {
        title: '访问占比',
        dataIndex: 'usageRatio',
        key: 'usageRatio',
        align: 'right',
        render: (value: number) => `${value.toFixed(1)}%`,
      },
      {
        title: '峰值日期',
        dataIndex: 'peakDate',
        key: 'peakDate',
      },
      {
        title: '峰值访问',
        dataIndex: 'peakVisits',
        key: 'peakVisits',
        align: 'right',
      },
    ],
    [],
  );

  return (
    <div className="page-stack dashboard-workbench">
      {errorMessage ? <Alert message={errorMessage} type="error" showIcon /> : null}

      <Row gutter={[12, 12]}>
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

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={15}>
          <Card
            className="dashboard-panel-card"
            title="访问与订单趋势"
            extra={trendRange ? <Text type="secondary">{trendRange}</Text> : null}
            loading={loading && !trendOption}
          >
            <ChartPanel option={trendOption} height={300} />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card className="dashboard-panel-card" title="业务状态分布" loading={loading && !statusOption}>
            <div className="dashboard-panel-split">
              <ChartPanel option={statusOption} height={256} />
              <div className="dashboard-source-legend">
                {statusLegend.map((item) => (
                  <div key={item.name} className="source-legend-item">
                    <div className="source-legend-heading">
                      <span className="source-legend-dot" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <strong>{item.ratio}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={15}>
          <Card className="dashboard-panel-card" title="模块使用明细">
            <Table<DashboardTableRow>
              className="dashboard-data-table"
              columns={moduleColumns}
              dataSource={moduleRows}
              loading={loading}
              pagination={false}
              rowKey="key"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <NoticeQuickPanel notices={notices} loading={noticesLoading} errorMessage={noticeErrorMessage} />
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

  return (
    <Card className="metric-card">
      <Skeleton loading={loading} active paragraph={false}>
        <div className="metric-card-body">
          <div className={`metric-card-icon metric-card-icon-${metric.key}`}>
            {resolveMetricIcon(metric)}
          </div>
          <div className="metric-card-content">
            <Statistic
              title={metric.title}
              value={metric.value}
              precision={metric.precision}
              suffix={metric.suffix}
            />
            <div className={trendClassName}>
              {renderTrendIcon(metric.trendType)}
              <span>{metric.trendLabel}</span>
              <strong>{metric.trendValue}</strong>
            </div>
          </div>
        </div>
      </Skeleton>
    </Card>
  );
}

/**
 * 工作台公告简表，采用更紧凑的列表形态适配右侧栏位。
 */
function NoticeQuickPanel({
  notices,
  loading,
  errorMessage,
}: {
  notices: NoticeRecord[];
  loading: boolean;
  errorMessage?: string;
}) {
  const [selectedNotice, setSelectedNotice] = useState<NoticeRecord>();
  const visibleNotices = useMemo(() => [...notices].sort(sortNotices).slice(0, 4), [notices]);

  return (
    <>
      <Card className="dashboard-panel-card" title="系统公告">
        {errorMessage ? <Alert message={errorMessage} type="warning" showIcon style={{ marginBottom: 16 }} /> : null}
        <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
          <List
            className="notice-quick-list"
            locale={{ emptyText: '当前没有生效公告' }}
            dataSource={visibleNotices}
            renderItem={(notice) => (
              <List.Item key={notice.id} className="notice-quick-list-item" onClick={() => setSelectedNotice(notice)}>
                <div className="notice-quick-item">
                  <div className="notice-quick-main">
                    <span className="notice-quick-dot" />
                    <Text ellipsis={{ tooltip: notice.title }}>{notice.title}</Text>
                  </div>
                  <Text type="secondary">{notice.publishTime?.slice(5, 10)}</Text>
                </div>
              </List.Item>
            )}
          />
        </Skeleton>
      </Card>
      <NoticeDetailModal notice={selectedNotice} onClose={() => setSelectedNotice(undefined)} />
    </>
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
 * 构建饼图配置。
 */
function buildStatusOption(items: StatusPieItem[]): EChartsOption {
  return {
    color: ['#1677ff', '#faad14', '#52c41a', '#ff4d4f'],
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '业务状态',
        type: 'pie',
        radius: ['46%', '70%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        label: { show: false },
        data: items,
      },
    ],
  };
}

function buildTrendRangeLabel(points?: TrendPoint[]) {
  if (!points?.length) {
    return '';
  }
  return `${points[0].date} ~ ${points[points.length - 1].date}`;
}

/**
 * 将模块排行转换为表格数据，避免工作台展示静态演示业务单据。
 */
function buildModuleRows(items: CategoryBarItem[], trend: TrendPoint[]): DashboardTableRow[] {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const peakPoint = [...trend].sort((prev, next) => next.visits - prev.visits)[0];

  return items.map((item, index) => ({
    key: item.name,
    moduleName: item.name,
    usageCount: item.value,
    usageRatio: total ? (item.value / total) * 100 : 0,
    peakDate: peakPoint?.date || '--',
    peakVisits: Math.max((peakPoint?.visits || 0) - index * 320, 0),
  }));
}

function buildStatusLegend(items: StatusPieItem[]) {
  const colors = ['#1677ff', '#faad14', '#52c41a', '#ff4d4f'];
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return items.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
    ratio: total ? ((item.value / total) * 100).toFixed(1) : '0.0',
  }));
}

function renderTrendIcon(type: DashboardMetric['trendType']) {
  if (type === 'up') {
    return <ArrowUpOutlined />;
  }
  if (type === 'down') {
    return <ArrowDownOutlined />;
  }
  return <MinusOutlined />;
}

function sortNotices(prev: NoticeRecord, next: NoticeRecord) {
  return next.publishTime.localeCompare(prev.publishTime);
}

function resolveMetricIcon(metric: DashboardMetric) {
  const normalizedKey = metric.key.toLowerCase();
  const normalizedTitle = metric.title.toLowerCase();

  if (normalizedKey.includes('visit') || normalizedTitle.includes('访问') || normalizedTitle.includes('用户')) {
    return <TeamOutlined />;
  }
  if (normalizedKey.includes('order') || normalizedTitle.includes('订单')) {
    return <ShoppingCartOutlined />;
  }
  if (
    normalizedKey.includes('revenue') ||
    normalizedKey.includes('amount') ||
    normalizedTitle.includes('金额') ||
    normalizedTitle.includes('销售')
  ) {
    return <FundOutlined />;
  }
  if (normalizedKey.includes('alert') || normalizedTitle.includes('告警')) {
    return <AlertOutlined />;
  }
  return <AppstoreOutlined />;
}

export default Dashboard;

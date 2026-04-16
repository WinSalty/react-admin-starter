import type { DashboardOverview } from '@/types/dashboard';

/**
 * Dashboard mock 数据。
 * 当前用于前端独立开发，后续接入真实接口时由 service 层替换数据来源。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

const dashboardOverview: DashboardOverview = {
  metrics: [
    {
      key: 'visits',
      title: '今日访问',
      value: 12860,
      suffix: '次',
      trendLabel: '较昨日',
      trendValue: '+12.4%',
      trendType: 'up',
    },
    {
      key: 'orders',
      title: '有效订单',
      value: 864,
      suffix: '单',
      trendLabel: '转化率',
      trendValue: '8.2%',
      trendType: 'stable',
    },
    {
      key: 'revenue',
      title: '交易金额',
      value: 326800,
      suffix: '元',
      trendLabel: '较上周',
      trendValue: '+6.8%',
      trendType: 'up',
    },
    {
      key: 'alerts',
      title: '待处理告警',
      value: 18,
      suffix: '条',
      trendLabel: '较昨日',
      trendValue: '-9.1%',
      trendType: 'down',
    },
  ],
  trend: [
    { date: '04-10', visits: 8600, orders: 520 },
    { date: '04-11', visits: 9400, orders: 610 },
    { date: '04-12', visits: 10200, orders: 680 },
    { date: '04-13', visits: 9800, orders: 640 },
    { date: '04-14', visits: 11600, orders: 720 },
    { date: '04-15', visits: 12100, orders: 790 },
    { date: '04-16', visits: 12860, orders: 864 },
  ],
  categories: [
    { name: '查询管理', value: 246 },
    { name: '数据统计', value: 198 },
    { name: '权限目录', value: 126 },
    { name: '系统配置', value: 92 },
    { name: '消息中心', value: 78 },
  ],
  statusDistribution: [
    { name: '运行中', value: 62 },
    { name: '待处理', value: 18 },
    { name: '已完成', value: 138 },
    { name: '异常', value: 7 },
  ],
};

/**
 * 模拟获取 Dashboard 概览数据。
 */
export async function mockFetchDashboardOverview(): Promise<DashboardOverview> {
  await delay(450);
  return {
    metrics: dashboardOverview.metrics.map((item) => ({ ...item })),
    trend: dashboardOverview.trend.map((item) => ({ ...item })),
    categories: dashboardOverview.categories.map((item) => ({ ...item })),
    statusDistribution: dashboardOverview.statusDistribution.map((item) => ({ ...item })),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

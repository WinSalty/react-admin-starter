export interface DashboardMetric {
  key: string;
  title: string;
  value: number;
  suffix?: string;
  precision?: number;
  trendLabel: string;
  trendValue: string;
  trendType: 'up' | 'down' | 'stable';
}

export interface TrendPoint {
  date: string;
  visits: number;
  orders: number;
}

export interface CategoryBarItem {
  name: string;
  value: number;
}

export interface StatusPieItem {
  name: string;
  value: number;
}

export interface DashboardOverview {
  metrics: DashboardMetric[];
  trend: TrendPoint[];
  categories: CategoryBarItem[];
  statusDistribution: StatusPieItem[];
}

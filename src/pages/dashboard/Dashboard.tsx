import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  MoreOutlined,
  PieChartOutlined,
  RightOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Col, List, Row, Skeleton, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { NoticeDetailModal } from '@/components/NoticeHighlights';
import { useActiveNotices } from '@/hooks/useActiveNotices';
import { fetchPointAccount, fetchPointLedger } from '@/services/points';
import type { NoticeRecord } from '@/types/notice';
import type { PointAccount, PointLedgerRecord } from '@/types/points';

const { Text } = Typography;

interface WalletSnapshot {
  account?: PointAccount;
  ledgers: PointLedgerRecord[];
}

/**
 * 后台工作台页面。
 * 保留系统公告与钱包余额两类真实业务信息，其余图表区仅作为后续业务统计接入口预留。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function Dashboard() {
  const navigate = useNavigate();
  const [walletSnapshot, setWalletSnapshot] = useState<WalletSnapshot>({ ledgers: [] });
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletErrorMessage, setWalletErrorMessage] = useState('');
  const {
    notices,
    loading: noticesLoading,
    errorMessage: noticeErrorMessage,
  } = useActiveNotices();

  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const [accountResponse, ledgerResponse] = await Promise.all([
        fetchPointAccount(),
        fetchPointLedger({ pageNo: 1, pageSize: 10 }),
      ]);
      if (accountResponse.code !== 0) {
        setWalletErrorMessage(accountResponse.message || '积分账户获取失败');
        setWalletSnapshot({ ledgers: [] });
        return;
      }
      setWalletSnapshot({
        account: accountResponse.data,
        ledgers: ledgerResponse.code === 0 ? ledgerResponse.data.records : [],
      });
      setWalletErrorMessage('');
    } catch {
      setWalletErrorMessage('积分账户获取失败，请稍后重试');
      setWalletSnapshot({ ledgers: [] });
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  const walletSummary = useMemo(() => buildWalletSummary(walletSnapshot), [walletSnapshot]);

  return (
    <div className="page-stack dashboard-workbench dashboard-workbench-v2">
      {walletErrorMessage ? <Alert message={walletErrorMessage} type="error" showIcon /> : null}

      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={16}>
          <WalletBalanceCard
            loading={walletLoading}
            summary={walletSummary}
            onDetail={() => navigate('/points/wallet')}
          />
        </Col>
        <Col xs={24} xl={8}>
          <NoticeQuickPanel notices={notices} loading={noticesLoading} errorMessage={noticeErrorMessage} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <ReservedTrendPanel />
        </Col>
        <Col xs={24} xl={10}>
          <ReservedStructurePanel />
        </Col>
      </Row>
    </div>
  );
}

/**
 * 钱包余额主卡，视觉结构参考资金余额卡片并适配积分账户。
 */
function WalletBalanceCard({
  loading,
  summary,
  onDetail,
}: {
  loading: boolean;
  summary: ReturnType<typeof buildWalletSummary>;
  onDetail: () => void;
}) {
  return (
    <Card className="dashboard-wallet-card" styles={{ body: { padding: 0 } }}>
      <div className="dashboard-wallet-header">
        <div className="dashboard-wallet-title">
          <span className="dashboard-wallet-logo">
            <WalletOutlined />
          </span>
          <div>
            <strong>积分余额</strong>
            <span>账户积分概览</span>
          </div>
        </div>
        <Button type="text" icon={<MoreOutlined />} />
      </div>

      <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
        <div className="dashboard-wallet-main">
          <div className="dashboard-wallet-balance">
            <div className="dashboard-wallet-label">
              <span>可用积分</span>
              <EyeOutlined />
            </div>
            <strong>{formatPoints(summary.availablePoints)}</strong>
            <div className="dashboard-wallet-total">
              <span>账户总积分</span>
              <em>{formatPoints(summary.totalPoints)}</em>
            </div>
          </div>
          <WalletIllustration />
        </div>

        <div className="dashboard-wallet-metrics">
          <WalletMetric
            icon={<ArrowDownOutlined />}
            label="今日获得"
            value={`+ ${formatPoints(summary.todayEarned)}`}
            tone="blue"
          />
          <WalletMetric
            icon={<ArrowUpOutlined />}
            label="今日消耗"
            value={`- ${formatPoints(summary.todaySpent)}`}
            tone="green"
          />
          <WalletMetric
            icon={<PieChartOutlined />}
            label="冻结积分"
            value={formatPoints(summary.frozenPoints)}
            tone="amber"
          />
          <WalletMetric
            icon={<FileTextOutlined />}
            label="最近变动"
            value={summary.latestChangeLabel}
            tone="violet"
          />
        </div>

        <div className="dashboard-wallet-footer">
          <span>
            <ClockCircleOutlined />
            更新时间：{summary.updatedAt || '-'}
          </span>
          <Button type="primary" ghost icon={<FileTextOutlined />} onClick={onDetail}>
            积分明细
            <RightOutlined />
          </Button>
        </div>
      </Skeleton>
    </Card>
  );
}

function WalletMetric({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: 'blue' | 'green' | 'amber' | 'violet';
}) {
  return (
    <div className="dashboard-wallet-metric">
      <span className={`dashboard-wallet-metric-icon is-${tone}`}>{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function WalletIllustration() {
  return (
    <div className="dashboard-wallet-visual" aria-hidden="true">
      <div className="wallet-visual-card-back" />
      <div className="wallet-visual-card-front" />
      <div className="wallet-visual-pocket">
        <span />
      </div>
      <div className="wallet-visual-coin">P</div>
      <div className="wallet-visual-shadow" />
    </div>
  );
}

/**
 * 系统公告面板，保留工作台必要通知入口。
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
  const visibleNotices = useMemo(() => [...notices].sort(sortNotices).slice(0, 5), [notices]);

  return (
    <>
      <Card className="dashboard-notice-card" title="系统公告">
        {errorMessage ? <Alert message={errorMessage} type="warning" showIcon style={{ marginBottom: 12 }} /> : null}
        <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
          <List
            className="notice-quick-list"
            locale={{ emptyText: '当前没有生效公告' }}
            dataSource={visibleNotices}
            renderItem={(notice) => (
              <List.Item key={notice.id} className="notice-quick-list-item" onClick={() => setSelectedNotice(notice)}>
                <div className="notice-quick-item">
                  <div className="notice-quick-main">
                    <Tag color={notice.priority === 'urgent' ? 'red' : 'blue'}>{notice.priority || 'normal'}</Tag>
                    <Text ellipsis={{ tooltip: notice.title }}>{notice.title}</Text>
                  </div>
                  <Text type="secondary">{notice.publishTime?.slice(5, 10) || '-'}</Text>
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

function ReservedTrendPanel() {
  return (
    <Card className="dashboard-reserved-card" title="积分趋势">
      <div className="reserved-trend-chart">
        <span style={{ height: '42%' }} />
        <span style={{ height: '64%' }} />
        <span style={{ height: '52%' }} />
        <span style={{ height: '76%' }} />
        <span style={{ height: '68%' }} />
        <span style={{ height: '88%' }} />
        <span style={{ height: '58%' }} />
      </div>
    </Card>
  );
}

function ReservedStructurePanel() {
  return (
    <Card className="dashboard-reserved-card" title="积分结构">
      <div className="reserved-structure-chart">
        <div className="reserved-ring">
          <span />
        </div>
        <div className="reserved-structure-legend">
          <LegendItem color="#4f7cff" label="获得" />
          <LegendItem color="#51b98b" label="消耗" />
          <LegendItem color="#f6ad3b" label="冻结" />
        </div>
      </div>
    </Card>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="reserved-legend-item">
      <span style={{ backgroundColor: color }} />
      <em>{label}</em>
    </div>
  );
}

function buildWalletSummary(snapshot: WalletSnapshot) {
  const today = formatDate(new Date());
  const ledgers = snapshot.ledgers || [];
  const todayLedgers = ledgers.filter((ledger) => ledger.createdAt?.startsWith(today));
  const todayEarned = sumLedgerAmount(todayLedgers, ['earn', 'refund', 'unfreeze']);
  const todaySpent = sumLedgerAmount(todayLedgers, ['spend', 'freeze']);
  const latest = ledgers[0];
  const latestChangeLabel = latest ? `${latest.direction === 'spend' || latest.direction === 'freeze' ? '-' : '+'} ${formatPoints(latest.amount)}` : '0';
  const availablePoints = snapshot.account?.availablePoints || 0;
  const frozenPoints = snapshot.account?.frozenPoints || 0;

  return {
    availablePoints,
    frozenPoints,
    totalPoints: availablePoints + frozenPoints,
    todayEarned,
    todaySpent,
    latestChangeLabel,
    updatedAt: snapshot.account?.updatedAt || latest?.createdAt || '',
  };
}

function sumLedgerAmount(records: PointLedgerRecord[], directions: string[]) {
  return records
    .filter((record) => directions.includes(record.direction))
    .reduce((total, record) => total + record.amount, 0);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatPoints(value: number) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(value || 0);
}

function sortNotices(prev: NoticeRecord, next: NoticeRecord) {
  const priorityWeight: Record<string, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  const prevWeight = priorityWeight[prev.priority || 'low'] || 0;
  const nextWeight = priorityWeight[next.priority || 'low'] || 0;
  if (prevWeight !== nextWeight) {
    return nextWeight - prevWeight;
  }
  return (next.publishTime || '').localeCompare(prev.publishTime || '');
}

export default Dashboard;

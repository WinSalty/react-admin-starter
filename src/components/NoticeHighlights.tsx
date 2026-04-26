import { useEffect, useMemo, useState } from 'react';
import { ClockCircleOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Checkbox, Dropdown, Empty, List, Modal, Skeleton, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type { NoticePriority, NoticeRecord } from '@/types/notice';

const { Paragraph, Text, Title } = Typography;

interface NoticeListProps {
  notices: NoticeRecord[];
  loading: boolean;
  errorMessage?: string;
}

interface HeaderNoticeTickerProps extends NoticeListProps {
  tickerEnabled: boolean;
}

const priorityMeta: Record<NoticePriority, { label: string; color: string; weight: number }> = {
  urgent: { label: '紧急', color: 'red', weight: 4 },
  high: { label: '重要', color: 'volcano', weight: 3 },
  medium: { label: '普通', color: 'blue', weight: 2 },
  low: { label: '低优先级', color: 'default', weight: 1 },
};

const noticeTypeLabels: Record<string, string> = {
  system: '系统公告',
  business: '业务通知',
  security: '安全提醒',
  event: '活动通知',
};

/**
 * 首页公告卡片，突出公告摘要和优先级。
 */
export function DashboardNoticeCard({ notices, loading, errorMessage }: NoticeListProps) {
  const [selectedNotice, setSelectedNotice] = useState<NoticeRecord>();
  const visibleNotices = useMemo(() => sortNotices(notices).slice(0, 6), [notices]);

  return (
    <>
      <Card
        className="notice-overview-card"
        title={
          <Space size={8}>
            <NotificationOutlined />
            <span>公告提醒</span>
          </Space>
        }
        extra={<Tag color="blue">{notices.length} 条生效</Tag>}
      >
        {errorMessage ? <Alert message={errorMessage} type="warning" showIcon /> : null}
        <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
          {visibleNotices.length > 0 ? (
            <List
              className="notice-overview-list"
              dataSource={visibleNotices}
              renderItem={(notice) => (
                <List.Item
                  key={notice.id}
                  actions={[
                    <Button key="detail" type="link" onClick={() => setSelectedNotice(notice)}>
                      查看
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space size={8} wrap>
                        <Text strong>{notice.title}</Text>
                        <Tag color={getPriorityMeta(notice.priority).color}>
                          {getPriorityMeta(notice.priority).label}
                        </Tag>
                        <Tag>{getNoticeTypeLabel(notice.noticeType)}</Tag>
                      </Space>
                    }
                    description={
                      <div className="notice-overview-meta">
                        <Paragraph ellipsis={{ rows: 2 }} className="notice-overview-content">
                          {notice.content}
                        </Paragraph>
                        <Space size={12} wrap>
                          <Text type="secondary">
                            <UserOutlined /> {notice.publisherName || '系统'}
                          </Text>
                          <Text type="secondary">
                            <ClockCircleOutlined /> {formatDateTime(notice.publishTime)}
                          </Text>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="当前没有生效公告" />
          )}
        </Skeleton>
      </Card>
      <NoticeDetailModal notice={selectedNotice} onClose={() => setSelectedNotice(undefined)} />
    </>
  );
}

/**
 * 顶栏公告滚动条，定时轮播生效公告并支持展开查看。
 */
export function HeaderNoticeTicker({
  notices,
  loading,
  errorMessage,
  tickerEnabled,
}: HeaderNoticeTickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeRecord>();
  const visibleNotices = useMemo(() => sortNotices(notices).slice(0, 8), [notices]);
  const activeNotice = visibleNotices[activeIndex % Math.max(visibleNotices.length, 1)];

  useEffect(() => {
    if (visibleNotices.length <= 1 || !tickerEnabled) {
      setActiveIndex(0);
      return undefined;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((value) => (value + 1) % visibleNotices.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [tickerEnabled, visibleNotices.length]);

  const dropdownContent = (
    <div className="header-notice-dropdown">
      <div className="header-notice-dropdown-title">
        <Text strong>生效公告</Text>
        <Tag color="blue">{visibleNotices.length}</Tag>
      </div>
      {visibleNotices.length > 0 ? (
        <List
          size="small"
          dataSource={visibleNotices}
          renderItem={(notice) => (
            <List.Item
              key={notice.id}
              onClick={() => {
                setDropdownOpen(false);
                setSelectedNotice(notice);
              }}
            >
              <List.Item.Meta
                title={
                  <Space size={6}>
                    <Tag color={getPriorityMeta(notice.priority).color}>
                      {getPriorityMeta(notice.priority).label}
                    </Tag>
                    <Text ellipsis>{notice.title}</Text>
                  </Space>
                }
                description={formatDateTime(notice.publishTime)}
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无生效公告" />
      )}
    </div>
  );

  return (
    <>
      <Dropdown
        dropdownRender={() => dropdownContent}
        trigger={['click']}
        placement="bottom"
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
      >
        <Button
          className={`header-notice-trigger ${tickerEnabled ? 'is-active' : 'is-paused'}`}
          type="text"
          loading={loading}
        >
          <span className="header-notice-window">
            {tickerEnabled && activeNotice ? (
              <span key={activeNotice.id} className="header-notice-line is-running">
                <Tag bordered={false} color={getPriorityMeta(activeNotice.priority).color}>
                  {getPriorityMeta(activeNotice.priority).label}
                </Tag>
                <span>{activeNotice.title}</span>
              </span>
            ) : tickerEnabled ? (
              <span className="header-notice-line is-paused">
                {errorMessage || '暂无生效公告'}
              </span>
            ) : null}
          </span>
        </Button>
      </Dropdown>
      <NoticeDetailModal notice={selectedNotice} onClose={() => setSelectedNotice(undefined)} />
    </>
  );
}

/**
 * 公告详情弹窗，采用居中公告卡片结构展示重要通知内容。
 * 创建日期：2026-04-26
 * author: sunshengxian
 */
export function NoticeDetailModal({
  notice,
  onClose,
}: {
  notice?: NoticeRecord;
  onClose: () => void;
}) {
  const [skipTodayReminder, setSkipTodayReminder] = useState(false);

  useEffect(() => {
    setSkipTodayReminder(false);
  }, [notice?.id]);

  return (
    <Modal
      className="notice-detail-modal"
      rootClassName="notice-detail-modal-root"
      title={null}
      open={!!notice}
      footer={null}
      width={640}
      centered
      destroyOnHidden
      onCancel={onClose}
    >
      {notice ? (
        <div className="notice-detail">
          <div className="notice-detail-header">
            <span className="notice-detail-icon" aria-hidden="true">
              <NotificationOutlined />
              <i />
              <i />
              <i />
              <i />
            </span>
            <Title level={2}>系统公告</Title>
          </div>
          <div className="notice-detail-divider" />
          <div className="notice-detail-paper">
            <div className="notice-detail-paper-title">
              <Tag color={getPriorityMeta(notice.priority).color}>
                {getPriorityMeta(notice.priority).label}
              </Tag>
              <Title level={3}>{notice.title}</Title>
            </div>
            <Paragraph className="notice-detail-content">{notice.content}</Paragraph>
            <div className="notice-detail-signature">
              <span>{notice.publisherName || getNoticeTypeLabel(notice.noticeType)}</span>
              <span>{formatNoticeDate(notice.publishTime)}</span>
              {notice.expireTime ? <span>有效至 {formatNoticeDate(notice.expireTime)}</span> : null}
            </div>
          </div>
          <div className="notice-detail-footer">
            <Checkbox checked={skipTodayReminder} onChange={(event) => setSkipTodayReminder(event.target.checked)}>
              今日不再提醒
            </Checkbox>
            <Button type="primary" size="large" onClick={onClose}>
              我知道了
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function sortNotices(notices: NoticeRecord[]): NoticeRecord[] {
  return [...notices].sort((prev, next) => {
    const priorityDiff = getPriorityMeta(next.priority).weight - getPriorityMeta(prev.priority).weight;
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return dayjs(next.publishTime).valueOf() - dayjs(prev.publishTime).valueOf();
  });
}

function getPriorityMeta(priority: string) {
  return priorityMeta[priority as NoticePriority] || priorityMeta.medium;
}

function getNoticeTypeLabel(noticeType: string) {
  return noticeTypeLabels[noticeType] || noticeType;
}

function formatDateTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '未设置';
}

function formatNoticeDate(value?: string) {
  return value ? dayjs(value).format('YYYY年M月D日') : '未设置';
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Empty, Result, Space, Spin, Tag } from 'antd';
import { CheckCircleOutlined, CopyOutlined, KeyOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { publicExtractCredential } from '@/services/credential';
import type { CredentialPublicExtractResult } from '@/types/credential';
import { copyText } from '@/utils/clipboard';

/**
 * 公开凭证提取页面。
 * 支持单个或多个凭证文本展示、单条复制和全部复制。
 * author: sunshengxian
 * 创建日期：2026-05-01
 */
function PublicCredentialExtractPage() {
  const { token } = useParams();
  const { message } = App.useApp();
  const [data, setData] = useState<CredentialPublicExtractResult>();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const deviceSnapshot = useMemo(() => JSON.stringify({
    language: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }), []);

  const loadData = useCallback(async () => {
    if (!token) {
      setErrorMessage('提取链接无效');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await publicExtractCredential(token, {
        browserFingerprint: `${navigator.platform}:${navigator.language}:${screen.width}x${screen.height}`,
        deviceSnapshot,
      });
      if (response.code !== 0) {
        setErrorMessage(response.message || '提取失败');
        return;
      }
      setData(response.data);
    } finally {
      setLoading(false);
    }
  }, [deviceSnapshot, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return <div className="public-extract-page"><Spin /></div>;
  }

  if (errorMessage || !data) {
    return (
      <div className="public-extract-page">
        <Result status="warning" title={errorMessage || '暂无法提取'} />
      </div>
    );
  }

  const allText = data.items.map((item) => `${item.copyLabel}: ${item.secretText}`).join('\n');

  return (
    <div className="public-extract-page">
      <Card className="public-extract-card" title={<span className="wallet-section-title"><span><KeyOutlined /></span>{data.categoryName}</span>}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div className="query-name-cell">
            <strong>{data.batchName}</strong>
            <span>{data.linkNo} · 剩余可打开 {data.remainingAccessCount} 次 · {data.expireAt} 过期</span>
          </div>
          {data.remark ? <div className="public-extract-note">{data.remark}</div> : null}
          <Space>
            <Tag color={data.fulfillmentType === 'POINTS_REDEEM' ? 'purple' : 'blue'}>
              {data.fulfillmentType === 'POINTS_REDEEM' ? '积分 CDK' : '文本卡密'}
            </Tag>
            <Tag icon={<CheckCircleOutlined />} color="success">已提取</Tag>
          </Space>
          {data.items.length ? (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {data.items.map((item) => (
                <div className="public-extract-secret" key={item.itemNo}>
                  <div>
                    <span>{item.copyLabel}</span>
                    <strong>{item.secretText}</strong>
                  </div>
                  <Button icon={<CopyOutlined />} onClick={() => void copyText(item.secretText).then((ok) => ok && message.success('已复制'))}>
                    复制
                  </Button>
                </div>
              ))}
              <Button type="primary" icon={<CopyOutlined />} onClick={() => void copyText(allText).then((ok) => ok && message.success('全部凭证已复制'))}>
                复制全部
              </Button>
            </Space>
          ) : (
            <Empty description="没有可提取的凭证" />
          )}
        </Space>
      </Card>
    </div>
  );
}

export default PublicCredentialExtractPage;

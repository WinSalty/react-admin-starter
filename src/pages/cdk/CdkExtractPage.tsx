import { useEffect, useRef, useState } from 'react';
import { App, Button, Result, Spin, Tag } from 'antd';
import { CheckCircleOutlined, CopyOutlined, KeyOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import brandLogo from '@/assets/brand-logo.svg';
import { fetchPublicCdkExtract } from '@/services/cdk';
import type { CdkExtractView } from '@/types/cdk';
import { copyText } from '@/utils/clipboard';
import { collectDeviceFingerprint } from '@/utils/deviceFingerprint';

/**
 * CDK 公开提取页面。
 * 匿名访问者通过临时 URL 查看并复制 CDK，页面风格与后台系统保持一致。
 * author: sunshengxian
 * 创建日期：2026-04-30
 */
function CdkExtractPage() {
  const { message } = App.useApp();
  const { token = '' } = useParams();
  const loadedTokenRef = useRef('');
  const [loading, setLoading] = useState(true);
  const [extract, setExtract] = useState<CdkExtractView>();
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (!token || loadedTokenRef.current === token) {
      return;
    }
    loadedTokenRef.current = token;
    async function loadExtract() {
      setLoading(true);
      try {
        const fingerprint = await collectDeviceFingerprint();
        const response = await fetchPublicCdkExtract(
          token,
          fingerprint.browserFingerprint,
          fingerprint.deviceSnapshot,
        );
        if (response.code !== 0) {
          setErrorText(response.message || '链接无效或已过期');
          return;
        }
        setExtract(response.data);
      } catch {
        setErrorText('链接暂时无法访问');
      } finally {
        setLoading(false);
      }
    }
    void loadExtract();
  }, [token]);

  const handleCopy = async () => {
    if (!extract?.cdk) {
      return;
    }
    if (await copyText(extract.cdk)) {
      message.success('CDK 已复制');
      return;
    }
    message.error('复制失败，请手动选中文本复制');
  };

  return (
    <main className="cdk-extract-page">
      <section className="cdk-extract-shell">
        <header className="cdk-extract-header">
          <img src={brandLogo} alt="" aria-hidden="true" />
          <strong>React Admin Starter</strong>
        </header>

        {loading ? (
          <div className="cdk-extract-loading">
            <Spin size="large" />
          </div>
        ) : extract ? (
          <div className="cdk-extract-panel">
            <div className="cdk-extract-summary">
              <Tag color="blue" icon={<KeyOutlined />}>CDK 提取</Tag>
              <h1>{extract.batchName || 'CDK 提取凭证'}</h1>
              <dl>
                <div>
                  <dt>权益</dt>
                  <dd>{extract.benefitText || extract.benefitType}</dd>
                </div>
                <div>
                  <dt>有效期至</dt>
                  <dd>{extract.validTo || '-'}</dd>
                </div>
                <div>
                  <dt>剩余访问</dt>
                  <dd>{extract.remainingAccessCount}</dd>
                </div>
              </dl>
            </div>

            <div className="cdk-extract-code-box">
              <span>CDK</span>
              <strong>{extract.cdk}</strong>
              <Button type="primary" size="large" icon={<CopyOutlined />} onClick={() => void handleCopy()}>
                一键复制
              </Button>
              <p>
                <CheckCircleOutlined /> 当前链接已完成校验
              </p>
            </div>
          </div>
        ) : (
          <div className="cdk-extract-result">
            <Result status="warning" title={errorText || '链接无效或已过期'} />
          </div>
        )}
      </section>
    </main>
  );
}

export default CdkExtractPage;

import { useEffect, useRef, useState } from 'react';
import {
  ExclamationCircleFilled,
  LoadingOutlined,
  MailOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { resendRegisterVerifyMail, verifyRegisterEmail } from '@/services/auth';

const { Paragraph, Title } = Typography;

const SUCCESS_CODE = 0;
const VERIFY_EMAIL_PATH = '/register/verify-email';

type ActivationState = 'idle' | 'verifying' | 'failed';

interface VerifyEmailFormValues {
  email: string;
}

interface VerifyEmailLocationState {
  activationMailSent?: boolean;
  username?: string;
  email?: string;
}

/**
 * 注册邮箱待验证页面。
 * 提示未验证邮箱的注册用户先完成邮箱验证，并提供验证邮件重发入口。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
function EmailVerificationPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<VerifyEmailFormValues>();
  const activationHandledRef = useRef(false);
  const locationState = location.state as VerifyEmailLocationState | undefined;
  const queryEmail = normalizeEmail(searchParams.get('email'));
  const token = normalizeText(searchParams.get('token'));
  const initialEmail = queryEmail || normalizeEmail(locationState?.email);
  const [email, setEmail] = useState(initialEmail);
  const [activationState, setActivationState] = useState<ActivationState>('idle');
  const [activationError, setActivationError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!initialEmail) {
      return;
    }
    setEmail(initialEmail);
    form.setFieldsValue({ email: initialEmail });
  }, [form, initialEmail]);

  useEffect(() => {
    if (!queryEmail || !token || activationHandledRef.current) {
      return undefined;
    }
    activationHandledRef.current = true;
    let active = true;
    let redirected = false;
    setActivationState('verifying');
    setActivationError('');
    void verifyRegisterEmail({ email: queryEmail, token })
      .then((response) => {
        if (!active) {
          return;
        }
        if (response.code !== SUCCESS_CODE) {
          setActivationState('failed');
          setActivationError(response.message || '账号激活失败，请重新发送验证邮件');
          return;
        }
        redirected = true;
        navigate('/login', {
          replace: true,
          state: {
            accountActivated: true,
            email: queryEmail,
          },
        });
      })
      .catch(() => {
        if (active) {
          setActivationState('failed');
          setActivationError('账号激活失败，请重新发送验证邮件');
        }
      })
      .finally(() => {
        if (active && !redirected) {
          setSearchParams({ email: queryEmail }, { replace: true });
        }
      });
    return () => {
      active = false;
    };
  }, [navigate, queryEmail, setSearchParams, token]);

  async function handleResend() {
    const values = await form.validateFields();
    const nextEmail = normalizeEmail(values.email);
    setResending(true);
    try {
      const response = await resendRegisterVerifyMail({ email: nextEmail });
      if (response.code !== SUCCESS_CODE) {
        messageApi.error(response.message || '验证邮件发送失败');
        return;
      }
      setEmail(nextEmail);
      setActivationState('idle');
      setActivationError('');
      messageApi.success(response.message || '验证邮件已重新发送');
      navigate(
        {
          pathname: VERIFY_EMAIL_PATH,
          search: buildEmailSearch(nextEmail),
        },
        {
          replace: true,
          state: {
            activationMailSent: true,
            email: nextEmail,
          },
        },
      );
    } catch {
      messageApi.error('验证邮件发送失败，请稍后重试');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-card-wrap">
      {contextHolder}
      <Card className="auth-card verify-email-card">
        <div className="auth-card-title">
          <span>Verify email</span>
          <Title level={2}>验证邮箱后登录</Title>
          <Paragraph>注册账号需要先完成邮箱验证。验证成功后即可返回登录页使用账号。</Paragraph>
        </div>
        {renderVerificationStatus(activationState, activationError, email)}
        <div className="verify-email-target">
          <span>注册邮箱</span>
          <strong>{email || '请填写注册邮箱'}</strong>
        </div>
        <Form form={form} layout="vertical" size="large" initialValues={{ email }} onFinish={handleResend}>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入注册邮箱"
              disabled={activationState === 'verifying'}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Form.Item>
          <Button
            block
            htmlType="submit"
            type="primary"
            icon={<ReloadOutlined />}
            loading={resending}
            disabled={activationState === 'verifying'}
          >
            重新发送验证邮件
          </Button>
        </Form>
        <div className="auth-extra">
          已完成验证？ <Link to="/login">去登录</Link>
          <span className="auth-extra-divider">/</span>
          <Link to="/register">重新注册</Link>
        </div>
      </Card>
    </div>
  );
}

function renderVerificationStatus(state: ActivationState, error: string, email: string) {
  if (state === 'verifying') {
    return (
      <div className="auth-inline-feedback auth-inline-feedback-pending">
        <div className="auth-inline-feedback-icon">
          <LoadingOutlined />
        </div>
        <div className="auth-inline-feedback-content">
          <span>Verifying</span>
          <strong>正在验证邮箱</strong>
          <p>验证完成后会自动进入登录页。</p>
        </div>
      </div>
    );
  }
  if (state === 'failed') {
    return (
      <div className="auth-inline-feedback auth-inline-feedback-pending">
        <div className="auth-inline-feedback-icon">
          <ExclamationCircleFilled />
        </div>
        <div className="auth-inline-feedback-content">
          <span>Verification failed</span>
          <strong>邮箱验证失败</strong>
          <p>{error || '请重新发送验证邮件，并使用最新邮件中的链接完成验证。'}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="auth-inline-feedback">
      <div className="auth-inline-feedback-icon">
        <SafetyCertificateOutlined />
      </div>
      <div className="auth-inline-feedback-content">
        <span>Check inbox</span>
        <strong>请先完成邮箱验证</strong>
        <p>
          {email
            ? `我们已向 ${email} 发送验证邮件，请点击邮件中的链接后再登录。`
            : '请输入注册邮箱后重新发送验证邮件。'}
        </p>
      </div>
    </div>
  );
}

function normalizeEmail(value?: string | null) {
  return normalizeText(value).toLowerCase();
}

function normalizeText(value?: string | null) {
  return value?.trim() || '';
}

function buildEmailSearch(email: string) {
  const params = new URLSearchParams();
  params.set('email', email);
  return `?${params.toString()}`;
}

export default EmailVerificationPending;

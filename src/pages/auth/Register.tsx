import { useEffect, useRef, useState } from 'react';
import {
  CheckCircleFilled,
  LoadingOutlined,
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register, sendRegisterVerificationMail, verifyRegisterEmail } from '@/services/auth';

const { Paragraph, Title } = Typography;

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * 注册页面，接入邮件链接验证和注册服务。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function Register() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<RegisterFormValues>();
  const verificationHandledRef = useRef(false);
  const currentEmail = Form.useWatch('email', form);
  const [sendingMail, setSendingMail] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sentEmail, setSentEmail] = useState<string>();
  const [verifiedEmail, setVerifiedEmail] = useState<string>();
  const emailVerified = !!verifiedEmail && normalizeEmail(currentEmail) === verifiedEmail;

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    if (!email || !token || verificationHandledRef.current) {
      return undefined;
    }
    verificationHandledRef.current = true;
    let active = true;
    form.setFieldValue('email', email);
    setVerifyingEmail(true);
    void verifyRegisterEmail({ email, token })
      .then((response) => {
        if (!active) {
          return;
        }
        if (response.code !== 0) {
          messageApi.error(response.message || '邮箱验证失败，请重新发送验证邮件');
          return;
        }
        const normalizedEmail = normalizeEmail(email);
        setVerifiedEmail(normalizedEmail);
        setSentEmail(undefined);
        messageApi.success('邮箱验证成功，请继续完成注册');
      })
      .catch(() => {
        if (active) {
          messageApi.error('邮箱验证失败，请重新发送验证邮件');
        }
      })
      .finally(() => {
        if (active) {
          setVerifyingEmail(false);
          setSearchParams({}, { replace: true });
        }
      });
    return () => {
      active = false;
    };
  }, [form, messageApi, searchParams, setSearchParams]);

  useEffect(() => {
    if (!verifiedEmail) {
      return;
    }
    if (normalizeEmail(currentEmail) !== verifiedEmail) {
      setVerifiedEmail(undefined);
    }
  }, [currentEmail, verifiedEmail]);

  async function handleSendVerificationMail() {
    const username = form.getFieldValue('username');
    const email = form.getFieldValue('email');
    if (!username) {
      messageApi.error('请先输入用户名');
      return;
    }
    if (!email) {
      messageApi.error('请先输入邮箱');
      return;
    }
    try {
      await form.validateFields(['username', 'email']);
    } catch {
      return;
    }
    setSendingMail(true);
    setVerifiedEmail(undefined);
    try {
      const response = await sendRegisterVerificationMail({ username, email });
      if (response.code !== 0) {
        messageApi.error(response.message || '验证邮件发送失败');
        return;
      }
      const normalizedEmail = normalizeEmail(email);
      setSentEmail(normalizedEmail);
      messageApi.success('验证邮件已发送，请点击邮件中的链接完成验证');
      setCountdown(60);
    } catch {
      messageApi.error('验证邮件发送失败，请稍后重试');
    } finally {
      setSendingMail(false);
    }
  }

  async function onFinish(values: RegisterFormValues) {
    if (values.password !== values.confirmPassword) {
      messageApi.error('两次输入的密码不一致');
      return;
    }
    const normalizedEmail = normalizeEmail(values.email);
    if (normalizedEmail !== verifiedEmail) {
      messageApi.error('请先点击邮件中的验证链接完成邮箱验证');
      return;
    }
    setSubmitting(true);
    try {
      const response = await register({
        username: values.username,
        email: values.email,
        password: values.password,
      });
      if (response.code === 0) {
        navigate('/login', {
          replace: true,
          state: {
            registerSuccess: true,
            username: values.username,
            email: values.email,
          },
        });
      } else {
        messageApi.error(response.message || '注册失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function renderEmailStatus() {
    if (verifyingEmail) {
      return (
        <div className="auth-inline-feedback auth-inline-feedback-pending">
          <div className="auth-inline-feedback-icon">
            <LoadingOutlined />
          </div>
          <div className="auth-inline-feedback-content">
            <span>Email verification</span>
            <strong>正在验证邮箱链接</strong>
            <p>验证完成后即可继续设置密码并提交注册。</p>
          </div>
        </div>
      );
    }
    if (emailVerified) {
      return (
        <div className="auth-inline-feedback auth-inline-feedback-success">
          <div className="auth-inline-feedback-icon">
            <CheckCircleFilled />
          </div>
          <div className="auth-inline-feedback-content">
            <span>Email verified</span>
            <strong>邮箱已完成验证</strong>
            <p>{verifiedEmail} 已通过验证，可以继续完成注册。</p>
          </div>
        </div>
      );
    }
    if (sentEmail && normalizeEmail(currentEmail) === sentEmail) {
      return (
        <div className="auth-inline-feedback auth-inline-feedback-pending">
          <div className="auth-inline-feedback-icon">
            <MailOutlined />
          </div>
          <div className="auth-inline-feedback-content">
            <span>Check inbox</span>
            <strong>验证邮件已发送</strong>
            <p>请打开 {sentEmail} 收到的邮件，点击验证按钮后返回本页。</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="auth-card-wrap">
      {contextHolder}
      <Card className="auth-card">
        <div className="auth-card-title">
          <span>Create account</span>
          <Title level={2}>注册账号</Title>
          <Paragraph>先验证邮箱，再设置密码完成注册。每个邮箱仅可注册一个账号。</Paragraph>
        </div>
        {renderEmailStatus()}
        <Form form={form} layout="vertical" size="large" onFinish={onFinish}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item>
            <Button
              block
              onClick={() => void handleSendVerificationMail()}
              loading={sendingMail}
              disabled={countdown > 0 || verifyingEmail}
            >
              {countdown > 0 ? `${countdown}s 后重发` : '发送验证邮件'}
            </Button>
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value: string) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
          </Form.Item>
          <Form.Item>
            <Button
              block
              htmlType="submit"
              type="primary"
              loading={submitting}
              disabled={!emailVerified || verifyingEmail}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
        <div className="auth-extra">
          已有账号？ <Link to="/login">去登录</Link>
        </div>
      </Card>
    </div>
  );
}

function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase() || '';
}

export default Register;

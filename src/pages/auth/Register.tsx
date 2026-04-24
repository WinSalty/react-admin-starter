import { useEffect, useRef, useState } from 'react';
import {
  ExclamationCircleFilled,
  LoadingOutlined,
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register, verifyRegisterEmail } from '@/services/auth';

const { Paragraph, Title } = Typography;

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type ActivationState = 'idle' | 'verifying' | 'failed';

/**
 * 注册页面，提交注册后发送账号激活邮件，邮件链接回跳后完成账号激活。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function Register() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<RegisterFormValues>();
  const activationHandledRef = useRef(false);
  const [activationState, setActivationState] = useState<ActivationState>('idle');
  const [activationError, setActivationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    if (!email || !token || activationHandledRef.current) {
      return undefined;
    }
    activationHandledRef.current = true;
    let active = true;
    setActivationState('verifying');
    setActivationError('');
    void verifyRegisterEmail({ email, token })
      .then((response) => {
        if (!active) {
          return;
        }
        if (response.code !== 0) {
          setActivationState('failed');
          setActivationError(response.message || '账号激活失败，请重新提交注册获取新的激活邮件');
          return;
        }
        navigate('/login', {
          replace: true,
          state: {
            accountActivated: true,
            email,
          },
        });
      })
      .catch(() => {
        if (active) {
          setActivationState('failed');
          setActivationError('账号激活失败，请重新提交注册获取新的激活邮件');
        }
      })
      .finally(() => {
        if (active) {
          setSearchParams({}, { replace: true });
        }
      });
    return () => {
      active = false;
    };
  }, [messageApi, navigate, searchParams, setSearchParams]);

  async function onFinish(values: RegisterFormValues) {
    if (values.password !== values.confirmPassword) {
      messageApi.error('两次输入的密码不一致');
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
            activationMailSent: true,
            username: values.username,
            email: values.email,
          },
        });
      } else {
        messageApi.error(response.message || '注册失败');
      }
    } catch {
      messageApi.error('注册失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }

  function renderActivationStatus() {
    if (activationState === 'verifying') {
      return (
        <div className="auth-inline-feedback auth-inline-feedback-pending">
          <div className="auth-inline-feedback-icon">
            <LoadingOutlined />
          </div>
          <div className="auth-inline-feedback-content">
            <span>Activating account</span>
            <strong>正在激活账号</strong>
            <p>激活完成后会自动进入登录页。</p>
          </div>
        </div>
      );
    }
    if (activationState === 'failed') {
      return (
        <div className="auth-inline-feedback auth-inline-feedback-pending">
          <div className="auth-inline-feedback-icon">
            <ExclamationCircleFilled />
          </div>
          <div className="auth-inline-feedback-content">
            <span>Activation failed</span>
            <strong>账号激活失败</strong>
            <p>{activationError}</p>
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
          <Paragraph>填写账号信息后，系统会发送激活邮件。账号激活后即可登录后台。</Paragraph>
        </div>
        {renderActivationStatus()}
        <Form form={form} layout="vertical" size="large" onFinish={onFinish}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" disabled={activationState === 'verifying'} />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" disabled={activationState === 'verifying'} />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              disabled={activationState === 'verifying'}
            />
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
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              disabled={activationState === 'verifying'}
            />
          </Form.Item>
          <Form.Item>
            <Button
              block
              htmlType="submit"
              type="primary"
              loading={submitting || activationState === 'verifying'}
            >
              注册并发送激活邮件
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

export default Register;

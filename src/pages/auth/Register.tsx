import { useEffect, useState } from 'react';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register } from '@/services/auth';

const { Paragraph, Title } = Typography;
const VERIFY_EMAIL_PATH = '/register/verify-email';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * 注册页面，提交注册后发送账号激活邮件，邮件链接回跳后完成账号激活。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<RegisterFormValues>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    if (!email || !token) {
      return;
    }
    navigate(
      {
        pathname: VERIFY_EMAIL_PATH,
        search: buildVerifyEmailSearch(email, token),
      },
      { replace: true },
    );
  }, [navigate, searchParams]);

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
        navigate(
          {
            pathname: VERIFY_EMAIL_PATH,
            search: buildVerifyEmailSearch(values.email),
          },
          {
            replace: true,
            state: {
              activationMailSent: true,
              username: values.username,
              email: values.email,
            },
          },
        );
      } else {
        messageApi.error(response.message || '注册失败');
      }
    } catch {
      messageApi.error('注册失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
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
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
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
            />
          </Form.Item>
          <Form.Item>
            <Button
              block
              htmlType="submit"
              type="primary"
              loading={submitting}
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

function buildVerifyEmailSearch(email: string, token?: string) {
  const params = new URLSearchParams();
  params.set('email', email);
  if (token) {
    params.set('token', token);
  }
  return `?${params.toString()}`;
}

export default Register;

import { useEffect, useState } from 'react';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Space, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { register, sendRegisterVerifyCode } from '@/services/auth';

const { Paragraph, Title } = Typography;

/**
 * 注册页面，接入注册服务和表单校验。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function Register() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<{
    username: string;
    email: string;
    verifyCode: string;
    password: string;
    confirmPassword: string;
  }>();
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  async function handleSendVerifyCode() {
    const email = form.getFieldValue('email');
    if (!email) {
      messageApi.error('请先输入邮箱');
      return;
    }
    try {
      await form.validateFields(['email']);
    } catch {
      return;
    }
    setSendingCode(true);
    try {
      const res = await sendRegisterVerifyCode(email);
      if (res.code !== 0) {
        messageApi.error(res.message || '验证码发送失败');
        return;
      }
      messageApi.success('验证码已发送，请查收邮箱');
      setCountdown(60);
    } catch {
      messageApi.error('验证码发送失败，请稍后重试');
    } finally {
      setSendingCode(false);
    }
  }

  async function onFinish(values: {
    username: string;
    email: string;
    verifyCode: string;
    password: string;
    confirmPassword: string;
  }) {
    if (values.password !== values.confirmPassword) {
      messageApi.error('两次输入的密码不一致');
      return;
    }
    const res = await register({
      username: values.username,
      email: values.email,
      verifyCode: values.verifyCode,
      password: values.password,
    });
    if (res.code === 0) {
      messageApi.success('注册成功');
      navigate('/login');
    } else {
      messageApi.error(res.message || '注册失败');
    }
  }

  return (
    <div className="auth-card-wrap">
      {contextHolder}
      <Card className="auth-card">
        <div className="auth-card-title">
          <span>Create account</span>
          <Title level={2}>注册账号</Title>
          <Paragraph>创建账号后即可进入后台框架体验完整流程。</Paragraph>
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
            label="邮箱验证码"
            name="verifyCode"
            rules={[
              { required: true, message: '请输入邮箱验证码' },
              { len: 6, message: '邮箱验证码为 6 位' },
            ]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input placeholder="请输入邮箱验证码" maxLength={6} />
              <Button onClick={() => void handleSendVerifyCode()} loading={sendingCode} disabled={countdown > 0}>
                {countdown > 0 ? `${countdown}s 后重发` : '发送验证码'}
              </Button>
            </Space.Compact>
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
            <Button block htmlType="submit" type="primary">
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

export default Register;

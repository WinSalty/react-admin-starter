import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '@/services/auth';

const { Paragraph, Title } = Typography;

/**
 * 注册页面，接入注册服务和表单校验。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function Register() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  async function onFinish(values: { username: string; email: string; password: string; confirmPassword: string }) {
    if (values.password !== values.confirmPassword) {
      messageApi.error('两次输入的密码不一致');
      return;
    }
    const res = await register({
      username: values.username,
      email: values.email,
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
          <Title level={2}>注册账号</Title>
          <Paragraph>创建用于访问后台的账号。</Paragraph>
        </div>
        <Form layout="vertical" size="large" onFinish={onFinish}>
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

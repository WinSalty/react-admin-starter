import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { CheckCircleFilled } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '@/services/auth';
import { fetchPermissionBootstrap } from '@/services/permission';
import { useAuthStore } from '@/stores/auth';

const { Paragraph, Title } = Typography;

/**
 * 登录页面，接入认证服务和表单校验。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginStore = useAuthStore((state) => state.login);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const [messageApi, contextHolder] = message.useMessage();
  const registerSuccessState = location.state as
    | { registerSuccess?: boolean; username?: string; email?: string }
    | undefined;

  async function onFinish(values: { username: string; password: string }) {
    const res = await login(values);
    const token = res.data?.accessToken || res.data?.token;
    if (res.code === 0 && token) {
      const role = res.data.roleCode || 'viewer';
      loginStore(token, res.data?.refreshToken, role);
      const permRes = await fetchPermissionBootstrap();
      if (permRes.code === 0) {
        setPermissions(permRes.data.menus, permRes.data.routes, permRes.data.actions);
        messageApi.success('登录成功');
        navigate('/dashboard', { replace: true });
      } else {
        messageApi.error('获取权限失败');
      }
    } else {
      messageApi.error(res.message || '登录失败');
    }
  }

  return (
    <div className="auth-card-wrap">
      {contextHolder}
      <Card className="auth-card">
        <div className="auth-card-title">
          <span>Welcome back</span>
          <Title level={2}>登录后台</Title>
          <Paragraph>输入账号密码，继续管理你的业务系统。</Paragraph>
        </div>
        {registerSuccessState?.registerSuccess ? (
          <div className="auth-inline-feedback auth-inline-feedback-success">
            <div className="auth-inline-feedback-icon">
              <CheckCircleFilled />
            </div>
            <div className="auth-inline-feedback-content">
              <span>Account ready</span>
              <strong>注册成功，账号已经创建</strong>
              <p>
                {registerSuccessState.email
                  ? `注册邮箱 ${registerSuccessState.email} 已完成校验，现在可以直接登录。`
                  : '注册信息已经生效，现在可以直接登录。'}
              </p>
            </div>
          </div>
        ) : null}
        <Form layout="vertical" size="large" onFinish={onFinish}>
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入账号"
            />
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
          <Form.Item>
            <Button block htmlType="submit" type="primary">
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="auth-extra">
          还没有账号？ <Link to="/register">去注册</Link>
        </div>
      </Card>
    </div>
  );
}

export default Login;

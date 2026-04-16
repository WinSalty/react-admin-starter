import { Button, Card, Form, Input, message, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/services/auth';
import { fetchPermissionBootstrap } from '@/services/permission';
import { useAuthStore } from '@/stores/auth';

const { Paragraph, Title } = Typography;

/**
 * 登录页面，接入认证服务和表单校验。
 * 测试账号：admin / 123456（全部权限），viewer / 123456（仅 dashboard 查看权限）
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function Login() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const [messageApi, contextHolder] = message.useMessage();

  async function onFinish(values: { username: string; password: string }) {
    const res = await login(values);
    if (res.code === 0 && res.data.token) {
      const role = values.username;
      loginStore(res.data.token, role);
      const permRes = await fetchPermissionBootstrap(role);
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
        <Title level={2}>登录后台</Title>
        <Paragraph>测试账号：admin / 123456（全部权限），viewer / 123456（仅查看权限）</Paragraph>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}
          >
            <Input.Password placeholder="请输入密码" />
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

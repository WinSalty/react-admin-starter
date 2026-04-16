import { Button, Card, Form, Input, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Paragraph, Title } = Typography;

/**
 * 登录页面占位，阶段 3 将接入认证服务。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function Login() {
  return (
    <div className="auth-card-wrap">
      <Card className="auth-card">
        <Title level={2}>登录后台</Title>
        <Paragraph>阶段 3 会接入登录接口、token 和权限初始化。</Paragraph>
        <Form layout="vertical">
          <Form.Item label="账号" name="username">
            <Input placeholder="请输入账号" />
          </Form.Item>
          <Form.Item label="密码" name="password">
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Button block type="primary">
            登录
          </Button>
        </Form>
        <div className="auth-extra">
          还没有账号？ <Link to="/register">去注册</Link>
        </div>
      </Card>
    </div>
  );
}

export default Login;

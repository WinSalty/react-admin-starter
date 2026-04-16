import { Button, Card, Form, Input, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Paragraph, Title } = Typography;

/**
 * 注册页面占位，阶段 3 将接入注册服务。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function Register() {
  return (
    <div className="auth-card-wrap">
      <Card className="auth-card">
        <Title level={2}>注册账号</Title>
        <Paragraph>阶段 3 会接入注册接口和表单校验。</Paragraph>
        <Form layout="vertical">
          <Form.Item label="用户名" name="username">
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item label="密码" name="password">
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Button block type="primary">
            注册
          </Button>
        </Form>
        <div className="auth-extra">
          已有账号？ <Link to="/login">去登录</Link>
        </div>
      </Card>
    </div>
  );
}

export default Register;

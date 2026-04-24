import { CheckCircleFilled, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '@/services/auth';
import { fetchPermissionBootstrap } from '@/services/permission';
import { useAuthStore } from '@/stores/auth';

const { Paragraph, Title } = Typography;
const ACCOUNT_UNAVAILABLE_CODE = 4005;
const EMAIL_SEPARATOR = '@';
const VERIFY_EMAIL_PATH = '/register/verify-email';
const PENDING_ACCOUNT_KEYWORD = '尚未激活';

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
  const authNoticeState = location.state as
    | {
        activationMailSent?: boolean;
        accountActivated?: boolean;
        username?: string;
        email?: string;
      }
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
    } else if (isPendingAccountResponse(res.code, res.message)) {
      const email = resolveLoginEmail(values.username);
      navigate(
        email
          ? {
              pathname: VERIFY_EMAIL_PATH,
              search: buildVerifyEmailSearch(email),
            }
          : VERIFY_EMAIL_PATH,
        {
          state: {
            activationMailSent: true,
            email,
            username: values.username,
          },
        },
      );
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
          <Paragraph>输入账号或邮箱与密码，继续管理你的业务系统。</Paragraph>
        </div>
        {renderAuthNotice(authNoticeState)}
        <Form layout="vertical" size="large" onFinish={onFinish}>
          <Form.Item
            label="账号或邮箱"
            name="username"
            rules={[{ required: true, message: '请输入账号或邮箱' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入账号或邮箱"
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

function isPendingAccountResponse(code: number, responseMessage?: string) {
  return code === ACCOUNT_UNAVAILABLE_CODE && !!responseMessage?.includes(PENDING_ACCOUNT_KEYWORD);
}

function resolveLoginEmail(username: string) {
  const account = username.trim();
  return account.includes(EMAIL_SEPARATOR) ? account.toLowerCase() : undefined;
}

function buildVerifyEmailSearch(email: string) {
  const params = new URLSearchParams();
  params.set('email', email);
  return `?${params.toString()}`;
}

function renderAuthNotice(
  state:
    | {
        activationMailSent?: boolean;
        accountActivated?: boolean;
        email?: string;
      }
    | undefined,
) {
  if (state?.activationMailSent) {
    return (
      <div className="auth-inline-feedback auth-inline-feedback-pending">
        <div className="auth-inline-feedback-icon">
          <MailOutlined />
        </div>
        <div className="auth-inline-feedback-content">
          <span>Check inbox</span>
          <strong>激活邮件已发送</strong>
          <p>
            {state.email
              ? `请打开 ${state.email} 收到的邮件，点击激活按钮后再登录。`
              : '请打开注册邮箱收到的邮件，点击激活按钮后再登录。'}
          </p>
        </div>
      </div>
    );
  }
  if (state?.accountActivated) {
    return (
      <div className="auth-inline-feedback auth-inline-feedback-success">
        <div className="auth-inline-feedback-icon">
          <CheckCircleFilled />
        </div>
        <div className="auth-inline-feedback-content">
          <span>Account activated</span>
          <strong>账号已激活</strong>
          <p>{state.email ? `${state.email} 已完成激活，现在可以登录。` : '账号已完成激活，现在可以登录。'}</p>
        </div>
      </div>
    );
  }
  return null;
}

export default Login;

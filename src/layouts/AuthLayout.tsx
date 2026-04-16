import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

/**
 * 认证页面布局，登录和注册页面共用。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function AuthLayout() {
  return (
    <Layout className="auth-layout">
      <Outlet />
    </Layout>
  );
}

export default AuthLayout;

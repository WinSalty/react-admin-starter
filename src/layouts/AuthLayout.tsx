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
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <div className="auth-brand-mark">RA</div>
          <div>
            <h1>React Admin</h1>
            <p>面向业务后台的 Ant Design 管理系统脚手架。</p>
          </div>
          <div className="auth-brand-metrics">
            <div>
              <strong>动态</strong>
              <span>菜单权限</span>
            </div>
            <div>
              <strong>清晰</strong>
              <span>服务分层</span>
            </div>
            <div>
              <strong>高效</strong>
              <span>页面模板</span>
            </div>
          </div>
        </section>
        <Outlet />
      </div>
    </Layout>
  );
}

export default AuthLayout;

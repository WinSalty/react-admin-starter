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
          <div className="auth-brand-copy">
            <div className="auth-brand-mark">RA</div>
            <div>
              <span className="auth-brand-eyebrow">React Admin Starter</span>
              <h1>让后台系统从第一屏就进入状态</h1>
              <p>多级菜单、权限控制、数据看板和管理模板已经准备好。</p>
            </div>
          </div>
          <div className="auth-product-preview" aria-hidden="true">
            <div className="auth-preview-sidebar">
              <span />
              <span />
              <span />
            </div>
            <div className="auth-preview-main">
              <div className="auth-preview-topbar">
                <span />
                <span />
              </div>
              <div className="auth-preview-grid">
                <div className="auth-preview-card auth-preview-card-wide">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="auth-preview-card">
                  <strong />
                  <span />
                </div>
                <div className="auth-preview-card">
                  <strong />
                  <span />
                </div>
              </div>
            </div>
          </div>
          <div className="auth-brand-metrics">
            <div>
              <strong>多级</strong>
              <span>动态菜单</span>
            </div>
            <div>
              <strong>可控</strong>
              <span>权限模型</span>
            </div>
            <div>
              <strong>模板</strong>
              <span>管理页面</span>
            </div>
          </div>
        </section>
        <Outlet />
      </div>
    </Layout>
  );
}

export default AuthLayout;

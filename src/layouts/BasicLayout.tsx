import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, Space, theme, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { appMenus } from '@/config/menu';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/**
 * 后台基础布局，使用 Ant Design Layout/Menu 承载业务页面。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function BasicLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const visibleMenus = useMemo(
    () => appMenus.filter((menu) => !menu.hiddenInMenu).sort((prev, next) => prev.orderNo - next.orderNo),
    [],
  );

  const activeMenu = visibleMenus.find((menu) => location.pathname.startsWith(menu.path)) || visibleMenus[0];

  return (
    <Layout className="app-layout">
      <Sider
        breakpoint="lg"
        collapsed={collapsed}
        collapsible
        onCollapse={setCollapsed}
        trigger={null}
        width={232}
      >
        <div className="app-logo">
          <span>RA</span>
          {!collapsed && <strong>React Admin</strong>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeMenu?.key || 'dashboard']}
          items={visibleMenus.map((menu) => ({
            key: menu.key,
            icon: menu.icon,
            label: menu.label,
          }))}
          onClick={({ key }) => {
            const target = visibleMenus.find((menu) => menu.key === key);
            if (target) {
              navigate(target.path);
            }
          }}
        />
      </Sider>

      <Layout>
        <Header className="app-header">
          <div className="app-header-left">
            <Button
              aria-label={collapsed ? '展开菜单' : '折叠菜单'}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              type="text"
              onClick={() => setCollapsed(!collapsed)}
            />
            <Text strong>{activeMenu?.label || '工作台'}</Text>
          </div>
          <Space className="app-header-user">
            <Avatar size="small">A</Avatar>
            <Text type="secondary">管理员</Text>
          </Space>
        </Header>
        <Content className="app-content" style={{ background: token.colorBgLayout }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default BasicLayout;

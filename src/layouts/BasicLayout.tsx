import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, Space, theme, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { appMenus, mapPermissionMenusToAppMenus, type AppMenuItem } from '@/config/menu';
import { useAuthStore } from '@/stores/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/**
 * 后台基础布局，使用 Ant Design Layout/Menu 承载业务页面。
 * 根据权限动态过滤侧边栏菜单。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function BasicLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const role = useAuthStore((state) => state.role);
  const permissionMenus = useAuthStore((state) => state.menus);
  const routeCodes = useAuthStore((state) => state.routeCodes);

  const isAdmin = role === 'admin';
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const sourceMenus = useMemo(
    () => (permissionMenus.length > 0 ? mapPermissionMenusToAppMenus(permissionMenus) : appMenus),
    [permissionMenus],
  );

  // 默认拒绝：仅当 menu.key 在 routeCodes 中时才显示
  const visibleMenus = useMemo(
    () => filterVisibleMenus(sourceMenus, routeCodes),
    [sourceMenus, routeCodes],
  );

  const activeMenu = findActiveMenu(visibleMenus, location.pathname) || visibleMenus[0];

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
          items={visibleMenus.map(mapToMenuItem)}
          onClick={({ key }) => {
            const target = findMenuByKey(visibleMenus, String(key));
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
            <Avatar size="small">{isAdmin ? 'A' : 'V'}</Avatar>
            <Text type="secondary">{isAdmin ? '管理员' : '访客'}</Text>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出
            </Button>
          </Space>
        </Header>
        <Content className="app-content" style={{ background: token.colorBgLayout }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

function filterVisibleMenus(menus: AppMenuItem[], routeCodes: string[]): AppMenuItem[] {
  return menus
    .filter((menu) => !menu.hiddenInMenu && routeCodes.includes(menu.key))
    .map((menu) => ({
      ...menu,
      children: menu.children ? filterVisibleMenus(menu.children, routeCodes) : undefined,
    }))
    .sort((prev, next) => prev.orderNo - next.orderNo);
}

function mapToMenuItem(menu: AppMenuItem): NonNullable<MenuProps['items']>[number] {
  return {
    key: menu.key,
    icon: menu.icon,
    label: menu.label,
    children: menu.children?.map(mapToMenuItem),
  };
}

function findActiveMenu(menus: AppMenuItem[], pathname: string): AppMenuItem | undefined {
  for (const menu of menus) {
    if (pathname.startsWith(menu.path)) {
      return menu;
    }
    const child = menu.children ? findActiveMenu(menu.children, pathname) : undefined;
    if (child) {
      return child;
    }
  }
  return undefined;
}

function findMenuByKey(menus: AppMenuItem[], key: string): AppMenuItem | undefined {
  for (const menu of menus) {
    if (menu.key === key) {
      return menu;
    }
    const child = menu.children ? findMenuByKey(menu.children, key) : undefined;
    if (child) {
      return child;
    }
  }
  return undefined;
}

export default BasicLayout;

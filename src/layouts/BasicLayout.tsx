import {
  BellOutlined,
  ClockCircleOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, Space, theme, Typography } from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HeaderNoticeTicker } from '@/components/NoticeHighlights';
import { appMenus, mapPermissionMenusToAppMenus, type AppMenuItem } from '@/config/menu';
import { useActiveNotices } from '@/hooks/useActiveNotices';
import { fetchAccountProfile } from '@/services/account';
import { useAuthStore } from '@/stores/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const OPEN_KEYS_STORAGE_KEY = 'react-admin-starter:open-menu-keys';

/**
 * 后台基础布局，使用 Ant Design Layout/Menu 承载业务页面。
 * 根据权限动态过滤侧边栏菜单。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function BasicLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(() => getSavedOpenKeys());
  const [currentTime, setCurrentTime] = useState(() => dayjs().format('YYYY-MM-DD HH:mm'));
  const [tickerEnabled, setTickerEnabled] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const role = useAuthStore((state) => state.role);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);
  const permissionMenus = useAuthStore((state) => state.menus);
  const routeCodes = useAuthStore((state) => state.routeCodes);
  const {
    notices,
    loading: noticesLoading,
    errorMessage: noticesErrorMessage,
  } = useActiveNotices();

  const isAdmin = role === 'admin';
  const accountName = profile?.nickname || profile?.username || role || '未登录账号';
  const accountRoleName = profile?.roleName || (isAdmin ? '管理员' : '访客');
  const avatarText = accountName.slice(0, 1).toUpperCase();
  const avatarUrl = profile?.avatarUrl;
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
  const activeMenuKeys = activeMenu ? [activeMenu.key] : ['dashboard'];
  const activeParentKeys = useMemo(
    () => (activeMenu ? findParentKeys(visibleMenus, activeMenu.key) : []),
    [activeMenu, visibleMenus],
  );

  useEffect(() => {
    setOpenKeys((prevKeys) => {
      const nextKeys = Array.from(new Set([...prevKeys, ...activeParentKeys]));
      saveOpenKeys(nextKeys);
      return nextKeys;
    });
  }, [activeParentKeys]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm'));
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void fetchAccountProfile()
      .then((response) => {
        if (response.code === 0 && response.data) {
          setProfile(response.data);
        }
      })
      .catch(() => {
        setProfile(undefined);
      });
  }, [setProfile]);

  const userDropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      disabled: true,
      label: (
        <div className="user-dropdown-profile">
          <Avatar size={40} src={avatarUrl} icon={<UserOutlined />}>
            {avatarText}
          </Avatar>
          <div>
            <strong>{accountName}</strong>
            <span>{accountRoleName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'time',
      disabled: true,
      icon: <ClockCircleOutlined />,
      label: currentTime,
    },
    {
      key: 'settings',
      icon: <UserOutlined />,
      label: '个人设置',
      onClick: () => navigate('/account/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

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
          inlineCollapsed={collapsed}
          selectedKeys={activeMenuKeys}
          openKeys={collapsed ? undefined : openKeys}
          items={visibleMenus.map(mapToMenuItem)}
          onOpenChange={
            collapsed
              ? undefined
              : (keys) => {
                  const nextKeys = keys.map(String);
                  setOpenKeys(nextKeys);
                  saveOpenKeys(nextKeys);
                }
          }
          onClick={({ key }) => {
            const target = findMenuByKey(visibleMenus, String(key));
            if (target?.externalLink) {
              window.open(target.externalLink, '_blank', 'noopener,noreferrer');
              return;
            }
            if (target?.path && !target.disabled) {
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
          <HeaderNoticeTicker
            notices={notices}
            loading={noticesLoading}
            errorMessage={noticesErrorMessage}
            tickerEnabled={tickerEnabled}
          />
          <Button
            aria-label={tickerEnabled ? '关闭公告滚动' : '开启公告滚动'}
            className={`app-header-bell ${tickerEnabled ? 'is-active' : 'is-paused'}`}
            type="text"
            onClick={() => setTickerEnabled((value) => !value)}
          >
            <BellOutlined />
            <span className="app-header-bell-slash" />
          </Button>
          <Dropdown
            menu={{ items: userDropdownItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button className="app-header-user" type="text">
              <Space size={8}>
                <Avatar size="small" src={avatarUrl}>
                  {avatarText}
                </Avatar>
                <span className="app-header-user-name">{accountName}</span>
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
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
    .map((menu) => {
      const children = menu.children ? filterVisibleMenus(menu.children, routeCodes) : undefined;
      return { ...menu, children };
    })
    .filter((menu) => {
      if (menu.hiddenInMenu || menu.type === 'hidden') {
        return false;
      }
      if (menu.children && menu.children.length > 0) {
        return true;
      }
      if (menu.disabled) {
        return true;
      }
      if (!menu.permissionCode) {
        return true;
      }
      return routeCodes.includes(menu.key) || routeCodes.includes(getRouteCode(menu));
    })
    .sort((prev, next) => prev.orderNo - next.orderNo);
}

function mapToMenuItem(menu: AppMenuItem): NonNullable<MenuProps['items']>[number] {
  return {
    key: menu.key,
    icon: menu.icon,
    label: menu.badge ? `${menu.label} ${menu.badge}` : menu.label,
    disabled: menu.disabled,
    children: menu.children?.map(mapToMenuItem),
  };
}

function findActiveMenu(menus: AppMenuItem[], pathname: string): AppMenuItem | undefined {
  for (const menu of menus) {
    const child = menu.children ? findActiveMenu(menu.children, pathname) : undefined;
    if (child) {
      return child;
    }
    if (menu.path && pathname.startsWith(menu.path)) {
      return menu;
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

function findParentKeys(
  menus: AppMenuItem[],
  targetKey: string,
  parentKeys: string[] = [],
): string[] {
  for (const menu of menus) {
    if (menu.key === targetKey) {
      return parentKeys;
    }
    const childKeys = menu.children
      ? findParentKeys(menu.children, targetKey, [...parentKeys, menu.key])
      : [];
    if (childKeys.length > 0) {
      return childKeys;
    }
  }
  return [];
}

function getRouteCode(menu: AppMenuItem): string {
  return menu.permissionCode?.split(':')[0] || menu.key;
}

function getSavedOpenKeys(): string[] {
  try {
    const rawValue = window.localStorage.getItem(OPEN_KEYS_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch {
    return [];
  }
}

function saveOpenKeys(keys: string[]) {
  window.localStorage.setItem(OPEN_KEYS_STORAGE_KEY, JSON.stringify(keys));
}

export default BasicLayout;

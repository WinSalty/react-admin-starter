import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { themeConfig } from './theme';

/**
 * 应用根组件，负责挂载 Ant Design 全局配置和路由。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function App() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;

import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

/**
 * 未匹配路由页面。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function NotFound() {
  return (
    <main className="starter-page">
      <Result
        status="404"
        title="页面不存在"
        subTitle="当前访问的页面未配置路由。"
        extra={
          <Link to="/dashboard">
            <Button type="primary">返回首页</Button>
          </Link>
        }
      />
    </main>
  );
}

export default NotFound;

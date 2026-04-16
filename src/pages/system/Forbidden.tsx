import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

/**
 * 无权限页面。
 * 创建日期：2026-04-16
 * author: sunshengxian
 */
function Forbidden() {
  return (
    <Result
      status="403"
      title="无权访问"
      subTitle="当前账号没有访问该页面的权限。"
      extra={
        <Link to="/dashboard">
          <Button type="primary">返回首页</Button>
        </Link>
      }
    />
  );
}

export default Forbidden;

import type { ReactNode } from 'react';
import { Card } from 'antd';

interface ListTableCardProps {
  title: ReactNode;
  children: ReactNode;
  extra?: ReactNode;
  description?: ReactNode;
}

/**
 * 列表结果卡片。
 * 统一承载表格标题、工具栏和列表说明。
 * author: sunshengxian
 * 创建日期：2026-04-26
 */
function ListTableCard({ title, children, extra, description }: ListTableCardProps) {
  return (
    <Card className="admin-table-card" title={title} extra={extra}>
      {description ? <p className="admin-table-card-description">{description}</p> : null}
      {children}
    </Card>
  );
}

export default ListTableCard;

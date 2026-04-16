import type { ReactNode } from 'react';
import { Typography } from 'antd';

const { Paragraph, Title } = Typography;

/**
 * 页面头部组件。
 * 统一非工作台页面的紧凑标题、描述和操作区布局。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
export function PageHeader({
  title,
  description,
  extra,
}: {
  title: string;
  description?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div className="page-header-main">
        <Title level={3}>{title}</Title>
        {description ? <Paragraph>{description}</Paragraph> : null}
      </div>
      {extra ? <div className="page-header-extra">{extra}</div> : null}
    </div>
  );
}

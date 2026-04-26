import { PlusOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { Button } from 'antd';

interface CreateButtonProps {
  children: ReactNode;
  onClick: () => void;
}

/**
 * 新增操作按钮。
 * 统一列表工具栏中新增入口的图标和按钮样式。
 * author: sunshengxian
 * 创建日期：2026-04-26
 */
function CreateButton({ children, onClick }: CreateButtonProps) {
  return (
    <Button type="primary" icon={<PlusOutlined />} onClick={onClick}>
      {children}
    </Button>
  );
}

export default CreateButton;

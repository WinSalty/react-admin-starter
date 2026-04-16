import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

/**
 * 权限控制组件。
 * 有权限时渲染 children，无权限时不渲染或渲染 fallback。
 *
 * 用法：
 *   <Access action="query:add">
 *     <Button>新增</Button>
 *   </Access>
 *   <Access action="query:delete" fallback={<Button disabled>删除</Button>}>
 *     <Button danger>删除</Button>
 *   </Access>
 *
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
export function Access({
  action,
  fallback,
  children,
}: {
  action: string;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { hasAction } = usePermission();
  if (!hasAction(action)) {
    return fallback ?? null;
  }
  return children;
}

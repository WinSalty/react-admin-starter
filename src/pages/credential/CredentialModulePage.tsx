import { Empty, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { AppstoreOutlined, FileSearchOutlined, GiftOutlined, ImportOutlined, KeyOutlined, LinkOutlined } from '@ant-design/icons';
import ListTableCard from '@/components/admin/ListTableCard';

type CredentialModuleKind = 'batches' | 'items' | 'extractLinks' | 'categories' | 'importTasks' | 'redeemRecords';

interface CredentialModulePageProps {
  moduleKind: CredentialModuleKind;
}

interface CredentialModuleRow {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

const moduleMeta: Record<CredentialModuleKind, { title: string; icon: JSX.Element }> = {
  batches: { title: '凭证批次', icon: <GiftOutlined /> },
  items: { title: '凭证明细', icon: <KeyOutlined /> },
  extractLinks: { title: '提取链接', icon: <LinkOutlined /> },
  categories: { title: '凭证分类', icon: <AppstoreOutlined /> },
  importTasks: { title: '导入任务', icon: <ImportOutlined /> },
  redeemRecords: { title: '兑换记录', icon: <FileSearchOutlined /> },
};

/**
 * 凭证中心模块页面。
 * 阶段一先接入凭证中心菜单和路由，后续阶段按模块替换为真实列表与操作。
 * author: sunshengxian
 * 创建日期：2026-05-01
 */
function CredentialModulePage({ moduleKind }: CredentialModulePageProps) {
  const meta = moduleMeta[moduleKind];
  const columns: TableProps<CredentialModuleRow>['columns'] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
      render: (value: string) => <Tag>{value || '-'}</Tag>,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 180,
      render: (value: string) => value || '-',
    },
  ];

  return (
    <ListTableCard title={<span className="wallet-section-title"><span>{meta.icon}</span>{meta.title}</span>}>
      <Table<CredentialModuleRow>
        columns={columns}
        dataSource={[]}
        locale={{ emptyText: <Empty description="暂无记录" /> }}
        pagination={false}
        rowKey="id"
        size="small"
      />
    </ListTableCard>
  );
}

export default CredentialModulePage;

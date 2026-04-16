import type { PageResult } from '@/types/api';
import type { QueryListParams, QueryRecord, QuerySaveParams } from '@/types/query';

/**
 * 查询管理 mock 数据。
 * 当前用于前端列表模板开发，后续接入真实接口时由 service 层替换数据来源。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

let queryRecords: QueryRecord[] = [
  {
    id: 'Q1001',
    name: '客户基础信息查询',
    code: 'customer_profile_query',
    status: 'active',
    owner: '运营中心',
    description: '按客户编号、手机号和证件号检索客户基础资料。',
    callCount: 1288,
    createdAt: '2026-03-18 09:12:00',
    updatedAt: '2026-04-15 16:40:00',
  },
  {
    id: 'Q1002',
    name: '订单流水查询',
    code: 'order_flow_query',
    status: 'active',
    owner: '交易中心',
    description: '查询订单创建、支付、退款和关闭等完整流水。',
    callCount: 2460,
    createdAt: '2026-03-20 10:08:00',
    updatedAt: '2026-04-16 10:10:00',
  },
  {
    id: 'Q1003',
    name: '权限变更审计',
    code: 'permission_audit_query',
    status: 'active',
    owner: '安全中心',
    description: '检索角色、菜单、按钮权限的变更记录。',
    callCount: 638,
    createdAt: '2026-03-25 14:32:00',
    updatedAt: '2026-04-14 11:02:00',
  },
  {
    id: 'Q1004',
    name: '登录异常查询',
    code: 'login_risk_query',
    status: 'active',
    owner: '安全中心',
    description: '查询异地登录、连续失败和风险设备登录记录。',
    callCount: 932,
    createdAt: '2026-03-29 08:24:00',
    updatedAt: '2026-04-16 08:45:00',
  },
  {
    id: 'Q1005',
    name: '库存快照查询',
    code: 'stock_snapshot_query',
    status: 'disabled',
    owner: '供应链',
    description: '历史库存快照查询，已由新库存中心接口替代。',
    callCount: 84,
    createdAt: '2026-02-17 15:20:00',
    updatedAt: '2026-04-01 09:18:00',
  },
  {
    id: 'Q1006',
    name: '商品上下架查询',
    code: 'goods_publish_query',
    status: 'active',
    owner: '商品中心',
    description: '查看商品上下架状态、操作人和最近一次发布时间。',
    callCount: 1186,
    createdAt: '2026-03-11 13:00:00',
    updatedAt: '2026-04-12 18:22:00',
  },
  {
    id: 'Q1007',
    name: '营销活动查询',
    code: 'campaign_query',
    status: 'active',
    owner: '营销中心',
    description: '查询活动状态、预算消耗和人群覆盖情况。',
    callCount: 760,
    createdAt: '2026-03-15 11:36:00',
    updatedAt: '2026-04-13 17:31:00',
  },
  {
    id: 'Q1008',
    name: '消息投递查询',
    code: 'message_delivery_query',
    status: 'disabled',
    owner: '消息中心',
    description: '查询短信、站内信、邮件等消息通道投递记录。',
    callCount: 352,
    createdAt: '2026-02-28 16:18:00',
    updatedAt: '2026-04-07 12:09:00',
  },
  {
    id: 'Q1009',
    name: '支付对账查询',
    code: 'payment_reconcile_query',
    status: 'active',
    owner: '财务中心',
    description: '按支付渠道、交易日期和对账状态查询资金记录。',
    callCount: 1094,
    createdAt: '2026-03-05 09:56:00',
    updatedAt: '2026-04-15 19:42:00',
  },
  {
    id: 'Q1010',
    name: '接口调用日志',
    code: 'api_access_log_query',
    status: 'active',
    owner: '平台技术部',
    description: '按接口、调用方、响应码和耗时检索访问日志。',
    callCount: 3198,
    createdAt: '2026-03-01 10:00:00',
    updatedAt: '2026-04-16 09:06:00',
  },
  {
    id: 'Q1011',
    name: '审批流程查询',
    code: 'approval_flow_query',
    status: 'active',
    owner: '流程中心',
    description: '查询审批节点、当前处理人和流程耗时。',
    callCount: 476,
    createdAt: '2026-03-23 17:48:00',
    updatedAt: '2026-04-11 13:44:00',
  },
  {
    id: 'Q1012',
    name: '数据导出任务',
    code: 'export_task_query',
    status: 'active',
    owner: '数据平台',
    description: '查看异步导出任务进度、文件状态和失败原因。',
    callCount: 884,
    createdAt: '2026-03-27 15:22:00',
    updatedAt: '2026-04-16 11:27:00',
  },
];

/**
 * 模拟分页查询。
 */
export async function mockFetchQueryPage(params: QueryListParams): Promise<PageResult<QueryRecord>> {
  await delay(420);
  const keyword = params.keyword?.trim().toLowerCase();
  const filteredRecords = queryRecords.filter((record) => {
    const matchedKeyword = keyword
      ? [record.name, record.code, record.owner, record.description].some((field) =>
          field.toLowerCase().includes(keyword),
        )
      : true;
    const matchedStatus = params.status ? record.status === params.status : true;
    return matchedKeyword && matchedStatus;
  });
  const start = (params.pageNo - 1) * params.pageSize;
  const records = filteredRecords.slice(start, start + params.pageSize);
  return {
    records: records.map((item) => ({ ...item })),
    pageNo: params.pageNo,
    pageSize: params.pageSize,
    total: filteredRecords.length,
  };
}

/**
 * 模拟查询详情。
 */
export async function mockFetchQueryDetail(id: string): Promise<QueryRecord | undefined> {
  await delay(260);
  const record = queryRecords.find((item) => item.id === id);
  return record ? { ...record } : undefined;
}

/**
 * 模拟保存查询配置。
 */
export async function mockSaveQueryRecord(params: QuerySaveParams): Promise<QueryRecord> {
  await delay(360);
  const now = '2026-04-16 12:00:00';
  if (params.id) {
    const recordIndex = queryRecords.findIndex((item) => item.id === params.id);
    if (recordIndex >= 0) {
      const nextRecord = {
        ...queryRecords[recordIndex],
        ...params,
        updatedAt: now,
      };
      queryRecords = queryRecords.map((item, index) => (index === recordIndex ? nextRecord : item));
      return { ...nextRecord };
    }
  }

  const nextRecord: QueryRecord = {
    ...params,
    id: `Q${1001 + queryRecords.length}`,
    callCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  queryRecords = [nextRecord, ...queryRecords];
  return { ...nextRecord };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

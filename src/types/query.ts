export type QueryStatus = 'active' | 'disabled';

export interface QueryRecord {
  id: string;
  name: string;
  code: string;
  status: QueryStatus;
  owner: string;
  description: string;
  callCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueryListParams {
  keyword?: string;
  status?: QueryStatus;
  pageNo: number;
  pageSize: number;
}

export interface QuerySaveParams {
  id?: string;
  name: string;
  code: string;
  status: QueryStatus;
  owner: string;
  description: string;
}

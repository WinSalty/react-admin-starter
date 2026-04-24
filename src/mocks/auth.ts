import type { ApiResponse } from '@/types/api';
import type { LoginParams, LoginResult } from '@/services/auth';

/**
 * 认证 mock 数据。
 * 注意：mock 仅用于前端开发阶段，后续替换为真实接口时需删除此文件。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token.admin.2026-04-16';

interface MockUser {
  username: string;
  password: string;
}

const mockUsers: MockUser[] = [
  { username: 'admin', password: '123456' },
  { username: 'viewer', password: '123456' },
];

/**
 * 模拟登录接口。
 * 用户名 admin，密码 123456 可登录成功。
 */
export async function mockLogin(params: LoginParams): Promise<ApiResponse<LoginResult>> {
  await delay(600);
  const user = mockUsers.find(
    (u) => u.username === params.username && u.password === params.password,
  );
  if (!user) {
    return {
      code: 401,
      message: '用户名或密码错误',
      data: { token: '' },
    };
  }
  return {
    code: 0,
    message: '登录成功',
    data: { token: MOCK_TOKEN },
  };
}

/**
 * 模拟注册接口。
 */
export async function mockRegister(params: {
  username: string;
  email: string;
  password: string;
}): Promise<ApiResponse<void>> {
  await delay(600);
  const exists = mockUsers.some((u) => u.username === params.username);
  if (exists) {
    return {
      code: 400,
      message: '用户名已存在',
      data: undefined,
    };
  }
  mockUsers.push({ username: params.username, password: params.password });
  return {
    code: 0,
    message: '注册申请已提交，激活邮件已发送',
    data: undefined,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const AVATAR_ACCESS_PATH_PREFIX = '/api/file/avatar/';
const API_PATH_PREFIX = '/api/';
const TRAILING_SLASH_PATTERN = /\/+$/;
const HTTP_URL_PATTERN = /^https?:\/\//i;

/**
 * 规范化可持久化头像地址。
 * 仅保留后端允许保存的稳定头像访问路径，避免把临时签名地址或前端拼接后的绝对地址写回用户资料。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
export function normalizePersistentAvatarUrl(value?: string): string | undefined {
  const avatarUrl = trimToUndefined(value);
  if (!avatarUrl || !avatarUrl.startsWith(AVATAR_ACCESS_PATH_PREFIX)) {
    return undefined;
  }
  return avatarUrl;
}

/**
 * 解析头像展示地址。
 * 当前用户头像由后端返回 /api/file/avatar/{id}，独立部署时需要拼接 VITE_API_BASE_URL 后才能让 img 请求命中 API 服务。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
export function resolveAvatarDisplayUrl(value?: string): string | undefined {
  const avatarUrl = trimToUndefined(value);
  if (!avatarUrl) {
    return undefined;
  }
  if (HTTP_URL_PATTERN.test(avatarUrl)) {
    return avatarUrl;
  }
  if (avatarUrl.startsWith(API_PATH_PREFIX)) {
    return buildApiAssetUrl(avatarUrl);
  }
  return undefined;
}

function buildApiAssetUrl(apiPath: string): string {
  const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
  if (!apiBaseUrl) {
    return apiPath;
  }
  return `${apiBaseUrl}${apiPath}`;
}

function normalizeApiBaseUrl(value?: string): string | undefined {
  const apiBaseUrl = trimToUndefined(value);
  if (!apiBaseUrl) {
    return undefined;
  }
  return apiBaseUrl.replace(TRAILING_SLASH_PATTERN, '');
}

function trimToUndefined(value?: string): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

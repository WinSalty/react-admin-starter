/**
 * 浏览器端会话存储工具。
 * 认证敏感数据只写入 sessionStorage，降低长期落盘 token 被复用的风险。
 * author: sunshengxian
 * 创建日期：2026-04-23
 */
export function readStorage(key: string): string | null {
  const sessionValue = window.sessionStorage.getItem(key);
  if (sessionValue) {
    return sessionValue;
  }
  const legacyValue = window.localStorage.getItem(key);
  if (legacyValue) {
    window.localStorage.removeItem(key);
    window.sessionStorage.setItem(key, legacyValue);
  }
  return legacyValue;
}

export function writeStorage(key: string, value: string): void {
  window.localStorage.removeItem(key);
  window.sessionStorage.setItem(key, value);
}

export function removeStorage(key: string): void {
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

/**
 * 文本复制工具。
 * 优先使用 Clipboard API，HTTP 或浏览器策略拦截时降级为隐藏 textarea 复制。
 * author: sunshengxian
 * 创建日期：2026-04-26
 */
export async function copyText(text: string): Promise<boolean> {
  if (!text) {
    return false;
  }
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 继续走兼容方案，覆盖 HTTP、权限策略或浏览器限制导致的失败。
    }
  }
  return legacyCopyText(text);
}

function legacyCopyText(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

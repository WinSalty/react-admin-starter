import type { DeviceSnapshot } from '@/types/cdk';

/**
 * 浏览器设备指纹工具。
 * 采集无需授权的基础设备信息并生成 SHA-256 摘要，用于 CDK 提取访问审计。
 * author: sunshengxian
 * 创建日期：2026-04-30
 */
export async function collectDeviceFingerprint(): Promise<{
  browserFingerprint: string;
  deviceSnapshot: DeviceSnapshot;
}> {
  const deviceSnapshot = buildDeviceSnapshot();
  const stableText = [
    navigator.userAgent || '',
    deviceSnapshot.platform || '',
    deviceSnapshot.language || '',
    deviceSnapshot.timezone || '',
    deviceSnapshot.screen || '',
    String(deviceSnapshot.colorDepth || ''),
    String(deviceSnapshot.deviceMemory || ''),
    String(deviceSnapshot.hardwareConcurrency || ''),
    String(deviceSnapshot.touchPoints || ''),
  ].join('|');
  return {
    browserFingerprint: await sha256(stableText),
    deviceSnapshot,
  };
}

function buildDeviceSnapshot(): DeviceSnapshot {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    touchPoints: navigator.maxTouchPoints,
  };
}

async function sha256(value: string): Promise<string> {
  if (!window.crypto?.subtle) {
    return '';
  }
  const data = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

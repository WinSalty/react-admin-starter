import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface DurationPreset {
  label: string;
  days: number;
}

interface PickerPreset<T> {
  label: string;
  value: T;
}

const VALID_RANGE_PRESET_DAYS: DurationPreset[] = [
  { label: '7天', days: 7 },
  { label: '30天', days: 30 },
  { label: '90天', days: 90 },
  { label: '180天', days: 180 },
  { label: '365天', days: 365 },
];

const EXPIRE_AT_PRESET_DAYS: DurationPreset[] = [
  { label: '1天', days: 1 },
  { label: '3天', days: 3 },
  { label: '7天', days: 7 },
  { label: '15天', days: 15 },
  { label: '30天', days: 30 },
  { label: '90天', days: 90 },
];

/**
 * 构建凭证批次有效期快捷选项。
 * 以当前时间作为开始时间，按常用天数自动生成结束时间。
 * author: sunshengxian
 * 创建日期：2026-05-01
 */
export function buildCredentialValidRangePresets(): PickerPreset<[Dayjs, Dayjs]>[] {
  const now = dayjs();
  return VALID_RANGE_PRESET_DAYS.map((preset) => ({
    label: preset.label,
    value: [now, now.add(preset.days, 'day')],
  }));
}

/**
 * 构建提取链接过期时间快捷选项。
 * 以当前时间为基准，按常用天数自动生成过期时间。
 * author: sunshengxian
 * 创建日期：2026-05-01
 */
export function buildCredentialExpireAtPresets(): PickerPreset<Dayjs>[] {
  const now = dayjs();
  return EXPIRE_AT_PRESET_DAYS.map((preset) => ({
    label: preset.label,
    value: now.add(preset.days, 'day'),
  }));
}

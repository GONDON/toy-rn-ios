/**
 * DP 工具函数
 * 提供 DP 数据的验证、格式化、权限检查等功能
 */

import {
  DPId,
  DPPermissions,
  DPUtils,
  DPErrorType,
  DPError,
  AnyDP,
  ValueProperties,
  EnumProperties,
} from '../types/dp';
import { getDPDefinition } from '../config/dpDefinitions';

// DP 权限检查
export function getDPPermissions(dpId: number): DPPermissions {
  const definition = getDPDefinition(dpId);
  if (!definition) {
    return { canRead: false, canWrite: false, canReport: false };
  }

  const { transmissionType } = definition;
  return {
    canRead: transmissionType === 'ro' || transmissionType === 'rw',
    canWrite: transmissionType === 'rw' || transmissionType === 'wr',
    canReport: transmissionType === 'ro' || transmissionType === 'rw',
  };
}

// 验证 DP 值
export function validateDPValue(dpId: number, value: any): boolean {
  const definition = getDPDefinition(dpId);
  if (!definition) {
    return false;
  }

  try {
    switch (definition.dataType) {
      case 'value':
        return validateValueType(value, definition.properties as ValueProperties);
      case 'enum':
        return validateEnumType(value, definition.properties as EnumProperties);
      case 'bool':
        return typeof value === 'boolean';
      case 'string':
        return typeof value === 'string';
      case 'raw':
        return validateRawType(dpId, value);
      default:
        return false;
    }
  } catch (error) {
    console.error(`DP ${dpId} 值验证失败:`, error);
    return false;
  }
}

// 验证 value 类型
function validateValueType(value: any, properties: ValueProperties): boolean {
  if (typeof value !== 'number') {
    return false;
  }

  const { range, step } = properties;
  const [min, max] = range;

  // 检查范围
  if (value < min || value > max) {
    return false;
  }

  // 检查步长
  if (step > 0 && (value - min) % step !== 0) {
    return false;
  }

  return true;
}

// 验证 enum 类型
function validateEnumType(value: any, properties: EnumProperties): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  return properties.values.includes(value);
}

// 验证 raw 类型
function validateRawType(dpId: number, value: any): boolean {
  switch (dpId) {
    case DPId.PLAYBACK:
      return validatePlaybackData(value);
    case DPId.STORY_DOWNLOADING:
      return validateStoryDownloadingData(value);
    case DPId.STORY_PLAYING:
      return validateStoryPlayingData(value);
    case DPId.STORY_DELETE:
      return validateStoryDeleteData(value);
    case DPId.CALL_STATUS:
      return validateCallStatusData(value);
    case DPId.CALL:
      return validateCallData(value);
    case DPId.SLEEP_TIME:
      return validateSleepTimeData(value);
    case DPId.SLEEP_VIDEO:
      return validateSleepVideoData(value);
    default:
      return true; // 对于未定义的 raw 类型，默认通过
  }
}

// 验证播放数据
function validatePlaybackData(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.fileId === 'string' &&
    ['play', 'pause'].includes(value.action)
  );
}

// 验证故事下载数据
function validateStoryDownloadingData(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.dollId === 'string' &&
    typeof value.fileId === 'string' &&
    typeof value.status === 'number' &&
    [1, 2, 3, 4].includes(value.status)
  );
}

// 验证故事播放数据
function validateStoryPlayingData(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.dollId === 'string' &&
    typeof value.fileId === 'string' &&
    ['play', 'pause', 'end', 'error'].includes(value.action)
  );
}

// 验证故事删除数据
function validateStoryDeleteData(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.dollId === 'string' &&
    Array.isArray(value.fileIds) &&
    value.fileIds.every((id: any) => typeof id === 'string')
  );
}

// 验证通话状态数据
function validateCallStatusData(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.userId === 'string' &&
    ['busy', 'connecting', 'unreachable', 'hangup', 'missed'].includes(value.status) &&
    ['incoming', 'outgoing'].includes(value.direction)
  );
}

// 验证通话数据
function validateCallData(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.userId === 'string' &&
    ['start', 'end'].includes(value.action)
  );
}

// 验证睡眠时间数据
function validateSleepTimeData(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.startTime === 'string' &&
    typeof value.endTime === 'string'
  );
}

// 验证睡眠音频数据
function validateSleepVideoData(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.audioId === 'string' &&
    typeof value.audioUrl === 'string'
  );
}

// 格式化 DP 值用于显示
export function formatDPValue(dpId: number, value: any): string {
  const definition = getDPDefinition(dpId);
  if (!definition) {
    return String(value);
  }

  try {
    switch (definition.dataType) {
      case 'value':
        const properties = definition.properties as ValueProperties;
        const unit = properties.unit || '';
        return `${value}${unit}`;
      case 'enum':
        return String(value);
      case 'bool':
        return value ? '开启' : '关闭';
      case 'string':
        return String(value);
      case 'raw':
        return formatRawValue(dpId, value);
      default:
        return String(value);
    }
  } catch (error) {
    console.error(`DP ${dpId} 值格式化失败:`, error);
    return String(value);
  }
}

// 格式化 raw 类型值
function formatRawValue(dpId: number, value: any): string {
  switch (dpId) {
    case DPId.PLAYBACK:
      return `${value.fileId} - ${value.action === 'play' ? '播放' : '暂停'}`;
    case DPId.STORY_DOWNLOADING:
      const statusMap = { 1: '下载成功', 2: '下载失败', 3: '播放成功', 4: '播放失败' };
      return `${value.dollId}/${value.fileId} - ${statusMap[value.status] || '未知状态'}`;
    case DPId.STORY_PLAYING:
      const actionMap = { play: '播放', pause: '暂停', end: '结束', error: '错误' };
      return `${value.dollId}/${value.fileId} - ${actionMap[value.action] || '未知动作'}`;
    default:
      return JSON.stringify(value);
  }
}

// 解析原始值
export function parseDPValue(dpId: number, rawValue: any): any {
  const definition = getDPDefinition(dpId);
  if (!definition) {
    return rawValue;
  }

  try {
    switch (definition.dataType) {
      case 'value':
        return Number(rawValue);
      case 'enum':
        return String(rawValue);
      case 'bool':
        return Boolean(rawValue);
      case 'string':
        return String(rawValue);
      case 'raw':
        return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
      default:
        return rawValue;
    }
  } catch (error) {
    console.error(`DP ${dpId} 值解析失败:`, error);
    return rawValue;
  }
}

// 创建 DP 错误
export function createDPError(
  type: DPErrorType,
  message: string,
  dpId?: number,
  originalError?: any
): DPError {
  return {
    type,
    message,
    dpId,
    originalError,
  };
}

// DP 工具函数实现
export const dpUtils: DPUtils = {
  getPermissions: getDPPermissions,
  validateValue: validateDPValue,
  formatValue: formatDPValue,
  parseValue: parseDPValue,
};

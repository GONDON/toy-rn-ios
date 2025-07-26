/**
 * DP (Data Point) 类型定义系统
 * 基于 dps.csv 文件生成的完整类型定义
 */

// DP 数据传输类型
export type DPTransmissionType = 'ro' | 'rw' | 'wr';

// DP 数据类型
export type DPDataType = 'value' | 'enum' | 'bool' | 'raw' | 'string';

// 基础 DP 接口
export interface BaseDPDefinition {
  id: number;
  name: string;
  identifier: string;
  transmissionType: DPTransmissionType;
  dataType: DPDataType;
  properties?: string;
  reportFrequencyLimit?: string;
  remark?: string;
}

// Value 类型的属性定义
export interface ValueProperties {
  range: [number, number];
  step: number;
  scale: number;
  unit?: string;
}

// Enum 类型的属性定义
export interface EnumProperties {
  values: string[];
}

// 具体的 DP 值类型定义
export type DPValue<T extends DPDataType> =
  T extends 'value' ? number :
  T extends 'enum' ? string :
  T extends 'bool' ? boolean :
  T extends 'raw' ? any :
  T extends 'string' ? string :
  never;

// 泛型 DP 定义
export interface DPDefinition<T extends DPDataType = DPDataType> extends BaseDPDefinition {
  dataType: T;
  value?: DPValue<T>;
  properties?: T extends 'value' ? ValueProperties :
  T extends 'enum' ? EnumProperties :
  any;
}

// 具体的 DP ID 枚举
export enum DPId {
  BATTERY_PERCENTAGE = 2,
  VOLUME_SET = 3,
  CHARGE_STATUS = 4,
  SWITCH_1 = 101,
  PLAYBACK = 102,
  TOY_ID = 103,
  STORY_SYNCHRONIZE = 104,
  STORY_DOWNLOADING = 105,
  STORY_PLAYING = 106,
  STORY_DELETE = 107,
  AI_CONVERSATION = 108,
  AI_CONVERSATION_MODE = 109,
  AI_CONVERSATION_STATUS = 110,
  VOICE_CALL_STATUS = 111,
  CALL_STATUS = 112,
  CALL = 113,
  LIGHT_PERCENTAGE = 114,
  MAX_VOLUME_SET = 115,
  HEADPHONE_VOLUME_LIMIT = 116,
  MUSIC_SET = 117,
  SLEEP_MODE = 118,
  SLEEP_TIME = 119,
  SLEEP_VIDEO = 120,
  SLEEP_LIST = 121,
  SLEEP_DELETE = 122,
  TIME_FORMAT = 125,
  LOW_BATTERY_ALARM = 126,
  RESTORE_DEFAULT = 127,
}

// 充电状态枚举
export enum ChargeStatus {
  NONE = 'none',
  CHARGING = 'charging',
  CHARGE_DONE = 'charge_done',
}

// AI对话模式枚举
export enum AIConversationMode {
  CONTINUOUS = 'continuous_conversation',
  QA = 'qa_conversation',
}

// AI对话状态枚举
export enum AIConversationStatus {
  START = 'conversation_start',
  END = 'conversation_end',
}

// 时间格式枚举
export enum TimeFormat {
  HOUR_24 = '24',
  HOUR_12 = '12',
}

// 低电量提醒枚举
export enum LowBatteryAlarm {
  ALARM = 'alarm',
  NORMAL = 'normal',
}

// 恢复出厂设置枚举
export enum RestoreDefault {
  RESTORE = 'restore',
  NORMAL = 'normal',
}

// Raw 数据类型的具体定义
export interface PlaybackData {
  fileId: string;
  action: 'play' | 'pause';
}

export interface StoryDownloadingData {
  dollId: string;
  fileId: string;
  status: number; // 状态枚举：1-下载成功，2-下载失败，3-播放成功，4-播放失败
  message?: string;
}

export interface StoryPlayingData {
  dollId: string;
  fileId: string;
  action: 'play' | 'pause' | 'end' | 'error';
  message?: string;
}

export interface StoryDeleteData {
  dollId: string;
  fileIds: string[];
}

export interface CallStatusData {
  userId: string;
  status: 'busy' | 'connecting' | 'unreachable' | 'hangup' | 'missed';
  direction: 'incoming' | 'outgoing';
}

export interface CallData {
  userId: string;
  action: 'start' | 'end';
}

export interface SleepTimeData {
  startTime: string;
  endTime: string;
}

export interface SleepVideoData {
  audioId: string;
  audioUrl: string;
}

// 具体的 DP 类型定义
export type BatteryPercentageDP = DPDefinition<'value'> & {
  id: DPId.BATTERY_PERCENTAGE;
  properties: ValueProperties & { range: [0, 100]; step: 10; scale: 0; unit: '%' };
};

export type VolumeSetDP = DPDefinition<'value'> & {
  id: DPId.VOLUME_SET;
  properties: ValueProperties & { range: [0, 100]; step: 10; scale: 0; unit: '%' };
};

export type ChargeStatusDP = DPDefinition<'enum'> & {
  id: DPId.CHARGE_STATUS;
  properties: EnumProperties & { values: [ChargeStatus.NONE, ChargeStatus.CHARGING, ChargeStatus.CHARGE_DONE] };
};

export type Switch1DP = DPDefinition<'bool'> & {
  id: DPId.SWITCH_1;
};

export type PlaybackDP = DPDefinition<'raw'> & {
  id: DPId.PLAYBACK;
  value?: PlaybackData;
};

export type ToyIdDP = DPDefinition<'string'> & {
  id: DPId.TOY_ID;
};

export type AIConversationDP = DPDefinition<'bool'> & {
  id: DPId.AI_CONVERSATION;
};

export type AIConversationModeDP = DPDefinition<'enum'> & {
  id: DPId.AI_CONVERSATION_MODE;
  properties: EnumProperties & { values: [AIConversationMode.CONTINUOUS, AIConversationMode.QA] };
};

export type AIConversationStatusDP = DPDefinition<'enum'> & {
  id: DPId.AI_CONVERSATION_STATUS;
  properties: EnumProperties & { values: [AIConversationStatus.START, AIConversationStatus.END] };
};

export type LightPercentageDP = DPDefinition<'value'> & {
  id: DPId.LIGHT_PERCENTAGE;
  properties: ValueProperties & { range: [0, 7]; step: 1; scale: 0; unit: '' };
};

export type MaxVolumeSetDP = DPDefinition<'value'> & {
  id: DPId.MAX_VOLUME_SET;
  properties: ValueProperties & { range: [0, 10]; step: 1; scale: 0; unit: '' };
};

export type HeadphoneVolumeLimitDP = DPDefinition<'value'> & {
  id: DPId.HEADPHONE_VOLUME_LIMIT;
  properties: ValueProperties & { range: [0, 10]; step: 1; scale: 0; unit: '' };
};

export type SleepModeDP = DPDefinition<'bool'> & {
  id: DPId.SLEEP_MODE;
};

export type TimeFormatDP = DPDefinition<'enum'> & {
  id: DPId.TIME_FORMAT;
  properties: EnumProperties & { values: [TimeFormat.HOUR_24, TimeFormat.HOUR_12] };
};

export type LowBatteryAlarmDP = DPDefinition<'enum'> & {
  id: DPId.LOW_BATTERY_ALARM;
  properties: EnumProperties & { values: [LowBatteryAlarm.ALARM, LowBatteryAlarm.NORMAL] };
};

export type RestoreDefaultDP = DPDefinition<'enum'> & {
  id: DPId.RESTORE_DEFAULT;
  properties: EnumProperties & { values: [RestoreDefault.RESTORE, RestoreDefault.NORMAL] };
};

// 联合类型：所有 DP 类型
export type AnyDP =
  | BatteryPercentageDP
  | VolumeSetDP
  | ChargeStatusDP
  | Switch1DP
  | PlaybackDP
  | ToyIdDP
  | AIConversationDP
  | AIConversationModeDP
  | AIConversationStatusDP
  | LightPercentageDP
  | MaxVolumeSetDP
  | HeadphoneVolumeLimitDP
  | SleepModeDP
  | TimeFormatDP
  | LowBatteryAlarmDP
  | RestoreDefaultDP;

// DP 状态接口
export interface DPState {
  [key: number]: {
    definition: AnyDP;
    value: any;
    lastUpdated: number;
    isOnline: boolean;
  };
}

// DP 操作结果
export interface DPOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

// DP 变化监听器
export type DPChangeListener = (dpId: number, newValue: any, oldValue: any) => void;

// DP 权限检查
export interface DPPermissions {
  canRead: boolean;
  canWrite: boolean;
  canReport: boolean;
}

// 工具函数类型
export interface DPUtils {
  getPermissions(dpId: number): DPPermissions;
  validateValue(dpId: number, value: any): boolean;
  formatValue(dpId: number, value: any): string;
  parseValue(dpId: number, rawValue: any): any;
}

// DP 错误类型
export enum DPErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_VALUE = 'INVALID_VALUE',
  DEVICE_OFFLINE = 'DEVICE_OFFLINE',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN_DP = 'UNKNOWN_DP',
  BRIDGE_ERROR = 'BRIDGE_ERROR',
}

export interface DPError {
  type: DPErrorType;
  message: string;
  dpId?: number;
  originalError?: any;
}

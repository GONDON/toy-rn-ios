/**
 * DP 定义配置
 * 基于 dps.csv 文件的完整 DP 定义配置
 */

import {
  DPId,
  DPTransmissionType,
  AnyDP,
  BatteryPercentageDP,
  VolumeSetDP,
  ChargeStatusDP,
  Switch1DP,
  PlaybackDP,
  ToyIdDP,
  AIConversationDP,
  AIConversationModeDP,
  AIConversationStatusDP,
  LightPercentageDP,
  MaxVolumeSetDP,
  HeadphoneVolumeLimitDP,
  SleepModeDP,
  TimeFormatDP,
  LowBatteryAlarmDP,
  RestoreDefaultDP,
  ChargeStatus,
  AIConversationMode,
  AIConversationStatus,
  TimeFormat,
  LowBatteryAlarm,
  RestoreDefault,
} from '../types/dp';

// DP 定义映射表
export const DP_DEFINITIONS: Record<number, AnyDP> = {
  [DPId.BATTERY_PERCENTAGE]: {
    id: DPId.BATTERY_PERCENTAGE,
    name: '电量',
    identifier: 'battery_percentage',
    transmissionType: 'ro' as DPTransmissionType,
    dataType: 'value',
    properties: {
      range: [0, 100],
      step: 10,
      scale: 0,
      unit: '%',
    },
    remark: '',
  } as BatteryPercentageDP,

  [DPId.VOLUME_SET]: {
    id: DPId.VOLUME_SET,
    name: '音量',
    identifier: 'volume_set',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'value',
    properties: {
      range: [0, 100],
      step: 10,
      scale: 0,
      unit: '%',
    },
    remark: '',
  } as VolumeSetDP,

  [DPId.CHARGE_STATUS]: {
    id: DPId.CHARGE_STATUS,
    name: '充电状态',
    identifier: 'charge_status',
    transmissionType: 'ro' as DPTransmissionType,
    dataType: 'enum',
    properties: {
      values: [ChargeStatus.NONE, ChargeStatus.CHARGING, ChargeStatus.CHARGE_DONE],
    },
    remark: '',
  } as ChargeStatusDP,

  [DPId.SWITCH_1]: {
    id: DPId.SWITCH_1,
    name: '开关',
    identifier: 'switch_1',
    transmissionType: 'ro' as DPTransmissionType,
    dataType: 'bool',
    remark: '只上报，不支持下发',
  } as Switch1DP,

  [DPId.PLAYBACK]: {
    id: DPId.PLAYBACK,
    name: '播放状态',
    identifier: 'playback',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'raw',
    remark: '故事id+播放/暂停状态',
  } as PlaybackDP,

  [DPId.TOY_ID]: {
    id: DPId.TOY_ID,
    name: '公仔id同步',
    identifier: 'toy_id',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'string',
    remark: '开机、设备联网与感应公仔nfc时，需上报公仔id',
  } as ToyIdDP,

  [DPId.AI_CONVERSATION]: {
    id: DPId.AI_CONVERSATION,
    name: 'Ai对话',
    identifier: 'ai_converstation',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'bool',
    remark: '',
  } as AIConversationDP,

  [DPId.AI_CONVERSATION_MODE]: {
    id: DPId.AI_CONVERSATION_MODE,
    name: 'Ai对话模式',
    identifier: 'ai_conversation_mode',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'enum',
    properties: {
      values: [AIConversationMode.CONTINUOUS, AIConversationMode.QA],
    },
    remark: '',
  } as AIConversationModeDP,

  [DPId.AI_CONVERSATION_STATUS]: {
    id: DPId.AI_CONVERSATION_STATUS,
    name: 'Ai对话状态',
    identifier: 'ai_conversation_status',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'enum',
    properties: {
      values: [AIConversationStatus.START, AIConversationStatus.END],
    },
    remark: '',
  } as AIConversationStatusDP,

  [DPId.LIGHT_PERCENTAGE]: {
    id: DPId.LIGHT_PERCENTAGE,
    name: '屏幕亮度',
    identifier: 'light_percentage',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'value',
    properties: {
      range: [0, 7],
      step: 1,
      scale: 0,
      unit: '',
    },
    remark: '',
  } as LightPercentageDP,

  [DPId.MAX_VOLUME_SET]: {
    id: DPId.MAX_VOLUME_SET,
    name: '最大音量',
    identifier: 'max_volume_set',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'value',
    properties: {
      range: [0, 10],
      step: 1,
      scale: 0,
      unit: '',
    },
    remark: '',
  } as MaxVolumeSetDP,

  [DPId.HEADPHONE_VOLUME_LIMIT]: {
    id: DPId.HEADPHONE_VOLUME_LIMIT,
    name: '耳机音量限制',
    identifier: 'headphone_volume_limit',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'value',
    properties: {
      range: [0, 10],
      step: 1,
      scale: 0,
      unit: '',
    },
    remark: '',
  } as HeadphoneVolumeLimitDP,

  [DPId.SLEEP_MODE]: {
    id: DPId.SLEEP_MODE,
    name: '睡眠模式开关',
    identifier: 'sleep_mode',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'bool',
    remark: '',
  } as SleepModeDP,

  [DPId.TIME_FORMAT]: {
    id: DPId.TIME_FORMAT,
    name: '时间显示',
    identifier: 'time_format',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'enum',
    properties: {
      values: [TimeFormat.HOUR_24, TimeFormat.HOUR_12],
    },
    remark: '',
  } as TimeFormatDP,

  [DPId.LOW_BATTERY_ALARM]: {
    id: DPId.LOW_BATTERY_ALARM,
    name: '低电量提醒',
    identifier: 'low_battery_alarm',
    transmissionType: 'rw' as DPTransmissionType,
    dataType: 'enum',
    properties: {
      values: [LowBatteryAlarm.ALARM, LowBatteryAlarm.NORMAL],
    },
    remark: '',
  } as LowBatteryAlarmDP,

  [DPId.RESTORE_DEFAULT]: {
    id: DPId.RESTORE_DEFAULT,
    name: '恢复出厂设置',
    identifier: 'restore_default',
    transmissionType: 'ro' as DPTransmissionType,
    dataType: 'enum',
    properties: {
      values: [RestoreDefault.RESTORE, RestoreDefault.NORMAL],
    },
    remark: '',
  } as RestoreDefaultDP,
};

// 获取 DP 定义
export function getDPDefinition(dpId: number): AnyDP | undefined {
  return DP_DEFINITIONS[dpId];
}

// 获取所有 DP 定义
export function getAllDPDefinitions(): Record<number, AnyDP> {
  return DP_DEFINITIONS;
}

// 根据标识符获取 DP 定义
export function getDPDefinitionByIdentifier(identifier: string): AnyDP | undefined {
  return Object.values(DP_DEFINITIONS).find(dp => dp.identifier === identifier);
}

// 获取可写的 DP 列表
export function getWritableDPs(): AnyDP[] {
  return Object.values(DP_DEFINITIONS).filter(dp => 
    dp.transmissionType === 'rw' || dp.transmissionType === 'wr'
  );
}

// 获取只读的 DP 列表
export function getReadOnlyDPs(): AnyDP[] {
  return Object.values(DP_DEFINITIONS).filter(dp => dp.transmissionType === 'ro');
}

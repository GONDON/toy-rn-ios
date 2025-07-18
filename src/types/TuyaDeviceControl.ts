/**
 * 涂鸦智能设备控制React Native桥接模块类型定义
 * Created by AI Assistant on 2025/7/18
 */

import { NativeModules } from 'react-native';

/**
 * DP指令类型定义
 * key为dpId字符串，value为对应的dpValue
 */
export interface DpsCommand {
  [dpId: string]: string | number | boolean | number[];
}

/**
 * 设备状态信息
 */
export interface DeviceStatus {
  success: boolean;
  deviceId: string;
  name: string;
  isOnline: boolean;
  dps: DpsCommand;
  productId: string;
  uuid: string;
  activeTime: number;
  updateTime: number;
}

/**
 * 设备基本信息
 */
export interface DeviceInfo {
  deviceId: string;
  name: string;
  isOnline: boolean;
  productId: string;
  uuid: string;
  dps: DpsCommand;
}

/**
 * 设备列表响应
 */
export interface DeviceListResponse {
  success: boolean;
  homeId: number;
  devices: DeviceInfo[];
}

/**
 * DP指令下发响应
 */
export interface PublishDpsResponse {
  success: boolean;
  message: string;
  deviceId: string;
  dps: DpsCommand;
}

/**
 * 涂鸦设备控制桥接模块接口
 */
export interface TuyaDeviceControlBridge {
  /**
   * 发布设备DP指令
   * @param deviceId 设备ID
   * @param dps DP指令字典
   * @returns Promise<PublishDpsResponse>
   */
  publishDeviceDps(deviceId: string, dps: DpsCommand): Promise<PublishDpsResponse>;

  /**
   * 获取设备状态
   * @param deviceId 设备ID
   * @returns Promise<DeviceStatus>
   */
  getDeviceStatus(deviceId: string): Promise<DeviceStatus>;

  /**
   * 获取设备列表
   * @param homeId 家庭ID
   * @returns Promise<DeviceListResponse>
   */
  getDeviceList(homeId: number): Promise<DeviceListResponse>;
}

/**
 * 常用DP类型定义
 */
export enum DpType {
  /** 布尔型 */
  BOOLEAN = 'bool',
  /** 数值型 */
  VALUE = 'value',
  /** 枚举型 */
  ENUM = 'enum',
  /** 字符串型 */
  STRING = 'string',
  /** 透传型 */
  RAW = 'raw'
}

/**
 * 常用DP ID定义（根据实际设备功能定义）
 */
export enum CommonDpId {
  /** 开关 */
  SWITCH = '1',
  /** 亮度 */
  BRIGHTNESS = '2',
  /** 颜色 */
  COLOR = '3',
  /** 模式 */
  MODE = '4',
  /** 温度 */
  TEMPERATURE = '5',
  /** 湿度 */
  HUMIDITY = '6'
}

/**
 * 错误代码定义
 */
export enum ErrorCode {
  /** 无效的设备ID */
  INVALID_DEVICE_ID = 'INVALID_DEVICE_ID',
  /** 无效的DP指令 */
  INVALID_DPS = 'INVALID_DPS',
  /** 无效的家庭ID */
  INVALID_HOME_ID = 'INVALID_HOME_ID',
  /** 设备未找到 */
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  /** 设备模型未找到 */
  DEVICE_MODEL_NOT_FOUND = 'DEVICE_MODEL_NOT_FOUND',
  /** 家庭未找到 */
  HOME_NOT_FOUND = 'HOME_NOT_FOUND',
  /** DP指令下发失败 */
  PUBLISH_DPS_FAILED = 'PUBLISH_DPS_FAILED',
  /** 获取设备列表失败 */
  GET_DEVICE_LIST_FAILED = 'GET_DEVICE_LIST_FAILED'
}

/**
 * 获取涂鸦设备控制桥接模块实例
 */
export const TuyaDeviceControl: TuyaDeviceControlBridge = NativeModules.TuyaDeviceControl;

/**
 * 设备控制工具类
 */
export class DeviceControlUtils {
  /**
   * 控制设备开关
   * @param deviceId 设备ID
   * @param isOn 开关状态
   */
  static async controlSwitch(deviceId: string, isOn: boolean): Promise<PublishDpsResponse> {
    return TuyaDeviceControl.publishDeviceDps(deviceId, {
      [CommonDpId.SWITCH]: isOn
    });
  }

  /**
   * 控制设备亮度
   * @param deviceId 设备ID
   * @param brightness 亮度值 (0-1000)
   */
  static async controlBrightness(deviceId: string, brightness: number): Promise<PublishDpsResponse> {
    return TuyaDeviceControl.publishDeviceDps(deviceId, {
      [CommonDpId.BRIGHTNESS]: Math.max(0, Math.min(1000, brightness))
    });
  }

  /**
   * 控制设备模式
   * @param deviceId 设备ID
   * @param mode 模式值
   */
  static async controlMode(deviceId: string, mode: string): Promise<PublishDpsResponse> {
    return TuyaDeviceControl.publishDeviceDps(deviceId, {
      [CommonDpId.MODE]: mode
    });
  }

  /**
   * 检查设备是否在线
   * @param deviceId 设备ID
   */
  static async isDeviceOnline(deviceId: string): Promise<boolean> {
    try {
      const status = await TuyaDeviceControl.getDeviceStatus(deviceId);
      return status.isOnline;
    } catch (error) {
      console.error('检查设备在线状态失败:', error);
      return false;
    }
  }
}

export default TuyaDeviceControl;

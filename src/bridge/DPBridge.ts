/**
 * DP 桥接模块
 * 与 iOS 原生模块的桥接接口，处理 DP 数据的上报和下发
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import {
  DPOperationResult,
  DPError,
  DPErrorType,
  AnyDP,
} from '../types/dp';
import { createDPError, validateDPValue, parseDPValue } from '../utils/dpUtils';
import { getDPDefinition } from '../config/dpDefinitions';

// iOS 原生模块接口定义
interface DPBridgeNativeModule {
  // 发送 DP 数据到设备
  sendDPToDevice(dpId: number, value: any): Promise<boolean>;

  // 批量发送 DP 数据到设备
  sendBatchDPToDevice(dpData: Record<number, any>): Promise<boolean>;

  // 从设备读取 DP 数据
  readDPFromDevice(dpId: number): Promise<any>;

  // 批量读取 DP 数据
  readBatchDPFromDevice(dpIds: number[]): Promise<Record<number, any>>;

  // 同步所有 DP 数据
  syncAllDPFromDevice(): Promise<Record<number, any>>;

  // 检查设备连接状态
  checkDeviceConnection(): Promise<boolean>;

  // 连接设备
  connectDevice(): Promise<boolean>;

  // 断开设备连接
  disconnectDevice(): Promise<boolean>;

  // 获取设备信息
  getDeviceInfo(): Promise<{
    deviceId: string;
    deviceName: string;
    firmwareVersion: string;
    isConnected: boolean;
    uuid?: string;
    productKey?: string;
  }>;

  // 设置设备信息
  setDeviceInfo(deviceId: string, uuid: string, productKey: string): Promise<{
    success: boolean;
    message: string;
  }>;
}

// 模拟实现（用于开发环境和非iOS平台）
const mockImplementation: DPBridgeNativeModule = {
  sendDPToDevice: async () => {
    console.log('[Mock] sendDPToDevice called');
    return true;
  },
  sendBatchDPToDevice: async () => {
    console.log('[Mock] sendBatchDPToDevice called');
    return true;
  },
  readDPFromDevice: async () => {
    console.log('[Mock] readDPFromDevice called');
    return null;
  },
  readBatchDPFromDevice: async () => {
    console.log('[Mock] readBatchDPFromDevice called');
    return {};
  },
  syncAllDPFromDevice: async () => {
    console.log('[Mock] syncAllDPFromDevice called');
    return {};
  },
  checkDeviceConnection: async () => {
    console.log('[Mock] checkDeviceConnection called');
    return false;
  },
  connectDevice: async () => {
    console.log('[Mock] connectDevice called');
    return false;
  },
  disconnectDevice: async () => {
    console.log('[Mock] disconnectDevice called');
    return true;
  },
  getDeviceInfo: async () => {
    console.log('[Mock] getDeviceInfo called');
    return {
      deviceId: 'simulator',
      deviceName: 'Simulator Device',
      firmwareVersion: '1.0.0',
      isConnected: false,
      uuid: 'mock-uuid',
      productKey: 'mock-product-key',
    };
  },
  setDeviceInfo: async () => {
    console.log('[Mock] setDeviceInfo called');
    return {
      success: true,
      message: '模拟设备信息设置成功',
    };
  },
};

// 获取原生模块，如果不存在则使用模拟实现
const DPBridgeNative: DPBridgeNativeModule = (() => {
  console.log('[DPBridge] 检查原生模块可用性...');
  console.log('[DPBridge] Platform.OS:', Platform.OS);
  console.log('[DPBridge] NativeModules.DPBridge:', NativeModules.DPBridge);
  console.log('[DPBridge] 所有可用的原生模块:', Object.keys(NativeModules));

  if (Platform.OS === 'ios' && NativeModules.DPBridge) {
    console.log('[DPBridge] 使用真实的原生模块');
    return NativeModules.DPBridge;
  } else {
    console.warn('[DPBridge] 原生模块不可用，使用模拟实现');
    return mockImplementation;
  }
})();

// 事件发射器
const dpBridgeEventEmitter = (() => {
  if (Platform.OS === 'ios' && NativeModules.DPBridge) {
    return new NativeEventEmitter(NativeModules.DPBridge);
  }
  return null;
})();

// DP 桥接事件类型
export enum DPBridgeEventType {
  DP_VALUE_CHANGED = 'DPValueChanged',
  DEVICE_CONNECTED = 'DeviceConnected',
  DEVICE_DISCONNECTED = 'DeviceDisconnected',
  DP_ERROR = 'DPError',
  SYNC_COMPLETED = 'SyncCompleted',
}

// DP 桥接事件数据
export interface DPBridgeEventData {
  dpId?: number;
  value?: any;
  error?: string;
  deviceInfo?: any;
}

// DP 桥接类
export class DPBridge {
  private static instance: DPBridge;
  private eventListeners: Map<string, Set<(data: DPBridgeEventData) => void>> = new Map();
  private isInitialized = false;

  private constructor() { }

  // 获取单例实例
  static getInstance(): DPBridge {
    if (!DPBridge.instance) {
      DPBridge.instance = new DPBridge();
    }
    return DPBridge.instance;
  }

  // 初始化桥接
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 设置事件监听器
      this.setupEventListeners();

      // 检查设备连接状态
      const isConnected = await this.checkDeviceConnection();
      if (isConnected) {
        this.notifyListeners(DPBridgeEventType.DEVICE_CONNECTED, {});
      }

      this.isInitialized = true;
      console.log('DP Bridge 初始化成功');
    } catch (error) {
      console.error('DP Bridge 初始化失败:', error);
      throw error;
    }
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    if (!dpBridgeEventEmitter) {
      return;
    }

    // DP 值变化事件
    dpBridgeEventEmitter.addListener(
      DPBridgeEventType.DP_VALUE_CHANGED,
      (data: { dpId: number; value: any }) => {
        this.notifyListeners(DPBridgeEventType.DP_VALUE_CHANGED, data);
      }
    );

    // 设备连接事件
    dpBridgeEventEmitter.addListener(
      DPBridgeEventType.DEVICE_CONNECTED,
      (data: any) => {
        this.notifyListeners(DPBridgeEventType.DEVICE_CONNECTED, data);
      }
    );

    // 设备断开事件
    dpBridgeEventEmitter.addListener(
      DPBridgeEventType.DEVICE_DISCONNECTED,
      (data: any) => {
        this.notifyListeners(DPBridgeEventType.DEVICE_DISCONNECTED, data);
      }
    );

    // DP 错误事件
    dpBridgeEventEmitter.addListener(
      DPBridgeEventType.DP_ERROR,
      (data: { dpId: number; error: string }) => {
        this.notifyListeners(DPBridgeEventType.DP_ERROR, data);
      }
    );

    // 同步完成事件
    dpBridgeEventEmitter.addListener(
      DPBridgeEventType.SYNC_COMPLETED,
      (data: any) => {
        this.notifyListeners(DPBridgeEventType.SYNC_COMPLETED, data);
      }
    );
  }

  // 发送 DP 数据到设备
  async sendDPToDevice(dpId: number, value: any): Promise<DPOperationResult> {
    try {
      // 验证 DP 定义
      const definition = getDPDefinition(dpId);
      if (!definition) {
        return {
          success: false,
          error: `未知的 DP ID: ${dpId}`,
        };
      }

      // 检查权限
      if (definition.transmissionType === 'ro') {
        return {
          success: false,
          error: `DP ${dpId} 是只读的，不能下发`,
        };
      }

      // 验证值
      if (!validateDPValue(dpId, value)) {
        return {
          success: false,
          error: `DP ${dpId} 的值无效`,
        };
      }

      // 调用原生模块
      const success = await DPBridgeNative.sendDPToDevice(dpId, value);

      if (success) {
        return { success: true, data: value };
      } else {
        return { success: false, error: '发送失败' };
      }
    } catch (error) {
      console.error(`发送 DP ${dpId} 失败:`, error);
      return {
        success: false,
        error: `发送失败: ${error}`,
      };
    }
  }

  // 批量发送 DP 数据到设备
  async sendBatchDPToDevice(dpData: Record<number, any>): Promise<DPOperationResult[]> {
    const results: DPOperationResult[] = [];

    try {
      // 验证所有 DP 数据
      for (const [dpId, value] of Object.entries(dpData)) {
        const definition = getDPDefinition(Number(dpId));
        if (!definition) {
          results.push({
            success: false,
            error: `未知的 DP ID: ${dpId}`,
          });
          continue;
        }

        if (definition.transmissionType === 'ro') {
          results.push({
            success: false,
            error: `DP ${dpId} 是只读的，不能下发`,
          });
          continue;
        }

        if (!validateDPValue(Number(dpId), value)) {
          results.push({
            success: false,
            error: `DP ${dpId} 的值无效`,
          });
          continue;
        }

        results.push({ success: true });
      }

      // 如果有验证失败的，直接返回
      if (results.some(r => !r.success)) {
        return results;
      }

      // 调用原生模块批量发送
      const success = await DPBridgeNative.sendBatchDPToDevice(dpData);

      if (success) {
        return results.map(() => ({ success: true }));
      } else {
        return results.map(() => ({ success: false, error: '批量发送失败' }));
      }
    } catch (error) {
      console.error('批量发送 DP 失败:', error);
      return results.map(() => ({ success: false, error: `发送失败: ${error}` }));
    }
  }

  // 从设备读取 DP 数据
  async readDPFromDevice(dpId: number): Promise<DPOperationResult> {
    try {
      const definition = getDPDefinition(dpId);
      if (!definition) {
        return {
          success: false,
          error: `未知的 DP ID: ${dpId}`,
        };
      }

      const rawValue = await DPBridgeNative.readDPFromDevice(dpId);
      const parsedValue = parseDPValue(dpId, rawValue);

      return {
        success: true,
        data: parsedValue,
      };
    } catch (error) {
      console.error(`读取 DP ${dpId} 失败:`, error);
      return {
        success: false,
        error: `读取失败: ${error}`,
      };
    }
  }

  // 批量读取 DP 数据
  async readBatchDPFromDevice(dpIds: number[]): Promise<Record<number, DPOperationResult>> {
    const results: Record<number, DPOperationResult> = {};

    try {
      const rawData = await DPBridgeNative.readBatchDPFromDevice(dpIds);

      for (const dpId of dpIds) {
        if (rawData.hasOwnProperty(dpId)) {
          const parsedValue = parseDPValue(dpId, rawData[dpId]);
          results[dpId] = { success: true, data: parsedValue };
        } else {
          results[dpId] = { success: false, error: '未获取到数据' };
        }
      }
    } catch (error) {
      console.error('批量读取 DP 失败:', error);
      for (const dpId of dpIds) {
        results[dpId] = { success: false, error: `读取失败: ${error}` };
      }
    }

    return results;
  }

  // 同步所有 DP 数据
  async syncAllDPFromDevice(): Promise<Record<number, any>> {
    try {
      const rawData = await DPBridgeNative.syncAllDPFromDevice();
      const parsedData: Record<number, any> = {};

      for (const [dpId, rawValue] of Object.entries(rawData)) {
        parsedData[Number(dpId)] = parseDPValue(Number(dpId), rawValue);
      }

      return parsedData;
    } catch (error) {
      console.error('同步所有 DP 失败:', error);
      throw error;
    }
  }

  // 检查设备连接状态
  async checkDeviceConnection(): Promise<boolean> {
    try {
      return await DPBridgeNative.checkDeviceConnection();
    } catch (error) {
      console.error('检查设备连接状态失败:', error);
      return false;
    }
  }

  // 连接设备
  async connectDevice(): Promise<boolean> {
    try {
      return await DPBridgeNative.connectDevice();
    } catch (error) {
      console.error('连接设备失败:', error);
      return false;
    }
  }

  // 断开设备连接
  async disconnectDevice(): Promise<boolean> {
    try {
      return await DPBridgeNative.disconnectDevice();
    } catch (error) {
      console.error('断开设备连接失败:', error);
      return false;
    }
  }

  // 获取设备信息
  async getDeviceInfo() {
    try {
      return await DPBridgeNative.getDeviceInfo();
    } catch (error) {
      console.error('获取设备信息失败:', error);
      return null;
    }
  }

  // 设置设备信息
  async setDeviceInfo(deviceId: string, uuid: string, productKey: string): Promise<DPOperationResult> {
    try {
      const result = await DPBridgeNative.setDeviceInfo(deviceId, uuid, productKey);
      return { success: true, data: result };
    } catch (error) {
      console.error('设置设备信息失败:', error);
      return { success: false, error: `设置失败: ${error}` };
    }
  }

  // 添加事件监听器
  addEventListener(
    eventType: DPBridgeEventType,
    listener: (data: DPBridgeEventData) => void
  ): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }

    this.eventListeners.get(eventType)!.add(listener);

    // 返回取消监听的函数
    return () => {
      this.eventListeners.get(eventType)?.delete(listener);
    };
  }

  // 通知监听器
  private notifyListeners(eventType: DPBridgeEventType, data: DPBridgeEventData): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`DP Bridge 事件监听器执行失败:`, error);
        }
      });
    }
  }

  // 清理资源
  cleanup(): void {
    this.eventListeners.clear();
    this.isInitialized = false;
  }
}

// 导出单例实例
export const dpBridge = DPBridge.getInstance();

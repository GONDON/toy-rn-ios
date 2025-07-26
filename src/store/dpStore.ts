/**
 * DP 状态管理
 * 集中管理所有 DP 数据的状态、缓存和同步
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  DPState,
  DPChangeListener,
  DPOperationResult,
  DPError,
  DPErrorType,
  AnyDP,
} from '../types/dp';
import { getDPDefinition } from '../config/dpDefinitions';
import { validateDPValue, createDPError } from '../utils/dpUtils';

// DP 状态接口
interface DPStoreState {
  // DP 数据状态
  dpState: DPState;

  // 设备连接状态
  isDeviceConnected: boolean;

  // 最后同步时间
  lastSyncTime: number;

  // 错误状态
  errors: Record<number, DPError>;

  // 操作状态
  operations: Record<string, { pending: boolean; error?: string }>;
}

// DP 状态操作接口
interface DPStoreActions {
  // 设置 DP 值
  setDPValue: (dpId: number, value: any) => Promise<DPOperationResult>;

  // 获取 DP 值
  getDPValue: (dpId: number) => any;

  // 批量设置 DP 值
  setBatchDPValues: (values: Record<number, any>) => Promise<DPOperationResult[]>;

  // 更新设备连接状态
  setDeviceConnected: (connected: boolean) => void;

  // 同步所有 DP 数据
  syncAllDPs: () => Promise<void>;

  // 清除错误
  clearError: (dpId: number) => void;

  // 清除所有错误
  clearAllErrors: () => void;

  // 重置状态
  reset: () => void;

  // 初始化 DP 状态
  initializeDPState: (dpId: number, definition: AnyDP, initialValue?: any) => void;
}

// 合并状态和操作
type DPStore = DPStoreState & DPStoreActions;

// 初始状态
const initialState: DPStoreState = {
  dpState: {},
  isDeviceConnected: false,
  lastSyncTime: 0,
  errors: {},
  operations: {},
};

// 创建 DP 状态管理 store
export const useDPStore = create<DPStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // 设置 DP 值
    setDPValue: async (dpId: number, value: any): Promise<DPOperationResult> => {
      const state = get();
      const definition = getDPDefinition(dpId);

      if (!definition) {
        const error = createDPError(
          DPErrorType.UNKNOWN_DP,
          `未知的 DP ID: ${dpId}`,
          dpId
        );
        set(state => ({
          errors: { ...state.errors, [dpId]: error }
        }));
        return { success: false, error: error.message };
      }

      // 检查权限
      if (definition.transmissionType === 'ro') {
        const error = createDPError(
          DPErrorType.PERMISSION_DENIED,
          `DP ${dpId} 是只读的，不能设置值`,
          dpId
        );
        set(state => ({
          errors: { ...state.errors, [dpId]: error }
        }));
        return { success: false, error: error.message };
      }

      // 验证值
      if (!validateDPValue(dpId, value)) {
        const error = createDPError(
          DPErrorType.INVALID_VALUE,
          `DP ${dpId} 的值 ${JSON.stringify(value)} 无效`,
          dpId
        );
        set(state => ({
          errors: { ...state.errors, [dpId]: error }
        }));
        return { success: false, error: error.message };
      }

      // 检查设备连接状态
      if (!state.isDeviceConnected) {
        const error = createDPError(
          DPErrorType.DEVICE_OFFLINE,
          '设备未连接',
          dpId
        );
        set(state => ({
          errors: { ...state.errors, [dpId]: error }
        }));
        return { success: false, error: error.message };
      }

      try {
        // 设置操作状态
        const operationKey = `set_${dpId}`;
        set(state => ({
          operations: { ...state.operations, [operationKey]: { pending: true } }
        }));

        // 获取旧值
        const oldValue = state.dpState[dpId]?.value;

        // 更新本地状态
        set(state => ({
          dpState: {
            ...state.dpState,
            [dpId]: {
              definition,
              value,
              lastUpdated: Date.now(),
              isOnline: true,
            }
          },
          errors: { ...state.errors, [dpId]: undefined } as any,
        }));

        // 注意：实际的桥接调用在 useDPBridge Hook 中处理
        // 这里只是更新本地状态，桥接调用由上层处理
        await new Promise(resolve => setTimeout(resolve, 10));

        // 清除操作状态
        set(state => ({
          operations: { ...state.operations, [operationKey]: { pending: false } }
        }));

        return { success: true, data: value };
      } catch (error) {
        const dpError = createDPError(
          DPErrorType.BRIDGE_ERROR,
          `设置 DP ${dpId} 失败: ${error}`,
          dpId,
          error
        );

        set(state => ({
          errors: { ...state.errors, [dpId]: dpError },
          operations: { ...state.operations, [`set_${dpId}`]: { pending: false, error: dpError.message } }
        }));

        return { success: false, error: dpError.message };
      }
    },

    // 获取 DP 值
    getDPValue: (dpId: number) => {
      const state = get();
      return state.dpState[dpId]?.value;
    },

    // 批量设置 DP 值
    setBatchDPValues: async (values: Record<number, any>): Promise<DPOperationResult[]> => {
      const results: DPOperationResult[] = [];

      for (const [dpId, value] of Object.entries(values)) {
        const result = await get().setDPValue(Number(dpId), value);
        results.push(result);
      }

      return results;
    },

    // 更新设备连接状态
    setDeviceConnected: (connected: boolean) => {
      set(state => ({
        isDeviceConnected: connected,
        lastSyncTime: connected ? Date.now() : state.lastSyncTime,
      }));
    },

    // 同步所有 DP 数据
    syncAllDPs: async () => {
      // 这里应该从设备同步所有 DP 数据
      // 暂时模拟
      set(state => ({
        lastSyncTime: Date.now(),
      }));
    },

    // 清除错误
    clearError: (dpId: number) => {
      set(state => ({
        errors: { ...state.errors, [dpId]: undefined } as any,
      }));
    },

    // 清除所有错误
    clearAllErrors: () => {
      set({ errors: {} });
    },

    // 重置状态
    reset: () => {
      set(initialState);
    },

    // 初始化 DP 状态
    initializeDPState: (dpId: number, definition: AnyDP, initialValue?: any) => {
      set(state => ({
        dpState: {
          ...state.dpState,
          [dpId]: {
            definition,
            value: initialValue,
            lastUpdated: Date.now(),
            isOnline: false,
          }
        }
      }));
    },
  }))
);

// DP 变化监听器管理
class DPChangeListenerManager {
  private listeners: Map<number, Set<DPChangeListener>> = new Map();

  // 添加监听器
  addListener(dpId: number, listener: DPChangeListener): () => void {
    if (!this.listeners.has(dpId)) {
      this.listeners.set(dpId, new Set());
    }

    this.listeners.get(dpId)!.add(listener);

    // 返回取消监听的函数
    return () => {
      this.listeners.get(dpId)?.delete(listener);
      if (this.listeners.get(dpId)?.size === 0) {
        this.listeners.delete(dpId);
      }
    };
  }

  // 触发监听器
  notifyListeners(dpId: number, newValue: any, oldValue: any) {
    const listeners = this.listeners.get(dpId);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(dpId, newValue, oldValue);
        } catch (error) {
          console.error(`DP ${dpId} 监听器执行失败:`, error);
        }
      });
    }
  }

  // 清除所有监听器
  clear() {
    this.listeners.clear();
  }
}

// 全局监听器管理器
export const dpChangeListenerManager = new DPChangeListenerManager();

// 监听 DP 值变化
useDPStore.subscribe(
  (state) => state.dpState,
  (newDPState, prevDPState) => {
    // 检查每个 DP 的值变化
    Object.keys(newDPState).forEach(dpIdStr => {
      const dpId = Number(dpIdStr);
      const newValue = newDPState[dpId]?.value;
      const oldValue = prevDPState[dpId]?.value;

      if (newValue !== oldValue) {
        dpChangeListenerManager.notifyListeners(dpId, newValue, oldValue);
      }
    });
  }
);

// 便捷的 Hook 函数
export function useDPValue(dpId: number) {
  return useDPStore(state => state.dpState[dpId]?.value);
}

export function useDPState(dpId: number) {
  return useDPStore(state => state.dpState[dpId]);
}

export function useDeviceConnected() {
  return useDPStore(state => state.isDeviceConnected);
}

export function useDPError(dpId: number) {
  return useDPStore(state => state.errors[dpId]);
}

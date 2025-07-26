/**
 * DP 管理 Hook
 * 提供 DP 数据管理的便捷接口
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  useDPStore,
  useDPValue,
  useDPState,
  useDeviceConnected,
  useDPError,
  dpChangeListenerManager,
} from '../store/dpStore';
import {
  DPId,
  DPChangeListener,
  DPOperationResult,
} from '../types/dp';
import { getAllDPDefinitions } from '../config/dpDefinitions';

// DP 管理 Hook
export function useDPManager() {
  const {
    setDPValue,
    getDPValue,
    setBatchDPValues,
    setDeviceConnected,
    syncAllDPs,
    clearError,
    clearAllErrors,
    reset,
    initializeDPState,
  } = useDPStore();

  const isDeviceConnected = useDeviceConnected();

  // 初始化所有 DP 定义
  const initializeAllDPs = useCallback(() => {
    const definitions = getAllDPDefinitions();
    Object.entries(definitions).forEach(([dpId, definition]) => {
      initializeDPState(Number(dpId), definition);
    });
  }, [initializeDPState]);

  // 组件挂载时初始化
  useEffect(() => {
    initializeAllDPs();
  }, [initializeAllDPs]);

  return {
    // 状态
    isDeviceConnected,
    
    // 操作
    setDPValue,
    getDPValue,
    setBatchDPValues,
    setDeviceConnected,
    syncAllDPs,
    clearError,
    clearAllErrors,
    reset,
    initializeAllDPs,
  };
}

// 单个 DP 管理 Hook
export function useDP(dpId: number) {
  const value = useDPValue(dpId);
  const state = useDPState(dpId);
  const error = useDPError(dpId);
  const { setDPValue, clearError } = useDPStore();

  const setValue = useCallback(
    async (newValue: any): Promise<DPOperationResult> => {
      return await setDPValue(dpId, newValue);
    },
    [dpId, setDPValue]
  );

  const clearDPError = useCallback(() => {
    clearError(dpId);
  }, [dpId, clearError]);

  return {
    value,
    state,
    error,
    setValue,
    clearError: clearDPError,
    isOnline: state?.isOnline ?? false,
    lastUpdated: state?.lastUpdated ?? 0,
  };
}

// DP 变化监听 Hook
export function useDPChangeListener(dpId: number, listener: DPChangeListener) {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    const wrappedListener: DPChangeListener = (dpId, newValue, oldValue) => {
      listenerRef.current(dpId, newValue, oldValue);
    };

    const unsubscribe = dpChangeListenerManager.addListener(dpId, wrappedListener);
    return unsubscribe;
  }, [dpId]);
}

// 批量 DP 管理 Hook
export function useBatchDP(dpIds: number[]) {
  const values = dpIds.reduce((acc, dpId) => {
    acc[dpId] = useDPValue(dpId);
    return acc;
  }, {} as Record<number, any>);

  const errors = dpIds.reduce((acc, dpId) => {
    const error = useDPError(dpId);
    if (error) {
      acc[dpId] = error;
    }
    return acc;
  }, {} as Record<number, any>);

  const { setBatchDPValues } = useDPStore();

  const setValues = useCallback(
    async (newValues: Record<number, any>): Promise<DPOperationResult[]> => {
      return await setBatchDPValues(newValues);
    },
    [setBatchDPValues]
  );

  return {
    values,
    errors,
    setValues,
    hasErrors: Object.keys(errors).length > 0,
  };
}

// 设备状态管理 Hook
export function useDeviceStatus() {
  const isConnected = useDeviceConnected();
  const { setDeviceConnected, syncAllDPs } = useDPStore();

  const connect = useCallback(() => {
    setDeviceConnected(true);
  }, [setDeviceConnected]);

  const disconnect = useCallback(() => {
    setDeviceConnected(false);
  }, [setDeviceConnected]);

  const sync = useCallback(async () => {
    await syncAllDPs();
  }, [syncAllDPs]);

  return {
    isConnected,
    connect,
    disconnect,
    sync,
  };
}

// 常用 DP 的便捷 Hook
export function useBatteryPercentage() {
  return useDP(DPId.BATTERY_PERCENTAGE);
}

export function useVolumeSet() {
  return useDP(DPId.VOLUME_SET);
}

export function useChargeStatus() {
  return useDP(DPId.CHARGE_STATUS);
}

export function useAIConversation() {
  return useDP(DPId.AI_CONVERSATION);
}

export function useAIConversationMode() {
  return useDP(DPId.AI_CONVERSATION_MODE);
}

export function useLightPercentage() {
  return useDP(DPId.LIGHT_PERCENTAGE);
}

export function useMaxVolumeSet() {
  return useDP(DPId.MAX_VOLUME_SET);
}

export function useHeadphoneVolumeLimit() {
  return useDP(DPId.HEADPHONE_VOLUME_LIMIT);
}

export function useSleepMode() {
  return useDP(DPId.SLEEP_MODE);
}

export function useTimeFormat() {
  return useDP(DPId.TIME_FORMAT);
}

export function useLowBatteryAlarm() {
  return useDP(DPId.LOW_BATTERY_ALARM);
}

// 设置面板相关的 DP 组合 Hook
export function useSettingsPanelDPs() {
  const battery = useBatteryPercentage();
  const volume = useVolumeSet();
  const chargeStatus = useChargeStatus();
  const aiConversation = useAIConversation();
  const aiConversationMode = useAIConversationMode();
  const brightness = useLightPercentage();
  const maxVolume = useMaxVolumeSet();
  const headphoneVolumeLimit = useHeadphoneVolumeLimit();
  const timeFormat = useTimeFormat();
  const lowBatteryAlarm = useLowBatteryAlarm();

  return {
    battery,
    volume,
    chargeStatus,
    aiConversation,
    aiConversationMode,
    brightness,
    maxVolume,
    headphoneVolumeLimit,
    timeFormat,
    lowBatteryAlarm,
  };
}

// 哄睡面板相关的 DP 组合 Hook
export function useSleepPanelDPs() {
  const sleepMode = useSleepMode();
  const volume = useVolumeSet();
  const brightness = useLightPercentage();

  return {
    sleepMode,
    volume,
    brightness,
  };
}

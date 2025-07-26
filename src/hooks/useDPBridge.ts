/**
 * DP 桥接 Hook
 * 集成 DP 状态管理和原生桥接
 */

import { useEffect, useCallback, useRef } from 'react';
import { useDPStore } from '../store/dpStore';
import { dpBridge, DPBridgeEventType, DPBridgeEventData } from '../bridge/DPBridge';
import { DPId } from '../types/dp';
import { getAllDPDefinitions } from '../config/dpDefinitions';

// DP 桥接管理 Hook
export function useDPBridge() {
  const {
    setDPValue,
    setDeviceConnected,
    syncAllDPs,
    initializeDPState,
    dpState,
  } = useDPStore();

  const isInitialized = useRef(false);

  // 初始化桥接
  const initializeBridge = useCallback(async () => {
    if (isInitialized.current) {
      return;
    }

    try {
      await dpBridge.initialize();
      isInitialized.current = true;
      console.log('DP 桥接初始化成功');

      // 检查设备连接状态
      const isConnected = await dpBridge.checkDeviceConnection();
      setDeviceConnected(isConnected);

      // 如果设备已连接，同步所有 DP 数据
      if (isConnected) {
        await syncAllDPsFromDevice();
      }
    } catch (error) {
      console.error('DP 桥接初始化失败:', error);
    }
  }, [setDeviceConnected]);

  // 从设备同步所有 DP 数据
  const syncAllDPsFromDevice = useCallback(async () => {
    try {
      const dpData = await dpBridge.syncAllDPFromDevice();

      // 更新状态管理中的数据
      for (const [dpId, value] of Object.entries(dpData)) {
        const dpIdNum = Number(dpId);
        const definition = getAllDPDefinitions()[dpIdNum];

        if (definition) {
          // 直接更新状态，不通过 setDPValue（避免重复发送到设备）
          initializeDPState(dpIdNum, definition, value);
        }
      }

      console.log('从设备同步 DP 数据成功:', dpData);
    } catch (error) {
      console.error('从设备同步 DP 数据失败:', error);
    }
  }, [initializeDPState]);

  // 连接设备
  const connectDevice = useCallback(async (): Promise<boolean> => {
    try {
      const success = await dpBridge.connectDevice();
      setDeviceConnected(success);

      if (success) {
        // 连接成功后同步数据
        await syncAllDPsFromDevice();
      }

      return success;
    } catch (error) {
      console.error('连接设备失败:', error);
      return false;
    }
  }, [setDeviceConnected, syncAllDPsFromDevice]);

  // 断开设备连接
  const disconnectDevice = useCallback(async (): Promise<boolean> => {
    try {
      const success = await dpBridge.disconnectDevice();
      setDeviceConnected(false);
      return success;
    } catch (error) {
      console.error('断开设备连接失败:', error);
      return false;
    }
  }, [setDeviceConnected]);

  // 获取设备信息
  const getDeviceInfo = useCallback(async () => {
    try {
      return await dpBridge.getDeviceInfo();
    } catch (error) {
      console.error('获取设备信息失败:', error);
      return null;
    }
  }, []);

  // 设置事件监听器
  useEffect(() => {
    // DP 值变化监听器
    const unsubscribeDPValueChanged = dpBridge.addEventListener(
      DPBridgeEventType.DP_VALUE_CHANGED,
      (data: DPBridgeEventData) => {
        if (data.dpId !== undefined && data.value !== undefined) {
          const definition = getAllDPDefinitions()[data.dpId];
          if (definition) {
            // 设备上报的数据，直接更新状态
            initializeDPState(data.dpId, definition, data.value);
          }
        }
      }
    );

    // 设备连接监听器
    const unsubscribeDeviceConnected = dpBridge.addEventListener(
      DPBridgeEventType.DEVICE_CONNECTED,
      async (data: DPBridgeEventData) => {
        console.log('设备已连接:', data);
        setDeviceConnected(true);
        // 设备连接后同步数据
        await syncAllDPsFromDevice();
      }
    );

    // 设备断开监听器
    const unsubscribeDeviceDisconnected = dpBridge.addEventListener(
      DPBridgeEventType.DEVICE_DISCONNECTED,
      (data: DPBridgeEventData) => {
        console.log('设备已断开:', data);
        setDeviceConnected(false);
      }
    );

    // DP 错误监听器
    const unsubscribeDPError = dpBridge.addEventListener(
      DPBridgeEventType.DP_ERROR,
      (data: DPBridgeEventData) => {
        console.error('DP 错误:', data);
        // 这里可以添加错误处理逻辑
      }
    );

    // 同步完成监听器
    const unsubscribeSyncCompleted = dpBridge.addEventListener(
      DPBridgeEventType.SYNC_COMPLETED,
      (data: DPBridgeEventData) => {
        console.log('DP 同步完成:', data);
      }
    );

    return () => {
      unsubscribeDPValueChanged();
      unsubscribeDeviceConnected();
      unsubscribeDeviceDisconnected();
      unsubscribeDPError();
      unsubscribeSyncCompleted();
    };
  }, [setDeviceConnected, syncAllDPsFromDevice, initializeDPState]);

  // 组件挂载时初始化
  useEffect(() => {
    initializeBridge();

    return () => {
      // 组件卸载时清理资源
      dpBridge.cleanup();
      isInitialized.current = false;
    };
  }, [initializeBridge]);

  return {
    initializeBridge,
    connectDevice,
    disconnectDevice,
    getDeviceInfo,
    syncAllDPsFromDevice,
  };
}

// 重写 DP 状态管理的 setDPValue 方法，集成桥接
export function useIntegratedDPStore() {
  const store = useDPStore();

  // 重写 setDPValue 方法，集成桥接
  const setDPValue = useCallback(
    async (dpId: number, value: any) => {
      try {
        // 先通过桥接发送到设备
        const result = await dpBridge.sendDPToDevice(dpId, value);

        if (result.success) {
          // 发送成功后更新本地状态
          return await store.setDPValue(dpId, value);
        } else {
          // 发送失败，返回错误
          return result;
        }
      } catch (error) {
        console.error(`设置 DP ${dpId} 失败:`, error);
        return {
          success: false,
          error: `设置失败: ${error}`,
        };
      }
    },
    [store]
  );

  // 重写批量设置方法
  const setBatchDPValues = useCallback(
    async (values: Record<number, any>) => {
      try {
        // 先通过桥接批量发送到设备
        const results = await dpBridge.sendBatchDPToDevice(values);

        // 检查是否所有发送都成功
        const allSuccess = results.every(r => r.success);

        if (allSuccess) {
          // 全部成功后更新本地状态
          return await store.setBatchDPValues(values);
        } else {
          // 有失败的，返回结果
          return results;
        }
      } catch (error) {
        console.error('批量设置 DP 失败:', error);
        return Object.keys(values).map(() => ({
          success: false,
          error: `设置失败: ${error}`,
        }));
      }
    },
    [store]
  );

  return {
    ...store,
    setDPValue,
    setBatchDPValues,
  };
}

// 设备状态监控 Hook
export function useDeviceMonitor() {
  const { setDeviceConnected } = useDPStore();

  // 定期检查设备连接状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await dpBridge.checkDeviceConnection();
        setDeviceConnected(isConnected);
      } catch (error) {
        console.error('检查设备连接状态失败:', error);
        setDeviceConnected(false);
      }
    };

    // 立即检查一次
    checkConnection();

    // 每 5 秒检查一次
    const interval = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [setDeviceConnected]);
}

// 自动重连 Hook
export function useAutoReconnect() {
  const { isDeviceConnected } = useDPStore();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = useRef<NodeJS.Timeout | null>(null);

  const attemptReconnect = useCallback(async () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连');
      return;
    }

    try {
      reconnectAttempts.current++;
      console.log(`尝试重连设备 (${reconnectAttempts.current}/${maxReconnectAttempts})`);

      const success = await dpBridge.connectDevice();

      if (success) {
        console.log('设备重连成功');
        reconnectAttempts.current = 0;

        if (reconnectInterval.current) {
          clearInterval(reconnectInterval.current);
          reconnectInterval.current = null;
        }
      }
    } catch (error) {
      console.error('设备重连失败:', error);
    }
  }, []);

  useEffect(() => {
    if (!isDeviceConnected && reconnectAttempts.current < maxReconnectAttempts) {
      // 设备断开且未达到最大重连次数，开始重连
      if (!reconnectInterval.current) {
        reconnectInterval.current = setInterval(attemptReconnect, 3000);
      }
    } else if (isDeviceConnected) {
      // 设备已连接，重置重连计数器
      reconnectAttempts.current = 0;

      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
        reconnectInterval.current = null;
      }
    }

    return () => {
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
        reconnectInterval.current = null;
      }
    };
  }, [isDeviceConnected, attemptReconnect]);
}

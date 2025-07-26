/**
 * 设备连接管理Hook
 * 处理设备连接状态检查和自动连接逻辑
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { dpBridge } from '../bridge/DPBridge';
import { useDPStore } from '../store/dpStore';

export interface DeviceConnectionParams {
  deviceId: string;
  deviceName: string;
  uuid?: string;
  productId?: string;
  isOnline?: boolean;
  dps?: Record<string, any>;
}

export interface ConnectionStatus {
  isConnecting: boolean;
  isConnected: boolean;
  connectionError: string | null;
  lastConnectionTime: number | null;
}

export function useDeviceConnection(deviceParams?: DeviceConnectionParams) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnecting: false,
    isConnected: false,
    connectionError: null,
    lastConnectionTime: null,
  });

  const { setDeviceConnected, syncAllDPs, initializeDPState } = useDPStore();
  const connectionAttempts = useRef(0);
  const maxRetries = 3;
  const retryDelay = 2000; // 2秒

  // 更新连接状态
  const updateConnectionStatus = useCallback((updates: Partial<ConnectionStatus>) => {
    setConnectionStatus(prev => ({ ...prev, ...updates }));
  }, []);

  // 检查设备在线状态
  const checkDeviceOnlineStatus = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      console.log(`🔍 [DeviceConnection] 检查设备在线状态: ${deviceId}`);
      
      // 通过DPBridge检查设备连接状态
      const isConnected = await dpBridge.checkDeviceConnection();
      console.log(`📡 [DeviceConnection] 设备连接状态: ${isConnected}`);
      
      return isConnected;
    } catch (error) {
      console.error('❌ [DeviceConnection] 检查设备状态失败:', error);
      return false;
    }
  }, []);

  // 连接设备
  const connectToDevice = useCallback(async (
    deviceId: string, 
    uuid?: string, 
    productKey?: string
  ): Promise<boolean> => {
    try {
      console.log(`🔗 [DeviceConnection] 开始连接设备: ${deviceId}`);
      updateConnectionStatus({ isConnecting: true, connectionError: null });

      // 1. 设置设备信息
      const setInfoResult = await dpBridge.setDeviceInfo(
        deviceId, 
        uuid || '', 
        productKey || ''
      );

      if (!setInfoResult.success) {
        throw new Error(`设置设备信息失败: ${setInfoResult.error}`);
      }

      // 2. 连接设备
      const connectResult = await dpBridge.connectDevice();
      
      if (connectResult) {
        console.log('✅ [DeviceConnection] 设备连接成功');
        
        // 3. 同步DP数据
        try {
          const dpData = await dpBridge.syncAllDPFromDevice();
          console.log('📊 [DeviceConnection] DP数据同步成功:', Object.keys(dpData).length);
          
          // 更新本地状态
          setDeviceConnected(true);
          
          // 初始化DP状态（如果有数据）
          if (dpData && Object.keys(dpData).length > 0) {
            // 这里可以根据需要初始化特定的DP状态
            console.log('🔄 [DeviceConnection] 初始化DP状态');
          }
        } catch (syncError) {
          console.warn('⚠️ [DeviceConnection] DP数据同步失败，但设备已连接:', syncError);
        }

        updateConnectionStatus({
          isConnecting: false,
          isConnected: true,
          connectionError: null,
          lastConnectionTime: Date.now(),
        });

        connectionAttempts.current = 0;
        return true;
      } else {
        throw new Error('设备连接失败');
      }
    } catch (error) {
      console.error('❌ [DeviceConnection] 连接设备失败:', error);
      
      updateConnectionStatus({
        isConnecting: false,
        isConnected: false,
        connectionError: error instanceof Error ? error.message : '连接失败',
      });

      return false;
    }
  }, [updateConnectionStatus, setDeviceConnected]);

  // 重试连接
  const retryConnection = useCallback(async (
    deviceId: string, 
    uuid?: string, 
    productKey?: string
  ): Promise<boolean> => {
    if (connectionAttempts.current >= maxRetries) {
      console.log(`🚫 [DeviceConnection] 达到最大重试次数 (${maxRetries})，停止重试`);
      updateConnectionStatus({
        connectionError: `连接失败，已重试 ${maxRetries} 次`,
      });
      return false;
    }

    connectionAttempts.current++;
    console.log(`🔄 [DeviceConnection] 第 ${connectionAttempts.current} 次重试连接`);

    // 等待一段时间后重试
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    return await connectToDevice(deviceId, uuid, productKey);
  }, [connectToDevice, updateConnectionStatus]);

  // 自动连接设备
  const autoConnectDevice = useCallback(async (params: DeviceConnectionParams): Promise<boolean> => {
    const { deviceId, uuid, productId, isOnline } = params;
    
    console.log(`🚀 [DeviceConnection] 开始自动连接流程: ${params.deviceName}`);
    console.log(`📋 [DeviceConnection] 设备参数:`, {
      deviceId,
      uuid,
      productId,
      isOnline,
    });

    // 1. 首先检查设备是否在线（如果有在线状态信息）
    if (isOnline === false) {
      console.log('📴 [DeviceConnection] 设备显示为离线状态，尝试连接');
    }

    // 2. 检查当前连接状态
    const currentlyConnected = await checkDeviceOnlineStatus(deviceId);
    
    if (currentlyConnected) {
      console.log('✅ [DeviceConnection] 设备已连接，无需重新连接');
      updateConnectionStatus({
        isConnected: true,
        connectionError: null,
        lastConnectionTime: Date.now(),
      });
      setDeviceConnected(true);
      return true;
    }

    // 3. 设备未连接，开始连接流程
    console.log('🔌 [DeviceConnection] 设备未连接，开始连接...');
    
    let success = await connectToDevice(deviceId, uuid, productId);
    
    // 4. 如果连接失败，进行重试
    while (!success && connectionAttempts.current < maxRetries) {
      console.log(`⏳ [DeviceConnection] 连接失败，准备重试...`);
      success = await retryConnection(deviceId, uuid, productId);
    }

    if (success) {
      console.log('🎉 [DeviceConnection] 设备连接成功！');
    } else {
      console.log('💔 [DeviceConnection] 设备连接最终失败');
    }

    return success;
  }, [checkDeviceOnlineStatus, connectToDevice, retryConnection, updateConnectionStatus, setDeviceConnected]);

  // 断开设备连接
  const disconnectDevice = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔌 [DeviceConnection] 断开设备连接');
      
      const result = await dpBridge.disconnectDevice();
      
      if (result) {
        updateConnectionStatus({
          isConnected: false,
          connectionError: null,
        });
        setDeviceConnected(false);
        console.log('✅ [DeviceConnection] 设备断开成功');
      }
      
      return result;
    } catch (error) {
      console.error('❌ [DeviceConnection] 断开设备失败:', error);
      return false;
    }
  }, [updateConnectionStatus, setDeviceConnected]);

  // 自动连接效果
  useEffect(() => {
    if (deviceParams && deviceParams.deviceId) {
      console.log('🎯 [DeviceConnection] 检测到设备参数，开始自动连接');
      autoConnectDevice(deviceParams);
    }
  }, [deviceParams?.deviceId]); // 只在deviceId变化时触发

  // 监听DP桥接事件
  useEffect(() => {
    const unsubscribeConnected = dpBridge.addEventListener('DeviceConnected', (data) => {
      console.log('📡 [DeviceConnection] 收到设备连接事件:', data);
      updateConnectionStatus({
        isConnected: true,
        connectionError: null,
        lastConnectionTime: Date.now(),
      });
    });

    const unsubscribeDisconnected = dpBridge.addEventListener('DeviceDisconnected', (data) => {
      console.log('📡 [DeviceConnection] 收到设备断开事件:', data);
      updateConnectionStatus({
        isConnected: false,
        connectionError: data.error || null,
      });
    });

    const unsubscribeError = dpBridge.addEventListener('DPError', (data) => {
      console.log('📡 [DeviceConnection] 收到DP错误事件:', data);
      if (data.type === 'CONNECTION_ERROR') {
        updateConnectionStatus({
          connectionError: data.error,
        });
      }
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
    };
  }, [updateConnectionStatus]);

  return {
    // 状态
    connectionStatus,
    
    // 方法
    autoConnectDevice,
    connectToDevice,
    disconnectDevice,
    checkDeviceOnlineStatus,
    
    // 便捷属性
    isConnecting: connectionStatus.isConnecting,
    isConnected: connectionStatus.isConnected,
    connectionError: connectionStatus.connectionError,
  };
}

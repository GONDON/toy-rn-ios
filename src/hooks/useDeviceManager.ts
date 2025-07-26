/**
 * 设备管理 Hook
 * 管理设备连接信息和状态
 */

import { useEffect, useCallback, useState } from 'react';
import { NativeModules, Platform } from 'react-native';
import { useDPStore } from '../store/dpStore';
import { dpBridge } from '../bridge/DPBridge';

// 涂鸦设备控制模块
const TuyaDeviceControl = NativeModules.TuyaDeviceControl;

// 设备信息接口
export interface DeviceInfo {
  deviceId: string;
  uuid: string;
  productKey: string;
  name: string;
  isOnline: boolean;
}

// 设备管理 Hook
export function useDeviceManager() {
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);
  const [deviceList, setDeviceList] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { setDeviceConnected } = useDPStore();

  // 获取设备列表
  const getDeviceList = useCallback(async (homeId: number): Promise<DeviceInfo[]> => {
    try {
      setIsLoading(true);

      if (!TuyaDeviceControl) {
        console.warn('[DeviceManager] TuyaDeviceControl 模块不可用');
        return [];
      }

      const response = await TuyaDeviceControl.getDeviceList(homeId);

      if (response.success && response.devices) {
        const devices: DeviceInfo[] = response.devices.map((device: any) => ({
          deviceId: device.deviceId,
          uuid: device.uuid,
          productKey: device.productId, // 注意：这里使用 productId 作为 productKey
          name: device.name,
          isOnline: device.isOnline,
        }));

        setDeviceList(devices);
        console.log('[DeviceManager] 获取设备列表成功:', devices.length);
        return devices;
      } else {
        console.error('[DeviceManager] 获取设备列表失败:', response);
        return [];
      }
    } catch (error) {
      console.error('[DeviceManager] 获取设备列表异常:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 设置当前设备
  const setCurrentDeviceInfo = useCallback(async (device: DeviceInfo): Promise<boolean> => {
    try {
      console.log('[DeviceManager] 设置当前设备:', device);

      // 先设置 DPBridge 的设备信息
      const result = await dpBridge.setDeviceInfo(device.deviceId, device.uuid, device.productKey);

      if (result.success) {
        setCurrentDevice(device);
        console.log('[DeviceManager] 设备信息设置成功');
        return true;
      } else {
        console.error('[DeviceManager] 设备信息设置失败:', result);
        return false;
      }
    } catch (error) {
      console.error('[DeviceManager] 设置设备信息异常:', error);
      return false;
    }
  }, []);

  // 连接设备
  const connectDevice = useCallback(async (device?: DeviceInfo): Promise<boolean> => {
    try {
      const targetDevice = device || currentDevice;

      if (!targetDevice) {
        console.error('[DeviceManager] 没有可连接的设备');
        return false;
      }

      console.log('[DeviceManager] 开始连接设备:', targetDevice.name);

      // 先设置设备信息
      const infoSet = await setCurrentDeviceInfo(targetDevice);
      if (!infoSet) {
        return false;
      }

      // 然后连接设备
      const connected = await dpBridge.connectDevice();

      if (connected) {
        setDeviceConnected(true);
        console.log('[DeviceManager] 设备连接成功');
        return true;
      } else {
        console.error('[DeviceManager] 设备连接失败');
        return false;
      }
    } catch (error) {
      console.error('[DeviceManager] 连接设备异常:', error);
      return false;
    }
  }, [currentDevice, setCurrentDeviceInfo, setDeviceConnected]);

  // 断开设备连接
  const disconnectDevice = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[DeviceManager] 断开设备连接');

      const result = await dpBridge.disconnectDevice();
      setDeviceConnected(false);

      console.log('[DeviceManager] 设备断开连接成功');
      return result;
    } catch (error) {
      console.error('[DeviceManager] 断开设备连接异常:', error);
      return false;
    }
  }, [setDeviceConnected]);

  // 获取设备状态
  const getDeviceStatus = useCallback(async (deviceId: string) => {
    try {
      if (!TuyaDeviceControl) {
        console.warn('[DeviceManager] TuyaDeviceControl 模块不可用');
        return null;
      }

      const response = await TuyaDeviceControl.getDeviceStatus(deviceId);

      if (response.success) {
        console.log('[DeviceManager] 获取设备状态成功:', response);
        return response;
      } else {
        console.error('[DeviceManager] 获取设备状态失败:', response);
        return null;
      }
    } catch (error) {
      console.error('[DeviceManager] 获取设备状态异常:', error);
      return null;
    }
  }, []);

  // 自动连接第一个在线设备
  const autoConnectFirstOnlineDevice = useCallback(async (homeId: number): Promise<boolean> => {
    try {
      const devices = await getDeviceList(homeId);
      const onlineDevice = devices.find(device => device.isOnline);

      if (onlineDevice) {
        console.log('[DeviceManager] 找到在线设备，自动连接:', onlineDevice.name);
        return await connectDevice(onlineDevice);
      } else {
        console.log('[DeviceManager] 没有找到在线设备');
        return false;
      }
    } catch (error) {
      console.error('[DeviceManager] 自动连接设备异常:', error);
      return false;
    }
  }, [getDeviceList, connectDevice]);

  // 刷新当前设备状态
  const refreshCurrentDeviceStatus = useCallback(async () => {
    if (currentDevice) {
      const status = await getDeviceStatus(currentDevice.deviceId);
      if (status) {
        const updatedDevice = {
          ...currentDevice,
          isOnline: status.isOnline,
        };
        setCurrentDevice(updatedDevice);
        setDeviceConnected(status.isOnline);
      }
    }
  }, [currentDevice, getDeviceStatus, setDeviceConnected]);

  // 定期刷新设备状态
  useEffect(() => {
    if (currentDevice) {
      const interval = setInterval(refreshCurrentDeviceStatus, 10000); // 每10秒刷新一次
      return () => clearInterval(interval);
    }
  }, [currentDevice, refreshCurrentDeviceStatus]);

  return {
    // 状态
    currentDevice,
    deviceList,
    isLoading,

    // 方法
    getDeviceList,
    setCurrentDeviceInfo,
    connectDevice,
    disconnectDevice,
    getDeviceStatus,
    autoConnectFirstOnlineDevice,
    refreshCurrentDeviceStatus,
  };
}

// 便捷的设备连接 Hook
export function useAutoDeviceConnection(homeId?: number) {
  const deviceManager = useDeviceManager();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (homeId && !isInitialized) {
      console.log('[AutoDeviceConnection] 开始自动连接设备');

      deviceManager.autoConnectFirstOnlineDevice(homeId)
        .then(connected => {
          console.log('[AutoDeviceConnection] 自动连接结果:', connected);
          setIsInitialized(true);
        })
        .catch(error => {
          console.error('[AutoDeviceConnection] 自动连接失败:', error);
          setIsInitialized(true);
        });
    }
  }, [homeId, isInitialized, deviceManager]);

  return {
    ...deviceManager,
    isInitialized,
  };
}

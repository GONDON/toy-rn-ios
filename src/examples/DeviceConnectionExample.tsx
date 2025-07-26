/**
 * 设备连接使用示例
 * 展示如何使用新的设备管理功能
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useDeviceManager, useAutoDeviceConnection } from '../hooks/useDeviceManager';
import { useDPManager } from '../hooks/useDPManager';

interface DeviceConnectionExampleProps {
  homeId?: number; // 涂鸦家庭ID
}

export const DeviceConnectionExample: React.FC<DeviceConnectionExampleProps> = ({ 
  homeId = 123456 // 默认家庭ID，实际使用时需要从用户数据获取
}) => {
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState<number | null>(null);
  
  // 使用设备管理Hook
  const {
    currentDevice,
    deviceList,
    isLoading,
    getDeviceList,
    connectDevice,
    disconnectDevice,
    getDeviceStatus,
    autoConnectFirstOnlineDevice,
  } = useDeviceManager();
  
  // 使用DP管理Hook
  const { isDeviceConnected } = useDPManager();

  // 获取设备列表
  const handleGetDeviceList = async () => {
    try {
      const devices = await getDeviceList(homeId);
      if (devices.length === 0) {
        Alert.alert('提示', '没有找到设备，请确保设备已添加到涂鸦账户中');
      }
    } catch (error) {
      Alert.alert('错误', '获取设备列表失败');
    }
  };

  // 连接选中的设备
  const handleConnectDevice = async (index: number) => {
    const device = deviceList[index];
    if (!device) return;

    try {
      const success = await connectDevice(device);
      if (success) {
        Alert.alert('成功', `已连接到设备: ${device.name}`);
        setSelectedDeviceIndex(index);
      } else {
        Alert.alert('失败', '设备连接失败');
      }
    } catch (error) {
      Alert.alert('错误', '连接设备时发生错误');
    }
  };

  // 断开设备连接
  const handleDisconnectDevice = async () => {
    try {
      const success = await disconnectDevice();
      if (success) {
        Alert.alert('成功', '设备已断开连接');
        setSelectedDeviceIndex(null);
      } else {
        Alert.alert('失败', '断开连接失败');
      }
    } catch (error) {
      Alert.alert('错误', '断开连接时发生错误');
    }
  };

  // 自动连接第一个在线设备
  const handleAutoConnect = async () => {
    try {
      const success = await autoConnectFirstOnlineDevice(homeId);
      if (success) {
        Alert.alert('成功', '已自动连接到在线设备');
      } else {
        Alert.alert('提示', '没有找到在线设备');
      }
    } catch (error) {
      Alert.alert('错误', '自动连接失败');
    }
  };

  // 获取设备状态
  const handleGetDeviceStatus = async (deviceId: string) => {
    try {
      const status = await getDeviceStatus(deviceId);
      if (status) {
        Alert.alert('设备状态', JSON.stringify(status, null, 2));
      } else {
        Alert.alert('错误', '获取设备状态失败');
      }
    } catch (error) {
      Alert.alert('错误', '获取设备状态时发生错误');
    }
  };

  // 组件挂载时自动获取设备列表
  useEffect(() => {
    handleGetDeviceList();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>设备连接管理</Text>
      
      {/* 连接状态 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>连接状态:</Text>
        <View style={[styles.statusIndicator, isDeviceConnected ? styles.connected : styles.disconnected]}>
          <Text style={styles.statusText}>
            {isDeviceConnected ? '已连接' : '未连接'}
          </Text>
        </View>
      </View>

      {/* 当前设备信息 */}
      {currentDevice && (
        <View style={styles.currentDeviceContainer}>
          <Text style={styles.sectionTitle}>当前设备</Text>
          <Text style={styles.deviceInfo}>名称: {currentDevice.name}</Text>
          <Text style={styles.deviceInfo}>ID: {currentDevice.deviceId}</Text>
          <Text style={styles.deviceInfo}>UUID: {currentDevice.uuid}</Text>
          <Text style={styles.deviceInfo}>在线状态: {currentDevice.isOnline ? '在线' : '离线'}</Text>
        </View>
      )}

      {/* 操作按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleGetDeviceList} disabled={isLoading}>
          <Text style={styles.buttonText}>刷新设备列表</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleAutoConnect} disabled={isLoading}>
          <Text style={styles.buttonText}>自动连接</Text>
        </TouchableOpacity>
        
        {isDeviceConnected && (
          <TouchableOpacity style={[styles.button, styles.disconnectButton]} onPress={handleDisconnectDevice}>
            <Text style={styles.buttonText}>断开连接</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 设备列表 */}
      <View style={styles.deviceListContainer}>
        <Text style={styles.sectionTitle}>设备列表</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#1EAAFD" />
        ) : deviceList.length > 0 ? (
          deviceList.map((device, index) => (
            <View key={device.deviceId} style={styles.deviceItem}>
              <View style={styles.deviceItemInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceId}>ID: {device.deviceId}</Text>
                <Text style={styles.deviceStatus}>
                  状态: {device.isOnline ? '在线' : '离线'}
                </Text>
              </View>
              
              <View style={styles.deviceItemActions}>
                <TouchableOpacity
                  style={[styles.smallButton, styles.connectButton]}
                  onPress={() => handleConnectDevice(index)}
                  disabled={!device.isOnline}
                >
                  <Text style={styles.smallButtonText}>连接</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.smallButton, styles.statusButton]}
                  onPress={() => handleGetDeviceStatus(device.deviceId)}
                >
                  <Text style={styles.smallButtonText}>状态</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>没有找到设备</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  currentDeviceContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  deviceInfo: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1EAAFD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  deviceListContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deviceItemInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  deviceId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deviceStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deviceItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  statusButton: {
    backgroundColor: '#2196F3',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
});

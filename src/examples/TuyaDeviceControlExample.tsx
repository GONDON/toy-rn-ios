/**
 * 涂鸦设备控制桥接使用示例
 * Created by AI Assistant on 2025/7/18
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  TuyaDeviceControl,
  DeviceControlUtils,
  DeviceInfo,
  CommonDpId,
} from '../types/TuyaDeviceControl';

const TuyaDeviceControlExample: React.FC = () => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  /**
   * 加载设备列表
   */
  const loadDevices = async () => {
    try {
      setLoading(true);
      // 假设家庭ID为1，实际使用时应该从用户数据中获取
      const response = await TuyaDeviceControl.getDeviceList(1);
      setDevices(response.devices);
      
      if (response.devices.length > 0) {
        setSelectedDevice(response.devices[0]);
      }
    } catch (error: any) {
      Alert.alert('错误', `加载设备失败: ${error.message}`);
      console.error('加载设备失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 控制设备开关
   */
  const toggleDeviceSwitch = async () => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      
      // 获取当前开关状态
      const status = await TuyaDeviceControl.getDeviceStatus(selectedDevice.deviceId);
      const currentSwitchState = status.dps[CommonDpId.SWITCH];
      const newSwitchState = !currentSwitchState;
      
      // 控制开关
      await DeviceControlUtils.controlSwitch(selectedDevice.deviceId, newSwitchState);
      
      Alert.alert('成功', `设备已${newSwitchState ? '开启' : '关闭'}`);
      
      // 刷新设备状态
      await loadDevices();
    } catch (error: any) {
      Alert.alert('错误', `控制设备失败: ${error.message}`);
      console.error('控制设备失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 设置设备亮度
   */
  const setBrightness = async (brightness: number) => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      await DeviceControlUtils.controlBrightness(selectedDevice.deviceId, brightness);
      Alert.alert('成功', `亮度已设置为 ${brightness}`);
    } catch (error: any) {
      Alert.alert('错误', `设置亮度失败: ${error.message}`);
      console.error('设置亮度失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发送自定义DP指令示例
   */
  const sendCustomCommand = async () => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      
      // 示例：发送模式切换指令
      const response = await TuyaDeviceControl.publishDeviceDps(selectedDevice.deviceId, {
        [CommonDpId.MODE]: 'scene_1', // 场景模式1
      });
      
      Alert.alert('成功', response.message);
    } catch (error: any) {
      Alert.alert('错误', `发送指令失败: ${error.message}`);
      console.error('发送指令失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>涂鸦设备控制示例</Text>
      
      {/* 设备选择 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>当前设备</Text>
        {selectedDevice ? (
          <View style={styles.deviceCard}>
            <Text style={styles.deviceName}>{selectedDevice.name}</Text>
            <Text style={styles.deviceStatus}>
              状态: {selectedDevice.isOnline ? '在线' : '离线'}
            </Text>
            <Text style={styles.deviceId}>ID: {selectedDevice.deviceId}</Text>
          </View>
        ) : (
          <Text style={styles.noDevice}>未找到设备</Text>
        )}
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={loadDevices}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '加载中...' : '刷新设备'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 设备控制 */}
      {selectedDevice && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>设备控制</Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={toggleDeviceSwitch}
            disabled={loading || !selectedDevice.isOnline}
          >
            <Text style={styles.buttonText}>开关切换</Text>
          </TouchableOpacity>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.halfButton]} 
              onPress={() => setBrightness(100)}
              disabled={loading || !selectedDevice.isOnline}
            >
              <Text style={styles.buttonText}>低亮度</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.halfButton]} 
              onPress={() => setBrightness(500)}
              disabled={loading || !selectedDevice.isOnline}
            >
              <Text style={styles.buttonText}>中亮度</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, styles.fullButton]} 
            onPress={() => setBrightness(1000)}
            disabled={loading || !selectedDevice.isOnline}
          >
            <Text style={styles.buttonText}>高亮度</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.customButton]} 
            onPress={sendCustomCommand}
            disabled={loading || !selectedDevice.isOnline}
          >
            <Text style={styles.buttonText}>场景模式</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 设备列表 */}
      {devices.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他设备</Text>
          {devices.filter(d => d.deviceId !== selectedDevice?.deviceId).map((device) => (
            <TouchableOpacity
              key={device.deviceId}
              style={styles.deviceItem}
              onPress={() => setSelectedDevice(device)}
            >
              <Text style={styles.deviceItemName}>{device.name}</Text>
              <Text style={styles.deviceItemStatus}>
                {device.isOnline ? '在线' : '离线'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
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
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  deviceCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  noDevice: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfButton: {
    flex: 0.48,
  },
  fullButton: {
    backgroundColor: '#34C759',
  },
  customButton: {
    backgroundColor: '#FF9500',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceItemName: {
    fontSize: 16,
    color: '#333',
  },
  deviceItemStatus: {
    fontSize: 14,
    color: '#666',
  },
});

export default TuyaDeviceControlExample;

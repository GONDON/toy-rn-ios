/**
 * 涂鸦设备控制桥接功能测试组件
 * Created by AI Assistant on 2025/7/18
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import {
  TuyaDeviceControl,
  DeviceControlUtils,
  DeviceInfo,
  DeviceStatus,
  CommonDpId,
  ErrorCode,
} from '../types/TuyaDeviceControl';

interface Props {
  homeId?: number;
}

const TuyaDeviceControlTest: React.FC<Props> = ({ homeId = 1 }) => {
  const [deviceList, setDeviceList] = useState<DeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // 测试用的DP指令
  const [testDpId, setTestDpId] = useState('1');
  const [testDpValue, setTestDpValue] = useState('true');
  const [switchValue, setSwitchValue] = useState(false);
  const [brightnessValue, setBrightnessValue] = useState(500);

  useEffect(() => {
    loadDeviceList();
  }, []);

  /**
   * 加载设备列表
   */
  const loadDeviceList = async () => {
    try {
      setLoading(true);
      addTestResult('🔄 开始加载设备列表...');
      
      const response = await TuyaDeviceControl.getDeviceList(homeId);
      setDeviceList(response.devices);
      
      if (response.devices.length > 0) {
        setSelectedDeviceId(response.devices[0].deviceId);
        addTestResult(`✅ 设备列表加载成功，共 ${response.devices.length} 个设备`);
      } else {
        addTestResult('⚠️ 未找到任何设备');
      }
    } catch (error: any) {
      addTestResult(`❌ 设备列表加载失败: ${error.message}`);
      console.error('加载设备列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取设备状态
   */
  const getDeviceStatus = async () => {
    if (!selectedDeviceId) {
      Alert.alert('错误', '请先选择设备');
      return;
    }

    try {
      setLoading(true);
      addTestResult(`🔄 开始查询设备状态: ${selectedDeviceId}`);
      
      const status = await TuyaDeviceControl.getDeviceStatus(selectedDeviceId);
      setDeviceStatus(status);
      
      addTestResult(`✅ 设备状态查询成功:`);
      addTestResult(`   - 设备名称: ${status.name}`);
      addTestResult(`   - 在线状态: ${status.isOnline ? '在线' : '离线'}`);
      addTestResult(`   - DP状态: ${JSON.stringify(status.dps)}`);
    } catch (error: any) {
      addTestResult(`❌ 设备状态查询失败: ${error.message}`);
      console.error('设备状态查询失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发送自定义DP指令
   */
  const sendCustomDpCommand = async () => {
    if (!selectedDeviceId) {
      Alert.alert('错误', '请先选择设备');
      return;
    }

    try {
      setLoading(true);
      let dpValue: any = testDpValue;
      
      // 尝试解析数值
      if (!isNaN(Number(testDpValue))) {
        dpValue = Number(testDpValue);
      } else if (testDpValue === 'true' || testDpValue === 'false') {
        dpValue = testDpValue === 'true';
      }

      const dps = { [testDpId]: dpValue };
      addTestResult(`🔄 发送DP指令: ${JSON.stringify(dps)}`);
      
      const response = await TuyaDeviceControl.publishDeviceDps(selectedDeviceId, dps);
      addTestResult(`✅ DP指令发送成功: ${response.message}`);
    } catch (error: any) {
      addTestResult(`❌ DP指令发送失败: ${error.message}`);
      console.error('DP指令发送失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 控制设备开关
   */
  const controlDeviceSwitch = async (isOn: boolean) => {
    if (!selectedDeviceId) {
      Alert.alert('错误', '请先选择设备');
      return;
    }

    try {
      setLoading(true);
      addTestResult(`🔄 控制设备开关: ${isOn ? '开启' : '关闭'}`);
      
      const response = await DeviceControlUtils.controlSwitch(selectedDeviceId, isOn);
      setSwitchValue(isOn);
      addTestResult(`✅ 设备开关控制成功: ${response.message}`);
    } catch (error: any) {
      addTestResult(`❌ 设备开关控制失败: ${error.message}`);
      console.error('设备开关控制失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 控制设备亮度
   */
  const controlDeviceBrightness = async () => {
    if (!selectedDeviceId) {
      Alert.alert('错误', '请先选择设备');
      return;
    }

    try {
      setLoading(true);
      addTestResult(`🔄 控制设备亮度: ${brightnessValue}`);
      
      const response = await DeviceControlUtils.controlBrightness(selectedDeviceId, brightnessValue);
      addTestResult(`✅ 设备亮度控制成功: ${response.message}`);
    } catch (error: any) {
      addTestResult(`❌ 设备亮度控制失败: ${error.message}`);
      console.error('设备亮度控制失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 添加测试结果
   */
  const addTestResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${result}`]);
  };

  /**
   * 清空测试结果
   */
  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>涂鸦设备控制测试</Text>
      
      {/* 设备选择 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>设备选择</Text>
        <TouchableOpacity style={styles.button} onPress={loadDeviceList} disabled={loading}>
          <Text style={styles.buttonText}>刷新设备列表</Text>
        </TouchableOpacity>
        
        {deviceList.map((device) => (
          <TouchableOpacity
            key={device.deviceId}
            style={[
              styles.deviceItem,
              selectedDeviceId === device.deviceId && styles.selectedDevice
            ]}
            onPress={() => setSelectedDeviceId(device.deviceId)}
          >
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceStatus}>
              {device.isOnline ? '在线' : '离线'} | {device.deviceId}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 设备状态查询 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>设备状态</Text>
        <TouchableOpacity style={styles.button} onPress={getDeviceStatus} disabled={loading}>
          <Text style={styles.buttonText}>查询设备状态</Text>
        </TouchableOpacity>
        
        {deviceStatus && (
          <View style={styles.statusContainer}>
            <Text>设备名称: {deviceStatus.name}</Text>
            <Text>在线状态: {deviceStatus.isOnline ? '在线' : '离线'}</Text>
            <Text>DP状态: {JSON.stringify(deviceStatus.dps, null, 2)}</Text>
          </View>
        )}
      </View>

      {/* 快捷控制 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快捷控制</Text>
        
        <View style={styles.controlRow}>
          <Text>设备开关:</Text>
          <Switch
            value={switchValue}
            onValueChange={controlDeviceSwitch}
            disabled={loading}
          />
        </View>
        
        <View style={styles.controlRow}>
          <Text>亮度 ({brightnessValue}):</Text>
          <TextInput
            style={styles.input}
            value={brightnessValue.toString()}
            onChangeText={(text) => setBrightnessValue(Number(text) || 0)}
            keyboardType="numeric"
            placeholder="0-1000"
          />
          <TouchableOpacity style={styles.smallButton} onPress={controlDeviceBrightness} disabled={loading}>
            <Text style={styles.buttonText}>设置</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 自定义DP指令 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>自定义DP指令</Text>
        
        <View style={styles.inputRow}>
          <Text>DP ID:</Text>
          <TextInput
            style={styles.input}
            value={testDpId}
            onChangeText={setTestDpId}
            placeholder="DP ID"
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text>DP Value:</Text>
          <TextInput
            style={styles.input}
            value={testDpValue}
            onChangeText={setTestDpValue}
            placeholder="DP Value"
          />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={sendCustomDpCommand} disabled={loading}>
          <Text style={styles.buttonText}>发送DP指令</Text>
        </TouchableOpacity>
      </View>

      {/* 测试结果 */}
      <View style={styles.section}>
        <View style={styles.resultHeader}>
          <Text style={styles.sectionTitle}>测试结果</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearTestResults}>
            <Text style={styles.clearButtonText}>清空</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.resultContainer}>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))}
        </ScrollView>
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
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  smallButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deviceItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 8,
  },
  selectedDevice: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginLeft: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    padding: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
  },
  resultContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 6,
    maxHeight: 200,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default TuyaDeviceControlTest;

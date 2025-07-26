/**
 * DP 调试面板
 * 开发环境下用于调试和监控 DP 系统的工具面板
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useDPStore } from '../store/dpStore';
import { getAllDPDefinitions } from '../config/dpDefinitions';
import { dpLogger, dpPerformanceMonitor, LogLevel } from '../utils/dpLogger';
import { runDPSystemTests } from '../utils/dpTestUtils';
import { formatDPValue } from '../utils/dpUtils';
import { nativeModuleDebugger } from '../utils/nativeModuleDebug';

interface DPDebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const DPDebugPanel: React.FC<DPDebugPanelProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dps' | 'logs' | 'tests' | 'performance' | 'native'>('dps');
  const [testResults, setTestResults] = useState<string>('');
  const [selectedDPId, setSelectedDPId] = useState<number | null>(null);
  const [newDPValue, setNewDPValue] = useState<string>('');
  const [nativeModuleStatus, setNativeModuleStatus] = useState<any>(null);
  
  const { dpState, setDPValue, isDeviceConnected } = useDPStore();
  const definitions = getAllDPDefinitions();

  // 运行测试
  const handleRunTests = async () => {
    try {
      const results = await runDPSystemTests();
      setTestResults(results);
      setActiveTab('tests');
    } catch (error) {
      Alert.alert('测试失败', `运行测试时出错: ${error}`);
    }
  };

  // 检查原生模块状态
  const handleCheckNativeModule = () => {
    const status = nativeModuleDebugger.getDebugReport();
    setNativeModuleStatus(status);
    setActiveTab('native');
  };

  // 测试原生模块调用
  const handleTestNativeModule = async () => {
    try {
      const results = await nativeModuleDebugger.testCalls();
      setNativeModuleStatus((prev: any) => ({
        ...prev,
        testResults: results,
      }));
    } catch (error) {
      Alert.alert('测试失败', `测试原生模块时出错: ${error}`);
    }
  };

  // 设置DP值
  const handleSetDPValue = async () => {
    if (selectedDPId === null || !newDPValue) {
      Alert.alert('错误', '请选择DP和输入值');
      return;
    }

    try {
      let parsedValue: any = newDPValue;
      
      // 尝试解析JSON
      if (newDPValue.startsWith('{') || newDPValue.startsWith('[')) {
        parsedValue = JSON.parse(newDPValue);
      } else if (newDPValue === 'true' || newDPValue === 'false') {
        parsedValue = newDPValue === 'true';
      } else if (!isNaN(Number(newDPValue))) {
        parsedValue = Number(newDPValue);
      }

      const result = await setDPValue(selectedDPId, parsedValue);
      
      if (result.success) {
        Alert.alert('成功', `DP ${selectedDPId} 设置成功`);
        setNewDPValue('');
        setSelectedDPId(null);
      } else {
        Alert.alert('失败', result.error || '设置失败');
      }
    } catch (error) {
      Alert.alert('错误', `解析值失败: ${error}`);
    }
  };

  // 渲染DP列表
  const renderDPList = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>设备状态</Text>
        <Text style={styles.statusText}>
          连接状态: {isDeviceConnected ? '已连接' : '未连接'}
        </Text>
        <Text style={styles.statusText}>
          DP总数: {Object.keys(dpState).length}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DP 数据</Text>
        {Object.entries(definitions).map(([dpId, definition]) => {
          const state = dpState[Number(dpId)];
          const value = state?.value;
          const formattedValue = value !== undefined ? formatDPValue(Number(dpId), value) : '未设置';
          
          return (
            <View key={dpId} style={styles.dpItem}>
              <View style={styles.dpHeader}>
                <Text style={styles.dpId}>DP {dpId}</Text>
                <Text style={styles.dpName}>{definition.name}</Text>
              </View>
              <Text style={styles.dpIdentifier}>{definition.identifier}</Text>
              <Text style={styles.dpValue}>值: {formattedValue}</Text>
              <Text style={styles.dpType}>
                类型: {definition.dataType} | 权限: {definition.transmissionType}
              </Text>
              {state?.lastUpdated && (
                <Text style={styles.dpTimestamp}>
                  更新时间: {new Date(state.lastUpdated).toLocaleString()}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>设置 DP 值</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="DP ID"
            value={selectedDPId?.toString() || ''}
            onChangeText={(text) => setSelectedDPId(Number(text) || null)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="新值 (支持JSON)"
            value={newDPValue}
            onChangeText={setNewDPValue}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={handleSetDPValue}>
            <Text style={styles.buttonText}>设置</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // 渲染日志
  const renderLogs = () => {
    const logs = dpLogger.getLogs();
    const stats = dpLogger.getStats();

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日志统计</Text>
          <Text style={styles.statusText}>总数: {stats.total}</Text>
          <Text style={styles.statusText}>错误: {stats.error}</Text>
          <Text style={styles.statusText}>警告: {stats.warn}</Text>
          <Text style={styles.statusText}>信息: {stats.info}</Text>
          <Text style={styles.statusText}>调试: {stats.debug}</Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => dpLogger.clearLogs()}
          >
            <Text style={styles.buttonText}>清除日志</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近日志</Text>
          {logs.slice(-20).reverse().map((log, index) => (
            <View key={index} style={[styles.logItem, getLogLevelStyle(log.level)]}>
              <Text style={styles.logTimestamp}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </Text>
              <Text style={styles.logCategory}>[{log.category}]</Text>
              <Text style={styles.logMessage}>{log.message}</Text>
              {log.data && (
                <Text style={styles.logData}>
                  {JSON.stringify(log.data, null, 2)}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // 渲染测试结果
  const renderTests = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={handleRunTests}>
          <Text style={styles.buttonText}>运行测试</Text>
        </TouchableOpacity>
      </View>
      
      {testResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>测试结果</Text>
          <Text style={styles.testResults}>{testResults}</Text>
        </View>
      )}
    </ScrollView>
  );

  // 渲染性能监控
  const renderPerformance = () => {
    const performanceNames = ['setDP', 'readDP', 'syncDP', 'validateDP'];
    
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>性能统计</Text>
          {performanceNames.map(name => {
            const stats = dpPerformanceMonitor.getStats(name);
            return (
              <View key={name} style={styles.performanceItem}>
                <Text style={styles.performanceName}>{name}</Text>
                {stats ? (
                  <>
                    <Text style={styles.performanceText}>
                      调用次数: {stats.count}
                    </Text>
                    <Text style={styles.performanceText}>
                      平均耗时: {stats.avg}ms
                    </Text>
                    <Text style={styles.performanceText}>
                      最小/最大: {stats.min}ms / {stats.max}ms
                    </Text>
                  </>
                ) : (
                  <Text style={styles.performanceText}>暂无数据</Text>
                )}
              </View>
            );
          })}
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => dpPerformanceMonitor.clearMetrics()}
          >
            <Text style={styles.buttonText}>清除统计</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // 渲染原生模块调试
  const renderNativeModule = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>原生模块检查</Text>
        <TouchableOpacity style={styles.button} onPress={handleCheckNativeModule}>
          <Text style={styles.buttonText}>检查原生模块状态</Text>
        </TouchableOpacity>

        {nativeModuleStatus?.needsNativeModule && (
          <TouchableOpacity style={styles.button} onPress={handleTestNativeModule}>
            <Text style={styles.buttonText}>测试原生模块调用</Text>
          </TouchableOpacity>
        )}
      </View>

      {nativeModuleStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>检查结果</Text>
          <Text style={styles.statusText}>平台: {nativeModuleStatus.platform}</Text>
          <Text style={styles.statusText}>
            DPBridge 模块: {nativeModuleStatus.hasDPBridge ? '✅ 存在' : '❌ 不存在'}
          </Text>
          <Text style={styles.statusText}>
            可用模块数量: {nativeModuleStatus.availableModules?.length || 0}
          </Text>

          {nativeModuleStatus.hasDPBridge && (
            <View>
              <Text style={styles.statusText}>
                DPBridge 方法: {nativeModuleStatus.dpBridgeMethods?.join(', ')}
              </Text>
            </View>
          )}

          {nativeModuleStatus.relatedModules?.length > 0 && (
            <View>
              <Text style={styles.statusText}>相关模块:</Text>
              {nativeModuleStatus.relatedModules.map((module: string) => (
                <Text key={module} style={styles.statusText}>  - {module}</Text>
              ))}
            </View>
          )}

          {nativeModuleStatus.testResults && (
            <View>
              <Text style={styles.sectionTitle}>测试结果</Text>
              {nativeModuleStatus.testResults.results?.map((result: any, index: number) => (
                <View key={index} style={styles.testResultItem}>
                  <Text style={styles.testResultName}>
                    {result.success ? '✅' : '❌'} {result.name}
                  </Text>
                  {result.error && (
                    <Text style={styles.testResultError}>错误: {result.error}</Text>
                  )}
                  {result.result && (
                    <Text style={styles.testResultData}>
                      结果: {JSON.stringify(result.result, null, 2)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {!nativeModuleStatus.hasDPBridge && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ 需要实现原生模块</Text>
              <Text style={styles.statusText}>
                DPBridge 原生模块不存在，需要在 iOS 项目中实现。
              </Text>
              <Text style={styles.statusText}>
                请参考控制台输出的实现指南。
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  const guide = nativeModuleDebugger.getImplementationGuide();
                  console.log('=== 原生模块实现指南 ===');
                  console.log(guide);
                  Alert.alert('实现指南', '请查看控制台输出的详细实现指南');
                }}
              >
                <Text style={styles.buttonText}>查看实现指南</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  // 获取日志级别样式
  const getLogLevelStyle = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return { backgroundColor: '#ffebee' };
      case LogLevel.WARN:
        return { backgroundColor: '#fff3e0' };
      case LogLevel.INFO:
        return { backgroundColor: '#e3f2fd' };
      default:
        return { backgroundColor: '#f5f5f5' };
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>DP 调试面板</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>关闭</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {[
            { key: 'dps', label: 'DP数据' },
            { key: 'logs', label: '日志' },
            { key: 'tests', label: '测试' },
            { key: 'performance', label: '性能' },
            { key: 'native', label: '原生模块' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'dps' && renderDPList()}
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'tests' && renderTests()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'native' && renderNativeModule()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  dpItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  dpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dpId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  dpName: {
    fontSize: 14,
    fontWeight: '500',
  },
  dpIdentifier: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  dpValue: {
    fontSize: 14,
    marginTop: 4,
  },
  dpType: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  dpTimestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logItem: {
    padding: 8,
    marginBottom: 4,
    borderRadius: 4,
  },
  logTimestamp: {
    fontSize: 10,
    color: '#666',
  },
  logCategory: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  logMessage: {
    fontSize: 14,
    marginTop: 2,
  },
  logData: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  testResults: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
  performanceItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  performanceName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  performanceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  testResultItem: {
    backgroundColor: '#f8f8f8',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  testResultName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testResultError: {
    fontSize: 12,
    color: '#f44336',
    marginBottom: 4,
  },
  testResultData: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
});

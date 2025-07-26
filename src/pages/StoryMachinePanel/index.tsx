import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import SettingsPanel from './SettingsPanel';
import SleepPanel from './SleepPanel';
import { useDPManager } from '../../hooks/useDPManager';
import { DPDebugPanel } from '../../components/DPDebugPanel';
import { nativeModuleDebugger } from '../../utils/nativeModuleDebug';
import { useDeviceConnection, DeviceConnectionParams } from '../../hooks/useDeviceConnection';

const StoryMachinePanel = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState('settings'); // 当前激活的tab
  const isSleepTab = activeTab === 'sleep';



  const { isDeviceConnected } = useDPManager();

  // 从路由参数获取设备信息
  const deviceDetails = route.params?.deviceDetails;
  const deviceConnectionParams: DeviceConnectionParams | undefined = deviceDetails ? {
    deviceId: deviceDetails.deviceId,
    deviceName: deviceDetails.deviceName || '未知设备',
    uuid: deviceDetails.uuid,
    productId: deviceDetails.productId,
    isOnline: deviceDetails.isOnline,
    dps: deviceDetails.dps,
  } : undefined;

  // 使用设备连接Hook
  const {
    isConnecting,
    isConnected,
    connectionError,
  } = useDeviceConnection(deviceConnectionParams);

  // 在开发环境下检查原生模块状态
  useEffect(() => {
    if (isDevelopment) {
      console.log('🔍 检查原生模块状态...');
      nativeModuleDebugger.checkStatus();
    }
  }, []);

  // 调试面板状态（仅开发环境）
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  const isDevelopment = __DEV__;

  // 处理关闭页面
  const handleClose = () => {
    navigation.goBack();
  };

  // 处理底部标签切换
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <View style={[styles.container, isSleepTab && { backgroundColor: '#1A1A1A' }]}>
      <StatusBar barStyle={isSleepTab ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      <View style={{ flex: 1 }}>
        {!isSleepTab && (
          <Image
            source={require('../../img/bg_setting.png')}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        )}
        {/* 顶部标题栏 */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, isSleepTab && { color: '#FFF' }]}>
                {deviceDetails?.deviceName || route.params?.deviceName || 'Ai 故事机'}
              </Text>
              <View style={[
                styles.connectionStatus,
                isConnecting ? styles.connecting :
                (isConnected || isDeviceConnected) ? styles.connected : styles.disconnected
              ]}>
                <Text style={[
                  styles.connectionText,
                  isConnecting ? styles.connectingText :
                  (isConnected || isDeviceConnected) ? styles.connectedText : styles.disconnectedText
                ]}>
                  {isConnecting ? '连接中...' :
                   (isConnected || isDeviceConnected) ? '已连接' : '未连接'}
                </Text>
              </View>
              {connectionError && (
                <Text style={styles.errorText}>
                  {connectionError}
                </Text>
              )}
            </View>
            <View style={styles.headerButtons}>
              {isDevelopment && (
                <TouchableOpacity
                  style={styles.debugButton}
                  onPress={() => setDebugPanelVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.debugButtonText}>调试</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Image
                  source={isSleepTab ? require('../../img/light-close.png') : require('../../img/popup-close.png')}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 内容区域 */}
        {activeTab === 'settings' ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <SettingsPanel />
          </ScrollView>
        ) : (
          <SleepPanel />
        )}

        {/* 底部导航栏 */}
        <View style={[styles.bottomNavigation, isSleepTab && styles.bottomNavigationDark]}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'settings' && styles.activeTabButton]}
            onPress={() => handleTabPress('settings')}
            activeOpacity={0.7}
          >
            <Image
              source={
                isSleepTab
                  ? require('../../img/settings-icon.png')
                  : require('../../img/settings-icon.png')
              }
              style={[
                styles.tabIcon,
                activeTab === 'settings'
                  ? styles.activeTabIcon
                  : { tintColor: isSleepTab ? '#FFFFFF' : '#000000' },
              ]}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'settings'
                  ? styles.activeTabLabel
                  : isSleepTab
                  ? styles.inactiveTabLabelDark
                  : styles.inactiveTabLabelLight,
              ]}
            >
              设置
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'sleep' && styles.activeTabButton]}
            onPress={() => handleTabPress('sleep')}
            activeOpacity={0.7}
          >
            <Image
              source={
               isSleepTab
                  ? require('../../img/sleep-icon-light.png')
                  : require('../../img/sleep-icon-dark.png')
              }
              style={[
                styles.tabIcon,
                activeTab === 'sleep' && styles.activeTabIcon,
              ]}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'sleep'
                  ? styles.activeTabLabel
                  : isSleepTab
                  ? styles.inactiveTabLabelDark
                  : styles.inactiveTabLabelLight,
              ]}
            >
              哄睡
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 调试面板 */}
      {isDevelopment && (
        <DPDebugPanel
          visible={debugPanelVisible}
          onClose={() => setDebugPanelVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  backgroundImage: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  connected: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  connecting: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: '#FF9800',
  },
  disconnected: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#F44336',
  },
  connectionText: {
    fontSize: 10,
    fontWeight: '500',
  },
  connectedText: {
    color: '#4CAF50',
  },
  connectingText: {
    color: '#FF9800',
  },
  disconnectedText: {
    color: '#F44336',
  },
  errorText: {
    fontSize: 10,
    color: '#F44336',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  debugButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bottomNavigationDark: {
    backgroundColor: '#1C1C1E',
    borderTopColor: 'transparent',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 5,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  activeTabIcon: {
    tintColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#FFFFFF',
  },
  inactiveTabLabelLight: {
    color: '#000000',
  },
  inactiveTabLabelDark: {
    color: '#ffffff',
  },
  // 调试信息样式
  debugInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  debugInfoDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: '#333333',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  debugText: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 2,
    lineHeight: 16,
  },
});

export default StoryMachinePanel;

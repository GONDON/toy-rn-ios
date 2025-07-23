import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import SettingsPanel from './SettingsPanel';
import SleepPanel from './SleepPanel';

const StoryMachinePanel = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('sleep'); // 当前激活的tab
  const isSleepTab = activeTab === 'sleep';

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
            <Text style={[styles.title, isSleepTab && { color: '#FFF' }]}>Ai 故事机</Text>
            <View style={styles.headerButtons}>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default StoryMachinePanel;

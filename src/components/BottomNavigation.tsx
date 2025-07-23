/*
 * @LastEditors: jizai jizai.zhu@tuya.com
 * @Date: 2025-06-24 15:41:31
 * @LastEditTime: 2025-06-24 17:12:12
 * @FilePath: /demoapp/src/components/BottomNavigation.tsx
 * @Description: 
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabPress }: BottomNavigationProps) => {

  const tabs = [
    { key: 'home', label: 'home', icon: '🏠' },
    { key: 'creation', label: 'creation', icon: '🎨' },
    { key: 'call', label: 'call', icon: '📞' },
    { key: 'me', label: 'mine', icon: '👤' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.icon,
              activeTab === tab.key ? styles.activeIcon : styles.inactiveIcon
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.label,
              activeTab === tab.key ? styles.activeLabel : styles.inactiveLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeIcon: {
    opacity: 1,
  },
  inactiveIcon: {
    opacity: 0.6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#4A9EFF',
  },
  inactiveLabel: {
    color: '#999999',
  },
});

export default BottomNavigation; 
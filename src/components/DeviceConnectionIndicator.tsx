/**
 * 设备连接状态指示器
 * 显示设备连接状态和连接进度
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';

interface DeviceConnectionIndicatorProps {
  isConnecting: boolean;
  isConnected: boolean;
  connectionError: string | null;
  deviceName?: string;
  onRetry?: () => void;
  style?: any;
}

export const DeviceConnectionIndicator: React.FC<DeviceConnectionIndicatorProps> = ({
  isConnecting,
  isConnected,
  connectionError,
  deviceName,
  onRetry,
  style,
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  // 连接中的脉冲动画
  useEffect(() => {
    if (isConnecting) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnecting, pulseAnim]);

  // 获取状态样式
  const getStatusStyle = () => {
    if (isConnecting) return styles.connecting;
    if (isConnected) return styles.connected;
    if (connectionError) return styles.error;
    return styles.disconnected;
  };

  // 获取状态文本
  const getStatusText = () => {
    if (isConnecting) return '正在连接设备...';
    if (isConnected) return '设备已连接';
    if (connectionError) return '连接失败';
    return '设备未连接';
  };

  // 获取状态图标
  const getStatusIcon = () => {
    if (isConnecting) {
      return <ActivityIndicator size="small" color="#FF9800" />;
    }
    if (isConnected) {
      return <Text style={styles.icon}>✓</Text>;
    }
    if (connectionError) {
      return <Text style={styles.icon}>✗</Text>;
    }
    return <Text style={styles.icon}>○</Text>;
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        getStatusStyle(),
        isConnecting && { transform: [{ scale: pulseAnim }] },
        style
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getStatusIcon()}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>
            {getStatusText()}
          </Text>
          
          {deviceName && (
            <Text style={styles.deviceName}>
              {deviceName}
            </Text>
          )}
          
          {connectionError && (
            <Text style={styles.errorText}>
              {connectionError}
            </Text>
          )}
        </View>
        
        {connectionError && onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>重试</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  deviceName: {
    fontSize: 12,
    opacity: 0.8,
  },
  errorText: {
    fontSize: 11,
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // 状态样式
  connecting: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: '#FF9800',
  },
  connected: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: 'rgba(158, 158, 158, 0.1)',
    borderColor: '#9E9E9E',
  },
  error: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#F44336',
  },
});

// 简化版本的连接状态指示器
export const SimpleConnectionIndicator: React.FC<{
  isConnecting: boolean;
  isConnected: boolean;
  connectionError: string | null;
}> = ({ isConnecting, isConnected, connectionError }) => {
  const getStatusColor = () => {
    if (isConnecting) return '#FF9800';
    if (isConnected) return '#4CAF50';
    if (connectionError) return '#F44336';
    return '#9E9E9E';
  };

  const getStatusText = () => {
    if (isConnecting) return '连接中';
    if (isConnected) return '已连接';
    if (connectionError) return '连接失败';
    return '未连接';
  };

  return (
    <View style={[styles.simpleContainer, { borderColor: getStatusColor() }]}>
      {isConnecting && <ActivityIndicator size="small" color={getStatusColor()} />}
      <Text style={[styles.simpleText, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const simpleStyles = StyleSheet.create({
  simpleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  simpleText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
});

// 合并样式
Object.assign(styles, simpleStyles);

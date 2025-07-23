/**
 * 音乐播放器进度条组件
 * 支持拖拽控制播放进度
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

interface ProgressBarProps {
  style?: any;
  currentTime: number;
  duration: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  style,
  currentTime,
  duration,
}) => {
  const { seekTo } = useMusicPlayer();
  const [isDragging, setIsDragging] = useState(false);
  const [tempValue, setTempValue] = useState(0);

  // 计算进度值 - 修复逻辑
  const maximumValue = duration > 0 ? duration : 100;
  const displayValue = isDragging ? tempValue : (duration > 0 ? currentTime : 0);

  const handleValueChange = (newValue: number) => {
    if (isDragging) {
      // 拖拽时实时更新显示值，但不立即跳转
      setTempValue(newValue);
    }
  };

  const handleSlidingStart = (value: number) => {
    console.log('🎵 [ProgressBar] 开始拖拽，当前值:', value);
    setIsDragging(true);
    setTempValue(value);
  };

  const handleSlidingComplete = (newValue: number) => {
    console.log('🎵 [ProgressBar] 拖拽完成，跳转到:', newValue);
    setIsDragging(false);
    setTempValue(0);
    seekTo(newValue);
  };

  return (
    <View style={[styles.container, style]}>
      <Slider
        style={styles.slider}
        value={displayValue}
        minimumValue={0}
        maximumValue={maximumValue}
        onValueChange={handleValueChange}
        onSlidingStart={handleSlidingStart}
        onSlidingComplete={handleSlidingComplete}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#E0E0E0"
        thumbTintColor="#007AFF"
        step={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    height: 40, // 增加高度，提供更大的触摸区域
    paddingVertical: 10, // 增加垂直内边距
  },
  slider: {
    flex: 1,
    height: 40, // 增加slider高度
  },
});

export default ProgressBar;

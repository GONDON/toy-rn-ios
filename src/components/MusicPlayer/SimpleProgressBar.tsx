/**
 * 简化的进度条组件
 * 确保拖拽功能正常工作
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

interface SimpleProgressBarProps {
  style?: any;
  currentTime: number;
  duration: number;
}

const SimpleProgressBar: React.FC<SimpleProgressBarProps> = ({
  style,
  currentTime,
  duration,
}) => {
  const { seekTo } = useMusicPlayer();
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  // 计算进度百分比
  const progress = duration > 0 ? currentTime / duration : 0;
  const displayProgress = isDragging ? dragPosition : progress;

  // 优化的手势处理 - 使用 useMemo 避免重复创建
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      const { locationX } = evt.nativeEvent;
      const position = Math.max(0, Math.min(1, locationX / barWidth));
      setDragPosition(position);
      console.log('🎵 [SimpleProgressBar] 开始拖拽，位置:', position);
    },

    onPanResponderMove: (evt) => {
      if (!isDragging) return;

      const { locationX } = evt.nativeEvent;
      const position = Math.max(0, Math.min(1, locationX / barWidth));
      setDragPosition(position);
    },

    onPanResponderRelease: () => {
      if (!isDragging) return;

      setIsDragging(false);
      const seekTime = dragPosition * duration;
      console.log('🎵 [SimpleProgressBar] 拖拽完成，跳转到:', seekTime);
      seekTo(seekTime);
    },
  }), [barWidth, isDragging, dragPosition, duration, seekTo]);

  const onLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    setBarWidth(width);
  }, []);

  return (
    <View style={[styles.container, style]}>
      <View 
        style={styles.trackContainer}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        {/* 背景轨道 */}
        <View style={styles.track} />
        
        {/* 进度轨道 */}
        <View 
          style={[
            styles.progress,
            { width: `${displayProgress * 100}%` }
          ]} 
        />
        
        {/* 拖拽圆点 */}
        <View 
          style={[
            styles.thumb,
            { left: `${displayProgress * 100}%` }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    height: 30, // 减小高度
    paddingVertical: 10,
  },
  trackContainer: {
    height: 6, // 增加轨道高度，匹配图片
    position: 'relative',
    justifyContent: 'center',
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // 半透明白色背景
    borderRadius: 3,
  },
  progress: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#007AFF', // 蓝色进度条
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: -3, // 居中对齐
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginLeft: -6, // 居中对齐
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default SimpleProgressBar;

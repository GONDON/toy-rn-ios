/**
 * 音乐播放器主组件
 * 根据设计图实现UI界面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import SimpleProgressBar from './SimpleProgressBar';
import { formatTime } from '../../utils/timeUtils';

interface MusicPlayerProps {
  style?: any;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ style }) => {
  const {
    playbackState,
    play,
    pause,
    next,
    previous,
    isVisible,
    hidePlayer,
  } = useMusicPlayer();

  const [dragY] = useState(new Animated.Value(0));

  // 计算底部安全距离，确保不被tab导航遮挡
  const getBottomOffset = () => {
    // 默认tab导航高度约为80-90px，加上一些安全距离
    return 100;
  };

  // 格式化时间显示
  const currentTimeFormatted = formatTime(playbackState.currentTime);
  const durationFormatted = formatTime(playbackState.duration);

  // 播放/暂停切换
  const togglePlayPause = () => {
    if (playbackState.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // 手势处理 - 向下滑动隐藏播放器
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        dragY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 50 || gestureState.vy > 0.5) {
        // 向下滑动超过阈值，隐藏播放器
        Animated.timing(dragY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          hidePlayer();
          dragY.setValue(0);
        });
      } else {
        // 回弹到原位置
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  if (!isVisible || !playbackState.currentTrack) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: getBottomOffset(), // 使用动态底部偏移
          transform: [{ translateY: dragY }],
        },
        style,
      ]}
      {...panResponder.panHandlers}
    >
        {/* 拖拽指示器 */}
        <View style={styles.dragIndicator} />

        <View style={styles.content}>
          {/* 上半部分：标题和控制按钮 */}
          <View style={styles.topSection}>
            {/* 左侧：歌曲标题 */}
            <View style={styles.titleSection}>
              <Text style={styles.title} numberOfLines={1}>
                {playbackState.currentTrack.title}
              </Text>
            </View>

            {/* 右侧：控制按钮 */}
            <View style={styles.controlSection}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={previous}
                activeOpacity={0.7}
              >
                <Image
                  source={require('../../img/previous-track.png')}
                  style={styles.controlIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.playButton]}
                onPress={togglePlayPause}
                activeOpacity={0.7}
              >
                <Image
                  source={
                    playbackState.isPlaying
                      ? require('../../img/pause-icon.png')
                      : require('../../img/play.png')
                  }
                  style={[styles.controlIcon, styles.playIcon]}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={next}
                activeOpacity={0.7}
              >
                <Image
                  source={require('../../img/next-track.png')}
                  style={styles.controlIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 下半部分：进度条和时间 */}
          <View style={styles.bottomSection}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{currentTimeFormatted}</Text>
              <SimpleProgressBar
                style={styles.progressBar}
                currentTime={playbackState.currentTime}
                duration={playbackState.duration}
              />
              <Text style={styles.timeText}>{durationFormatted}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // bottom值现在通过动态计算设置
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // 半透明背景
    borderRadius: 25, // 更大的圆角
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  controlSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomSection: {
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#007AFF', // 蓝色时间文字，匹配图片
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  playButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  controlIcon: {
    width: 20,
    height: 20,
    tintColor: '#007AFF',
  },
  playIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});

export default MusicPlayer;

# 音乐播放器使用说明

## 概述

本项目实现了一个全局音乐播放器组件，支持在React Native页面和原生iOS页面之间共享使用。

## 功能特性

### ✅ 已实现功能

1. **基本播放控制**
   - 播放/暂停
   - 上一首/下一首
   - 停止播放

2. **进度控制**
   - 进度条显示
   - 拖拽跳转（使用Slider组件）
   - 实时时间显示

3. **播放列表管理**
   - 设置播放列表
   - 添加/移除曲目
   - 循环播放支持

4. **UI界面**
   - 根据设计图实现的播放器界面
   - 圆形封面图片
   - 蓝色进度条
   - 播放控制按钮
   - 向下滑动隐藏功能

5. **全局状态管理**
   - React Context状态管理
   - 跨页面状态共享
   - 显示/隐藏控制

6. **iOS桥接**
   - 原生iOS调用接口
   - 事件通信机制
   - ReactViewController集成

## 项目结构

```
src/
├── components/MusicPlayer/
│   ├── MusicPlayer.tsx          # 主播放器组件
│   ├── ProgressBar.tsx          # 进度条组件
│   └── index.ts                 # 组件导出
├── contexts/
│   └── MusicPlayerContext.tsx   # 全局状态管理
├── services/
│   ├── AudioService.ts          # 真实音频服务
│   ├── MockAudioService.ts      # 模拟音频服务（测试用）
│   ├── MusicPlayerBridge.ts     # RN端桥接服务
│   └── TrackPlayerService.ts    # TrackPlayer封装
├── types/
│   └── MusicPlayer.ts           # 类型定义
└── pages/
    └── MusicPlayerTest.tsx      # 测试页面

ios/AIToys/RN/
├── MusicPlayerBridge.h          # iOS桥接头文件
└── MusicPlayerBridge.m          # iOS桥接实现
```

## 使用方法

### 1. 在React Native页面中使用

```typescript
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { createAudioTrack } from '../utils/audioUtils';

const MyComponent = () => {
  const {
    playbackState,
    setPlaylist,
    play,
    pause,
    showPlayer,
    hidePlayer
  } = useMusicPlayer();

  const handlePlayNetworkAudio = async () => {
    // 使用网络音频URL
    const networkAudioUrl = 'https://tosdata-test.zhinengtongbu.com/jxwnewdata/audio/mp3_test/16b97d9c710a7fba7739e7da509a8c1c/16b97d9c710a7fba7739e7da509a8c1c.mp3?sign=0ca0255bdadd9b652be9e56ea2051d97&t=1753269324';

    const tracks = [
      createAudioTrack({
        id: '1',
        title: '小老鼠偷油吃的故事',
        url: networkAudioUrl,
        duration: 300, // 默认时长，播放时会自动获取真实时长
        artist: '寓言故事',
        artwork: 'https://via.placeholder.com/300x300/4A90E2/ffffff?text=🎵',
      })
    ];

    await setPlaylist(tracks, 0);
    showPlayer();
    await play();
  };

  return (
    // Your component JSX
  );
};
```

### 2. 在DollPanel页面中的集成示例

DollPanel页面已经集成了音乐播放器功能：

```typescript
// 在renderAudioList函数中
const handlePlayAudio = async (audioItem: AudioItem, index: number) => {
  const tracks: Track[] = audioItems.map((item) => createAudioTrack({
    id: item.id,
    title: item.title,
    url: item.url, // 网络音频URL
    duration: 300,
    artist: item.category,
    artwork: 'https://via.placeholder.com/300x300/4A90E2/ffffff?text=🎵',
  }));

  await setPlaylist(tracks, index);
  showPlayer();
  await play();
};
```

### 2. 在原生iOS页面中使用

```objective-c
// 显示播放器
[MusicPlayerBridge showMusicPlayerFromNative];

// 播放音乐
NSDictionary *trackInfo = @{
    @"id": @"1",
    @"title": @"Song Title",
    @"artist": @"Artist Name",
    @"url": @"https://example.com/audio.mp3"
};
[MusicPlayerBridge playMusicFromNative:trackInfo];

// 隐藏播放器
[MusicPlayerBridge hideMusicPlayerFromNative];
```

### 3. 测试页面

#### MusicPlayerTest页面
访问 `MusicPlayerTest` 页面可以测试基本功能：
- 设置播放列表
- 播放控制
- 显示/隐藏播放器
- 添加曲目

#### NetworkAudioTest页面
访问 `NetworkAudioTest` 页面可以测试网络音频播放：
- 播放单个网络音频
- 播放网络音频列表
- 查看测试音频URL
- 播放状态监控

#### DollPanel页面
在 `DollPanel` 页面的音频清单中：
- 点击播放按钮播放网络音频
- 支持播放列表功能
- 显示播放器状态

## 配置说明

### 当前配置

- 使用 `MockAudioService` 进行UI测试
- 支持基本的播放控制模拟
- 进度条使用 `@react-native-community/slider`

### 切换到真实音频播放

在 `src/contexts/MusicPlayerContext.tsx` 中修改：

```typescript
// 将此行
const USE_MOCK_SERVICE = true;
// 改为
const USE_MOCK_SERVICE = false;
```

## 依赖项

- `react-native-track-player`: 音频播放核心库
- `@react-native-community/slider`: 进度条组件
- `react-native-safe-area-context`: 安全区域支持

## iOS权限配置

已在 `Info.plist` 中添加：
- `UIBackgroundModes`: 后台音频播放
- `NSMicrophoneUsageDescription`: 麦克风权限
- `NSAppleMusicUsageDescription`: 音乐库访问权限

## 下一步开发建议

1. **音频文件支持**
   - 添加本地音频文件支持
   - 实现音频文件缓存机制

2. **UI优化**
   - 添加加载状态指示器
   - 实现更丰富的动画效果
   - 支持主题切换

3. **功能扩展**
   - 添加播放历史记录
   - 实现收藏功能
   - 支持播放列表保存

4. **性能优化**
   - 优化内存使用
   - 实现音频预加载
   - 添加错误重试机制

## 故障排除

### 常见问题

1. **播放器不显示**
   - 检查 `MusicPlayerProvider` 是否正确包装App
   - 确认 `showPlayer()` 被调用

2. **音频无法播放**
   - 检查音频URL是否有效
   - 确认iOS权限配置正确
   - 查看控制台错误信息

3. **进度条不响应**
   - 确认Slider组件正确导入
   - 检查事件处理函数绑定

### 调试技巧

- 查看控制台日志，所有操作都有详细日志输出
- 使用测试页面验证各项功能
- 检查React DevTools中的Context状态

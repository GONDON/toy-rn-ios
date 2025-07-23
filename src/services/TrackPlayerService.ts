/**
 * TrackPlayer服务初始化
 * 处理TrackPlayer的全局初始化和事件监听
 */

import TrackPlayer, { Event, State, Capability } from 'react-native-track-player';

class TrackPlayerService {
  private static instance: TrackPlayerService;
  private isSetup = false;

  static getInstance(): TrackPlayerService {
    if (!TrackPlayerService.instance) {
      TrackPlayerService.instance = new TrackPlayerService();
    }
    return TrackPlayerService.instance;
  }

  async setupPlayer(): Promise<void> {
    if (this.isSetup) {
      return;
    }

    try {
      await TrackPlayer.setupPlayer({
        maxCacheSize: 1024 * 10, // 10MB
      });

      await TrackPlayer.updateOptions({
        // 播放控制能力
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
          Capability.Stop,
        ],

        // 紧凑模式下的控制能力
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],

        // 进度更新间隔 (秒) - 增加间隔减少卡顿
        progressUpdateEventInterval: 0.5,
      });

      this.isSetup = true;
      console.log('🎵 TrackPlayer setup completed');
    } catch (error) {
      console.error('❌ TrackPlayer setup failed:', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      await TrackPlayer.destroy();
      this.isSetup = false;
      console.log('🎵 TrackPlayer destroyed');
    } catch (error) {
      console.error('❌ TrackPlayer destroy failed:', error);
    }
  }

  isPlayerSetup(): boolean {
    return this.isSetup;
  }
}

export default TrackPlayerService;

// TrackPlayer事件处理函数
export const TrackPlayerEventHandler = async (event: any) => {
  console.log('🎵 TrackPlayer Event:', event);

  switch (event.type) {
    case Event.PlaybackState:
      console.log('🎵 Playback state changed:', event.state);
      break;

    case Event.PlaybackTrackChanged:
      console.log('🎵 Track changed:', event.track);
      break;

    case Event.PlaybackQueueEnded:
      console.log('🎵 Queue ended');
      break;

    case Event.PlaybackError:
      console.error('❌ Playback error:', event.error);
      break;

    case Event.RemotePlay:
      console.log('🎵 Remote play');
      await TrackPlayer.play();
      break;

    case Event.RemotePause:
      console.log('🎵 Remote pause');
      await TrackPlayer.pause();
      break;

    case Event.RemoteNext:
      console.log('🎵 Remote next');
      await TrackPlayer.skipToNext();
      break;

    case Event.RemotePrevious:
      console.log('🎵 Remote previous');
      await TrackPlayer.skipToPrevious();
      break;

    case Event.RemoteSeek:
      console.log('🎵 Remote seek:', event.position);
      await TrackPlayer.seekTo(event.position);
      break;

    case Event.RemoteStop:
      console.log('🎵 Remote stop');
      await TrackPlayer.stop();
      break;

    default:
      console.log('🎵 Unhandled event:', event.type);
      break;
  }
};

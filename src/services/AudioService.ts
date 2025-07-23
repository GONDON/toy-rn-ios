/**
 * 音频播放服务
 * 基于react-native-track-player的封装
 */

import TrackPlayer, {
  Capability,
  Event,
  RepeatMode as TPRepeatMode,
  State,
  Track as TPTrack,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import { Track, RepeatMode } from '../types/MusicPlayer';
import TrackPlayerService from './TrackPlayerService';

class AudioService {
  private static instance: AudioService;
  private isInitialized = false;
  private listeners: Map<string, Function[]> = new Map();
  private trackPlayerService: TrackPlayerService;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  constructor() {
    this.trackPlayerService = TrackPlayerService.getInstance();
  }

  /**
   * 初始化音频播放器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.trackPlayerService.setupPlayer();
      this.isInitialized = true;
      console.log('🎵 AudioService initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AudioService:', error);
      throw error;
    }
  }

  /**
   * 设置播放列表
   */
  async setPlaylist(tracks: Track[], startIndex: number = 0): Promise<void> {
    try {
      await this.initialize();

      // 转换为TrackPlayer格式
      const tpTracks: TPTrack[] = tracks.map((track) => ({
        id: track.id,
        url: track.url,
        title: track.title,
        artist: track.artist || 'Unknown Artist',
        artwork: track.artwork,
        duration: track.duration,
      }));

      await TrackPlayer.reset();
      await TrackPlayer.add(tpTracks);

      if (startIndex > 0 && startIndex < tracks.length) {
        await TrackPlayer.skip(startIndex);
      }

      this.emit('playlistChanged', { tracks, startIndex });
    } catch (error) {
      console.error('❌ Failed to set playlist:', error);
      throw error;
    }
  }

  /**
   * 播放
   */
  async play(): Promise<void> {
    try {
      await this.initialize();
      await TrackPlayer.play();
      this.emit('playbackStateChanged', { isPlaying: true });
    } catch (error) {
      console.error('❌ Failed to play:', error);
      throw error;
    }
  }

  /**
   * 暂停
   */
  async pause(): Promise<void> {
    try {
      await TrackPlayer.pause();
      this.emit('playbackStateChanged', { isPlaying: false });
    } catch (error) {
      console.error('❌ Failed to pause:', error);
      throw error;
    }
  }

  /**
   * 停止
   */
  async stop(): Promise<void> {
    try {
      await TrackPlayer.stop();
      this.emit('playbackStateChanged', { isPlaying: false });
    } catch (error) {
      console.error('❌ Failed to stop:', error);
      throw error;
    }
  }

  /**
   * 下一首
   */
  async next(): Promise<void> {
    try {
      await TrackPlayer.skipToNext();
      this.emit('trackChanged');
    } catch (error) {
      console.error('❌ Failed to skip to next:', error);
      throw error;
    }
  }

  /**
   * 上一首
   */
  async previous(): Promise<void> {
    try {
      await TrackPlayer.skipToPrevious();
      this.emit('trackChanged');
    } catch (error) {
      console.error('❌ Failed to skip to previous:', error);
      throw error;
    }
  }

  /**
   * 跳转到指定位置
   */
  async seekTo(position: number): Promise<void> {
    try {
      await this.initialize(); // 确保播放器已初始化
      await TrackPlayer.seekTo(position);
      this.emit('positionChanged', { position });
    } catch (error) {
      console.error('❌ Failed to seek:', error);
      throw error;
    }
  }

  /**
   * 设置音量
   */
  async setVolume(volume: number): Promise<void> {
    try {
      await TrackPlayer.setVolume(Math.max(0, Math.min(1, volume)));
      this.emit('volumeChanged', { volume });
    } catch (error) {
      console.error('❌ Failed to set volume:', error);
      throw error;
    }
  }

  /**
   * 设置重复模式
   */
  async setRepeatMode(mode: RepeatMode): Promise<void> {
    try {
      let tpMode: TPRepeatMode;
      switch (mode) {
        case RepeatMode.OFF:
          tpMode = TPRepeatMode.Off;
          break;
        case RepeatMode.TRACK:
          tpMode = TPRepeatMode.Track;
          break;
        case RepeatMode.QUEUE:
          tpMode = TPRepeatMode.Queue;
          break;
        default:
          tpMode = TPRepeatMode.Off;
      }

      await TrackPlayer.setRepeatMode(tpMode);
      this.emit('repeatModeChanged', { mode });
    } catch (error) {
      console.error('❌ Failed to set repeat mode:', error);
      throw error;
    }
  }

  /**
   * 获取当前播放状态
   */
  async getPlaybackState(): Promise<any> {
    try {
      const state = await TrackPlayer.getPlaybackState();
      const progress = await TrackPlayer.getProgress();
      const currentTrack = await TrackPlayer.getActiveTrack();

      return {
        state,
        progress,
        currentTrack,
      };
    } catch (error) {
      console.error('❌ Failed to get playback state:', error);
      return null;
    }
  }

  /**
   * 事件监听
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * 移除事件监听
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * 清理资源
   */
  async destroy(): Promise<void> {
    try {
      await TrackPlayer.destroy();
      this.listeners.clear();
      this.isInitialized = false;
      console.log('🎵 AudioService destroyed');
    } catch (error) {
      console.error('❌ Failed to destroy AudioService:', error);
    }
  }
}

export default AudioService;

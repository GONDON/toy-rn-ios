/**
 * 模拟音频播放服务
 * 用于在TrackPlayer未完全配置时进行UI测试
 */

import { Track, RepeatMode } from '../types/MusicPlayer';

class MockAudioService {
  private static instance: MockAudioService;
  private isInitialized = false;
  private listeners: Map<string, Function[]> = new Map();
  private currentTrack: Track | null = null;
  private playlist: Track[] = [];
  private currentIndex = 0;
  private isPlaying = false;
  private currentTime = 0;
  private duration = 0;
  private progressTimer: NodeJS.Timeout | null = null;

  static getInstance(): MockAudioService {
    if (!MockAudioService.instance) {
      MockAudioService.instance = new MockAudioService();
    }
    return MockAudioService.instance;
  }

  /**
   * 初始化音频播放器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    console.log('🎵 MockAudioService initialized successfully');
  }

  /**
   * 设置播放列表
   */
  async setPlaylist(tracks: Track[], startIndex: number = 0): Promise<void> {
    try {
      await this.initialize();
      
      this.playlist = tracks;
      this.currentIndex = startIndex;
      
      if (tracks.length > 0 && startIndex < tracks.length) {
        this.currentTrack = tracks[startIndex];
        this.duration = this.currentTrack.duration || 0;
        this.currentTime = 0;
      }

      this.emit('playlistChanged', { tracks, startIndex });
      this.emit('trackChanged');
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
      this.isPlaying = true;
      this.startProgressTimer();
      this.emit('playbackStateChanged', { isPlaying: true });
      console.log('🎵 Mock play started');
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
      this.isPlaying = false;
      this.stopProgressTimer();
      this.emit('playbackStateChanged', { isPlaying: false });
      console.log('🎵 Mock play paused');
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
      this.isPlaying = false;
      this.currentTime = 0;
      this.stopProgressTimer();
      this.emit('playbackStateChanged', { isPlaying: false });
      console.log('🎵 Mock play stopped');
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
      if (this.currentIndex < this.playlist.length - 1) {
        this.currentIndex++;
        this.currentTrack = this.playlist[this.currentIndex];
        this.duration = this.currentTrack.duration || 0;
        this.currentTime = 0;
        this.emit('trackChanged');
        console.log('🎵 Mock next track:', this.currentTrack.title);
      }
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
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.currentTrack = this.playlist[this.currentIndex];
        this.duration = this.currentTrack.duration || 0;
        this.currentTime = 0;
        this.emit('trackChanged');
        console.log('🎵 Mock previous track:', this.currentTrack.title);
      }
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
      this.currentTime = Math.max(0, Math.min(this.duration, position));
      this.emit('positionChanged', { position: this.currentTime });
      console.log('🎵 Mock seek to:', this.currentTime);
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
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.emit('volumeChanged', { volume: clampedVolume });
      console.log('🎵 Mock volume set to:', clampedVolume);
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
      this.emit('repeatModeChanged', { mode });
      console.log('🎵 Mock repeat mode set to:', mode);
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
      return {
        state: this.isPlaying ? 'playing' : 'paused',
        progress: {
          position: this.currentTime,
          duration: this.duration,
        },
        currentTrack: this.currentTrack,
      };
    } catch (error) {
      console.error('❌ Failed to get playback state:', error);
      return null;
    }
  }

  /**
   * 进度计时器
   */
  private startProgressTimer(): void {
    this.stopProgressTimer();
    this.progressTimer = setInterval(() => {
      if (this.isPlaying && this.duration > 0) {
        this.currentTime += 1;
        if (this.currentTime >= this.duration) {
          // 模拟播放结束，自动下一首
          this.currentTime = this.duration;
          this.next();
        }
        this.emit('progressChanged', { 
          currentTime: this.currentTime, 
          duration: this.duration 
        });
      }
    }, 1000);
  }

  private stopProgressTimer(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
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
      this.stopProgressTimer();
      this.listeners.clear();
      this.isInitialized = false;
      console.log('🎵 MockAudioService destroyed');
    } catch (error) {
      console.error('❌ Failed to destroy MockAudioService:', error);
    }
  }
}

export default MockAudioService;

/**
 * 音乐播放器桥接服务
 * 处理iOS原生端与RN端的通信
 */

import { NativeModules, NativeEventEmitter, DeviceEventEmitter } from 'react-native';

const { MusicPlayerBridge: NativeMusicPlayerBridge } = NativeModules;

interface Track {
  id: string;
  title: string;
  artist?: string;
  artwork?: string;
  url: string;
  duration?: number;
}

interface PlaybackStateEvent {
  action: 'play' | 'pause' | 'stop' | 'next' | 'previous';
  trackId?: string;
}

interface PlaylistChangedEvent {
  tracks?: Track[];
  startIndex?: number;
  action?: 'add';
  track?: Track;
}

interface PlayerVisibilityEvent {
  isVisible: boolean;
}

class MusicPlayerBridgeService {
  private static instance: MusicPlayerBridgeService;
  private eventEmitter: NativeEventEmitter | null = null;
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): MusicPlayerBridgeService {
    if (!MusicPlayerBridgeService.instance) {
      MusicPlayerBridgeService.instance = new MusicPlayerBridgeService();
    }
    return MusicPlayerBridgeService.instance;
  }

  constructor() {
    this.initializeEventEmitter();
    this.setupEventListeners();
  }

  private initializeEventEmitter() {
    if (NativeMusicPlayerBridge) {
      this.eventEmitter = new NativeEventEmitter(NativeMusicPlayerBridge);
    }
  }

  private setupEventListeners() {
    if (!this.eventEmitter) {
      console.warn('⚠️ MusicPlayerBridge native module not available - using mock mode');
      return;
    }

    // 监听播放状态变化
    this.eventEmitter.addListener('onPlaybackStateChanged', (event: PlaybackStateEvent) => {
      console.log('🎵 [Bridge] Playback state changed:', event);
      this.emit('playbackStateChanged', event);
    });

    // 监听曲目变化
    this.eventEmitter.addListener('onTrackChanged', (event: any) => {
      console.log('🎵 [Bridge] Track changed:', event);
      this.emit('trackChanged', event);
    });

    // 监听播放列表变化
    this.eventEmitter.addListener('onPlaylistChanged', (event: PlaylistChangedEvent) => {
      console.log('🎵 [Bridge] Playlist changed:', event);
      this.emit('playlistChanged', event);
    });

    // 监听播放器可见性变化
    this.eventEmitter.addListener('onPlayerVisibilityChanged', (event: PlayerVisibilityEvent) => {
      console.log('🎵 [Bridge] Player visibility changed:', event);
      this.emit('playerVisibilityChanged', event);
    });
  }

  // 向原生端发送命令
  async showPlayer(): Promise<void> {
    if (NativeMusicPlayerBridge?.showPlayer) {
      await NativeMusicPlayerBridge.showPlayer();
    }
  }

  async hidePlayer(): Promise<void> {
    if (NativeMusicPlayerBridge?.hidePlayer) {
      await NativeMusicPlayerBridge.hidePlayer();
    }
  }

  async playTrack(trackId: string): Promise<void> {
    if (NativeMusicPlayerBridge?.playTrack) {
      await NativeMusicPlayerBridge.playTrack(trackId);
    }
  }

  async pausePlayer(): Promise<void> {
    if (NativeMusicPlayerBridge?.pausePlayer) {
      await NativeMusicPlayerBridge.pausePlayer();
    }
  }

  async stopPlayer(): Promise<void> {
    if (NativeMusicPlayerBridge?.stopPlayer) {
      await NativeMusicPlayerBridge.stopPlayer();
    }
  }

  async nextTrack(): Promise<void> {
    if (NativeMusicPlayerBridge?.nextTrack) {
      await NativeMusicPlayerBridge.nextTrack();
    }
  }

  async previousTrack(): Promise<void> {
    if (NativeMusicPlayerBridge?.previousTrack) {
      await NativeMusicPlayerBridge.previousTrack();
    }
  }

  async setPlaylist(tracks: Track[], startIndex: number = 0): Promise<void> {
    if (NativeMusicPlayerBridge?.setPlaylist) {
      await NativeMusicPlayerBridge.setPlaylist(tracks, startIndex);
    }
  }

  async addTrack(track: Track): Promise<void> {
    if (NativeMusicPlayerBridge?.addTrack) {
      await NativeMusicPlayerBridge.addTrack(track);
    }
  }

  async getPlaybackState(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (NativeMusicPlayerBridge?.getPlaybackState) {
        NativeMusicPlayerBridge.getPlaybackState((state: any) => {
          resolve(state);
        });
      } else {
        reject(new Error('Native bridge not available'));
      }
    });
  }

  // 事件监听
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // 清理资源
  destroy(): void {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners('onPlaybackStateChanged');
      this.eventEmitter.removeAllListeners('onTrackChanged');
      this.eventEmitter.removeAllListeners('onPlaylistChanged');
      this.eventEmitter.removeAllListeners('onPlayerVisibilityChanged');
    }
    this.listeners.clear();
  }
}

export default MusicPlayerBridgeService;

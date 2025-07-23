/**
 * 音乐播放器相关类型定义
 */

export interface Track {
  id: string;
  title: string;
  artist?: string;
  artwork?: string;
  url: string;
  duration?: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  isBuffering: boolean;
  volume: number;
  repeatMode: RepeatMode;
  shuffleMode: boolean;
}

export enum RepeatMode {
  OFF = 'off',
  TRACK = 'track',
  QUEUE = 'queue',
}

export interface MusicPlayerContextType {
  // 播放状态
  playbackState: PlaybackState;
  
  // 播放列表
  playlist: Track[];
  currentIndex: number;
  
  // 播放控制方法
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  
  // 播放列表管理
  setPlaylist: (tracks: Track[], startIndex?: number) => Promise<void>;
  addTrack: (track: Track) => Promise<void>;
  removeTrack: (trackId: string) => Promise<void>;
  
  // 播放模式
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  
  // UI控制
  isVisible: boolean;
  showPlayer: () => void;
  hidePlayer: () => void;
  toggleVisibility: () => void;
}

export interface MusicPlayerAction {
  type: 
    | 'SET_PLAYING'
    | 'SET_CURRENT_TRACK'
    | 'SET_CURRENT_TIME'
    | 'SET_DURATION'
    | 'SET_LOADING'
    | 'SET_BUFFERING'
    | 'SET_VOLUME'
    | 'SET_REPEAT_MODE'
    | 'SET_SHUFFLE_MODE'
    | 'SET_PLAYLIST'
    | 'SET_CURRENT_INDEX'
    | 'SET_VISIBILITY'
    | 'RESET_STATE';
  payload?: any;
}

export interface MusicPlayerState {
  playbackState: PlaybackState;
  playlist: Track[];
  currentIndex: number;
  isVisible: boolean;
}

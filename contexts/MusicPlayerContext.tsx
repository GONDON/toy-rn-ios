/**
 * 音乐播放器全局状态管理
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  MusicPlayerContextType,
  MusicPlayerState,
  MusicPlayerAction,
  Track,
  PlaybackState,
  RepeatMode
} from '../types/MusicPlayer';
import AudioService from '../services/AudioService';
import MockAudioService from '../services/MockAudioService';
import MusicPlayerBridgeService from '../services/MusicPlayerBridge';

// 使用Mock服务进行测试，后续可以切换到真实的AudioService
const USE_MOCK_SERVICE = true;

// 初始状态
const initialPlaybackState: PlaybackState = {
  isPlaying: false,
  currentTrack: null,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  isBuffering: false,
  volume: 1.0,
  repeatMode: RepeatMode.OFF,
  shuffleMode: false,
};

const initialState: MusicPlayerState = {
  playbackState: initialPlaybackState,
  playlist: [],
  currentIndex: 0,
  isVisible: false,
};

// Reducer
function musicPlayerReducer(state: MusicPlayerState, action: MusicPlayerAction): MusicPlayerState {
  switch (action.type) {
    case 'SET_PLAYING':
      return {
        ...state,
        playbackState: {
          ...state.playbackState,
          isPlaying: action.payload,
        },
      };

    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        playbackState: {
          ...state.playbackState,
          currentTrack: action.payload,
        },
      };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        playbackState: {
          ...state.playbackState,
          currentTime: action.payload,
        },
      };

    case 'SET_DURATION':
      return {
        ...state,
        playbackState: {
          ...state.playbackState,
          duration: action.payload,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        playbackState: {
          ...state.playbackState,
          isLoading: action.payload,
        },
      };

    case 'SET_BUFFERING':
      return {
        ...state,
        playbackState: {
          ...state.playbackState,
          isBuffering: action.payload,
        },
      };

    case 'SET_VOLUME':
      return {
        ...state,
        playbackState: {
          ...state.playbackState,
          volume: action.payload,
        },
      };

    case 'SET_REPEAT_MODE':
      return {
        ...state,
        playbackState: {
          ...state.playbackState,
          repeatMode: action.payload,
        },
      };

    case 'SET_SHUFFLE_MODE':
      return {
        ...state,
        playbackState: {
          ...state.playbackState,
          shuffleMode: action.payload,
        },
      };

    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload.tracks,
        currentIndex: action.payload.startIndex || 0,
      };

    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        currentIndex: action.payload,
      };

    case 'SET_VISIBILITY':
      return {
        ...state,
        isVisible: action.payload,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context
const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

// Provider组件
interface MusicPlayerProviderProps {
  children: React.ReactNode;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(musicPlayerReducer, initialState);
  const audioService = USE_MOCK_SERVICE ? MockAudioService.getInstance() : AudioService.getInstance();
  const bridgeService = MusicPlayerBridgeService.getInstance();

  // 播放控制方法
  const play = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await audioService.play();
      dispatch({ type: 'SET_PLAYING', payload: true });
    } catch (error) {
      console.error('播放失败:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [audioService]);

  const pause = useCallback(async () => {
    try {
      await audioService.pause();
      dispatch({ type: 'SET_PLAYING', payload: false });
    } catch (error) {
      console.error('暂停失败:', error);
    }
  }, [audioService]);

  const stop = useCallback(async () => {
    try {
      await audioService.stop();
      dispatch({ type: 'SET_PLAYING', payload: false });
      dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
    } catch (error) {
      console.error('停止失败:', error);
    }
  }, [audioService]);

  const next = useCallback(async () => {
    try {
      if (state.currentIndex < state.playlist.length - 1) {
        await audioService.next();
        dispatch({ type: 'SET_CURRENT_INDEX', payload: state.currentIndex + 1 });
      } else if (state.playbackState.repeatMode === RepeatMode.QUEUE) {
        // 循环播放：回到第一首
        await audioService.setPlaylist(state.playlist, 0);
        dispatch({ type: 'SET_CURRENT_INDEX', payload: 0 });
        await audioService.play();
      }
    } catch (error) {
      console.error('下一首失败:', error);
    }
  }, [audioService, state.currentIndex, state.playlist, state.playbackState.repeatMode]);

  const previous = useCallback(async () => {
    try {
      if (state.currentIndex > 0) {
        await audioService.previous();
        dispatch({ type: 'SET_CURRENT_INDEX', payload: state.currentIndex - 1 });
      }
    } catch (error) {
      console.error('上一首失败:', error);
    }
  }, [audioService, state.currentIndex]);

  const seekTo = useCallback(async (position: number) => {
    try {
      await audioService.seekTo(position);
      dispatch({ type: 'SET_CURRENT_TIME', payload: position });
    } catch (error) {
      console.error('跳转失败:', error);
    }
  }, [audioService]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await audioService.setVolume(volume);
      dispatch({ type: 'SET_VOLUME', payload: volume });
    } catch (error) {
      console.error('设置音量失败:', error);
    }
  }, [audioService]);

  const setPlaylist = useCallback(async (tracks: Track[], startIndex: number = 0) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await audioService.setPlaylist(tracks, startIndex);
      dispatch({ type: 'SET_PLAYLIST', payload: { tracks, startIndex } });
      
      if (tracks.length > 0) {
        dispatch({ type: 'SET_CURRENT_TRACK', payload: tracks[startIndex] });
        dispatch({ type: 'SET_DURATION', payload: tracks[startIndex].duration || 0 });
      }
    } catch (error) {
      console.error('设置播放列表失败:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [audioService]);

  const addTrack = useCallback(async (track: Track) => {
    const newPlaylist = [...state.playlist, track];
    dispatch({ type: 'SET_PLAYLIST', payload: { tracks: newPlaylist, startIndex: state.currentIndex } });
  }, [state.playlist, state.currentIndex]);

  const removeTrack = useCallback(async (trackId: string) => {
    const newPlaylist = state.playlist.filter(track => track.id !== trackId);
    dispatch({ type: 'SET_PLAYLIST', payload: { tracks: newPlaylist, startIndex: state.currentIndex } });
  }, [state.playlist, state.currentIndex]);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    audioService.setRepeatMode(mode);
    dispatch({ type: 'SET_REPEAT_MODE', payload: mode });
  }, [audioService]);

  const toggleShuffle = useCallback(() => {
    const newShuffleMode = !state.playbackState.shuffleMode;
    dispatch({ type: 'SET_SHUFFLE_MODE', payload: newShuffleMode });
  }, [state.playbackState.shuffleMode]);

  // UI控制方法
  const showPlayer = useCallback(() => {
    dispatch({ type: 'SET_VISIBILITY', payload: true });
  }, []);

  const hidePlayer = useCallback(() => {
    dispatch({ type: 'SET_VISIBILITY', payload: false });
  }, []);

  const toggleVisibility = useCallback(() => {
    dispatch({ type: 'SET_VISIBILITY', payload: !state.isVisible });
  }, [state.isVisible]);

  // 监听音频服务事件
  useEffect(() => {
    const handlePlaybackStateChanged = (data: any) => {
      dispatch({ type: 'SET_PLAYING', payload: data.isPlaying });
    };

    const handleTrackChanged = () => {
      // 更新当前曲目信息
      audioService.getPlaybackState().then((playbackState) => {
        if (playbackState?.currentTrack) {
          dispatch({ type: 'SET_CURRENT_TRACK', payload: playbackState.currentTrack });
          dispatch({ type: 'SET_DURATION', payload: playbackState.currentTrack.duration || 0 });
        }
      });
    };

    const handleProgressChanged = (data: any) => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: data.currentTime });
      dispatch({ type: 'SET_DURATION', payload: data.duration });
    };

    audioService.on('playbackStateChanged', handlePlaybackStateChanged);
    audioService.on('trackChanged', handleTrackChanged);
    audioService.on('progressChanged', handleProgressChanged);

    return () => {
      audioService.off('playbackStateChanged', handlePlaybackStateChanged);
      audioService.off('trackChanged', handleTrackChanged);
      audioService.off('progressChanged', handleProgressChanged);
    };
  }, [audioService]);

  // 监听桥接服务事件
  useEffect(() => {
    const handleBridgePlaybackStateChanged = (event: any) => {
      console.log('🎵 [Context] Bridge playback state changed:', event);
      switch (event.action) {
        case 'play':
          if (event.trackId) {
            // 播放指定曲目
            const track = state.playlist.find(t => t.id === event.trackId);
            if (track) {
              const index = state.playlist.indexOf(track);
              setPlaylist(state.playlist, index).then(() => play());
            }
          } else {
            play();
          }
          break;
        case 'pause':
          pause();
          break;
        case 'stop':
          stop();
          break;
        case 'next':
          next();
          break;
        case 'previous':
          previous();
          break;
      }
    };

    const handleBridgePlaylistChanged = (event: any) => {
      console.log('🎵 [Context] Bridge playlist changed:', event);
      if (event.tracks && event.startIndex !== undefined) {
        setPlaylist(event.tracks, event.startIndex);
      } else if (event.action === 'add' && event.track) {
        addTrack(event.track);
      }
    };

    const handleBridgePlayerVisibilityChanged = (event: any) => {
      console.log('🎵 [Context] Bridge player visibility changed:', event);
      dispatch({ type: 'SET_VISIBILITY', payload: event.isVisible });
    };

    bridgeService.on('playbackStateChanged', handleBridgePlaybackStateChanged);
    bridgeService.on('playlistChanged', handleBridgePlaylistChanged);
    bridgeService.on('playerVisibilityChanged', handleBridgePlayerVisibilityChanged);

    return () => {
      bridgeService.off('playbackStateChanged', handleBridgePlaybackStateChanged);
      bridgeService.off('playlistChanged', handleBridgePlaylistChanged);
      bridgeService.off('playerVisibilityChanged', handleBridgePlayerVisibilityChanged);
    };
  }, [bridgeService, state.playlist, setPlaylist, addTrack, play, pause, stop, next, previous]);

  const contextValue: MusicPlayerContextType = {
    playbackState: state.playbackState,
    playlist: state.playlist,
    currentIndex: state.currentIndex,
    play,
    pause,
    stop,
    next,
    previous,
    seekTo,
    setVolume,
    setPlaylist,
    addTrack,
    removeTrack,
    setRepeatMode,
    toggleShuffle,
    isVisible: state.isVisible,
    showPlayer,
    hidePlayer,
    toggleVisibility,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

// Hook
export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

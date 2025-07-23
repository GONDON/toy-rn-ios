/*
 * @LastEditors: jizai jizai.zhu@tuya.com
 * @Date: 2025-06-22 16:33:13
 * @LastEditTime: 2025-06-23 21:12:22
 * @FilePath: /demoapp/index.js
 * @Description: 
 */
import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { TrackPlayerEventHandler } from './src/services/TrackPlayerService';

// 注册TrackPlayer事件处理器
TrackPlayer.registerPlaybackService(() => TrackPlayerEventHandler);

// 确保应用正确注册
AppRegistry.registerComponent('HelloWorld', () => App);

// 添加错误处理
if (__DEV__) {
  console.log('App registered successfully');
}

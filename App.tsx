/*
 * @LastEditors: jizai jizai.zhu@tuya.com
 * @Date: 2025-06-22 16:33:33
 * @LastEditTime: 2025-07-15 17:03:05
 * @FilePath: /demoapp/App.tsx
 * @Description: 
 */
// In App.js in a new project

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Creation from './src/pages/Creation';
import AddDoll from './src/pages/AddDoll';
import StoryMachinePanel from './src/pages/StoryMachinePanel';
import DollPanel from './src/pages/DollPanel';
import { MusicPlayerProvider } from './src/contexts/MusicPlayerContext';
import { MusicPlayer } from './src/components/MusicPlayer';

const Stack = createNativeStackNavigator();

export default function App(props: any) {
  // 从iOS传递过来的初始路由和参数
  const initialRoute = props.initialRoute || 'DollPanel';
  const initialParams = props.initialParams || {};

  console.log('🚀 [RN] App启动，初始路由:', initialRoute, '参数:', initialParams);

  return (
    <SafeAreaProvider>
      <MusicPlayerProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="Creation"
              component={Creation}
              initialParams={initialParams}
            />
            <Stack.Screen
              name="Home"
              component={Creation}
              initialParams={initialParams}
            />
            <Stack.Screen
              name="AddDoll"
              component={AddDoll}
            />
            <Stack.Screen
              name="StoryMachinePanel"
              component={StoryMachinePanel}
            />
            <Stack.Screen
              name="DollPanel"
              component={DollPanel}
            />        
          </Stack.Navigator>

          {/* 全局音乐播放器 */}
          <MusicPlayer />
        </NavigationContainer>
      </MusicPlayerProvider>
    </SafeAreaProvider>
  );
}
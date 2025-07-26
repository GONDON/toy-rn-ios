/**
 * 原生模块调试工具
 * 用于检查和调试原生模块的状态
 */

import { NativeModules, Platform } from 'react-native';

// 检查原生模块状态
export function checkNativeModuleStatus() {
  console.log('=== 原生模块调试信息 ===');
  console.log('Platform:', Platform.OS);
  console.log('Platform Version:', Platform.Version);
  
  // 列出所有可用的原生模块
  const availableModules = Object.keys(NativeModules);
  console.log('可用的原生模块数量:', availableModules.length);
  console.log('可用的原生模块列表:', availableModules);
  
  // 检查 DPBridge 模块
  const dpBridge = NativeModules.DPBridge;
  console.log('DPBridge 模块状态:', dpBridge ? '存在' : '不存在');
  
  if (dpBridge) {
    console.log('DPBridge 模块方法:', Object.keys(dpBridge));
  }
  
  // 检查其他可能相关的模块
  const relatedModules = availableModules.filter(name => 
    name.toLowerCase().includes('dp') || 
    name.toLowerCase().includes('bridge') ||
    name.toLowerCase().includes('device')
  );
  
  if (relatedModules.length > 0) {
    console.log('可能相关的模块:', relatedModules);
  }
  
  console.log('=== 调试信息结束 ===');
  
  return {
    platform: Platform.OS,
    platformVersion: Platform.Version,
    availableModules,
    hasDPBridge: !!dpBridge,
    dpBridgeMethods: dpBridge ? Object.keys(dpBridge) : [],
    relatedModules,
  };
}

// 测试原生模块调用
export async function testNativeModuleCalls() {
  console.log('=== 测试原生模块调用 ===');
  
  const dpBridge = NativeModules.DPBridge;
  
  if (!dpBridge) {
    console.log('❌ DPBridge 模块不存在，无法测试');
    return { success: false, error: 'DPBridge 模块不存在' };
  }
  
  const tests = [
    {
      name: 'checkDeviceConnection',
      method: dpBridge.checkDeviceConnection,
    },
    {
      name: 'getDeviceInfo',
      method: dpBridge.getDeviceInfo,
    },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`🧪 测试 ${test.name}...`);
      
      if (typeof test.method !== 'function') {
        console.log(`❌ ${test.name} 不是一个函数`);
        results.push({
          name: test.name,
          success: false,
          error: '不是一个函数',
        });
        continue;
      }
      
      const result = await test.method();
      console.log(`✅ ${test.name} 调用成功:`, result);
      results.push({
        name: test.name,
        success: true,
        result,
      });
    } catch (error) {
      console.log(`❌ ${test.name} 调用失败:`, error);
      results.push({
        name: test.name,
        success: false,
        error: error.message,
      });
    }
  }
  
  console.log('=== 测试结束 ===');
  return { success: true, results };
}

// 创建一个简单的原生模块检查器组件
export function createNativeModuleChecker() {
  return {
    checkStatus: checkNativeModuleStatus,
    testCalls: testNativeModuleCalls,
    
    // 获取调试报告
    getDebugReport: () => {
      const status = checkNativeModuleStatus();
      return {
        timestamp: new Date().toISOString(),
        ...status,
      };
    },
    
    // 检查是否需要创建原生模块
    needsNativeModule: () => {
      return !NativeModules.DPBridge;
    },
    
    // 获取创建原生模块的指导
    getImplementationGuide: () => {
      if (Platform.OS === 'ios') {
        return {
          platform: 'iOS',
          steps: [
            '1. 在 Xcode 中打开 iOS 项目',
            '2. 创建新的 Objective-C 文件: DPBridge.h 和 DPBridge.m',
            '3. 实现 RCTBridgeModule 协议',
            '4. 导出需要的方法到 React Native',
            '5. 重新编译项目',
          ],
          sampleCode: `
// DPBridge.h
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface DPBridge : RCTEventEmitter <RCTBridgeModule>
@end

// DPBridge.m
#import "DPBridge.h"

@implementation DPBridge

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(checkDeviceConnection:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  // 实现设备连接检查逻辑
  resolve(@(NO)); // 暂时返回 false
}

RCT_EXPORT_METHOD(getDeviceInfo:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSDictionary *deviceInfo = @{
    @"deviceId": @"ios_device",
    @"deviceName": @"iOS Device",
    @"firmwareVersion": @"1.0.0",
    @"isConnected": @(NO)
  };
  resolve(deviceInfo);
}

@end
          `,
        };
      } else {
        return {
          platform: 'Android',
          steps: [
            '1. 在 Android Studio 中打开 Android 项目',
            '2. 创建 DPBridgeModule.java',
            '3. 创建 DPBridgePackage.java',
            '4. 在 MainApplication.java 中注册模块',
            '5. 重新编译项目',
          ],
        };
      }
    },
  };
}

// 全局调试器实例
export const nativeModuleDebugger = createNativeModuleChecker();

# 涂鸦设备连接完整指南

## 概述

本指南介绍如何使用基于涂鸦SDK的完整设备连接和DP数据管理系统。系统已经集成了涂鸦智能的BLE设备连接功能，可以真正连接和控制AI故事机硬件设备。

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   DP Bridge     │    │   Tuya SDK      │
│   Components    │◄──►│   (DPBridge)    │◄──►│   (Native)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Device Mgr    │    │   DP Store      │    │   BLE Device    │
│   (useDeviceMgr)│    │   (Zustand)     │    │   (Hardware)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 已实现的功能

### ✅ 涂鸦SDK集成
- **DPBridge.h/m**: 基于涂鸦SDK的原生模块实现
- **ThingSmartBLEKit**: 蓝牙设备连接管理
- **ThingSmartDevice**: 设备控制和DP数据处理
- **自动重连机制**: 设备断线自动重连

### ✅ 设备管理
- **useDeviceManager**: 设备连接管理Hook
- **设备列表获取**: 从涂鸦云获取设备列表
- **自动连接**: 自动连接第一个在线设备
- **状态监控**: 实时监控设备连接状态

### ✅ DP数据处理
- **实时DP同步**: 设备DP数据实时同步到React Native
- **DP数据下发**: 支持单个和批量DP数据下发
- **本地缓存**: DP数据本地缓存和状态管理
- **事件通知**: DP变化事件实时通知

## 使用步骤

### 1. 设置设备信息

首先需要设置要连接的设备信息：

```typescript
import { useDeviceManager } from '../hooks/useDeviceManager';

const deviceManager = useDeviceManager();

// 设置设备信息
const deviceInfo = {
  deviceId: 'your-device-id',
  uuid: 'your-device-uuid',
  productKey: 'your-product-key',
  name: 'AI Story Machine',
  isOnline: true,
};

await deviceManager.setCurrentDeviceInfo(deviceInfo);
```

### 2. 获取设备列表

从涂鸦云获取用户的设备列表：

```typescript
// 获取设备列表（需要涂鸦家庭ID）
const homeId = 123456; // 实际的家庭ID
const devices = await deviceManager.getDeviceList(homeId);
```

### 3. 连接设备

```typescript
// 手动连接指定设备
await deviceManager.connectDevice(deviceInfo);

// 或者自动连接第一个在线设备
await deviceManager.autoConnectFirstOnlineDevice(homeId);
```

### 4. 使用DP数据

```typescript
import { useDP } from '../hooks/useDPManager';
import { DPId } from '../types/dp';

// 使用特定的DP
const battery = useDP(DPId.BATTERY_PERCENTAGE);
const aiChat = useDP(DPId.AI_CONVERSATION);

// 设置DP值
await aiChat.setValue(true);

// 获取DP值
console.log('当前电量:', battery.value);
```

## 完整使用示例

```typescript
import React, { useEffect } from 'react';
import { useDeviceManager } from '../hooks/useDeviceManager';
import { useDPManager } from '../hooks/useDPManager';

function MyComponent() {
  const deviceManager = useDeviceManager();
  const { isDeviceConnected } = useDPManager();

  useEffect(() => {
    // 自动连接设备
    const initDevice = async () => {
      const homeId = 123456; // 从用户配置获取
      const success = await deviceManager.autoConnectFirstOnlineDevice(homeId);

      if (success) {
        console.log('设备连接成功');
      } else {
        console.log('没有找到在线设备');
      }
    };

    initDevice();
  }, []);

  return (
    <View>
      <Text>设备状态: {isDeviceConnected ? '已连接' : '未连接'}</Text>
      {/* 其他UI组件 */}
    </View>
  );
}
```

## 调试和故障排除

### 1. 检查原生模块状态

在开发环境下，点击调试面板的"原生模块"标签：

- ✅ **DPBridge 模块存在**: 原生模块正确安装
- ❌ **DPBridge 模块不存在**: 需要重新安装原生模块

### 2. 查看连接日志

控制台会输出详细的连接日志：

```
[DPBridge] 涂鸦DP桥接模块初始化完成
[DPBridge] 开始连接涂鸦设备 - UUID: xxx
✅ [DPBridge] 涂鸦设备连接成功
[DPBridge] 收到DP数据更新: {"2": 85, "3": 50}
```

### 3. 常见问题解决

**Q: 设备连接失败**
```
❌ [DPBridge] 涂鸦设备连接失败: xxx
```
A: 检查设备UUID和ProductKey是否正确，设备是否在线

**Q: 没有找到设备**
```
[DeviceManager] 没有找到在线设备
```
A: 确保设备已添加到涂鸦账户，且设备处于在线状态

**Q: DP数据发送失败**
```
❌ [DPBridge] DP数据发送失败
```
A: 检查设备连接状态，确保DP ID和值格式正确

## 配置要求

### 1. 涂鸦SDK依赖

确保 `ios/Podfile` 中包含涂鸦SDK：

```ruby
pod 'ThingSmartDeviceKit'
pod 'ThingSmartBLEKit'
pod 'ThingSmartHomeKit'
```

### 2. 权限配置

在 `ios/AIToys/Info.plist` 中添加蓝牙权限：

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>需要蓝牙权限来连接AI故事机设备</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>需要蓝牙权限来连接AI故事机设备</string>
```

### 3. 涂鸦账户配置

确保已在涂鸦开发者平台配置：
- 应用ID和密钥
- 设备产品信息
- 用户账户和家庭

## 下一步开发

1. **集成用户登录**: 获取真实的涂鸦家庭ID
2. **设备配网**: 添加新设备的配网流程
3. **离线处理**: 优化设备离线时的用户体验
4. **错误恢复**: 完善错误处理和恢复机制
5. **性能优化**: 优化DP数据同步性能

## 技术支持

如果遇到问题，请检查：

1. **原生模块**: 使用调试面板检查模块状态
2. **设备状态**: 确认设备在涂鸦App中显示在线
3. **网络连接**: 确保设备和手机网络正常
4. **权限设置**: 检查蓝牙和网络权限
5. **SDK版本**: 确保涂鸦SDK版本兼容

系统现在已经可以真正连接和控制AI故事机硬件设备，实现完整的设备管理和DP数据交互功能。

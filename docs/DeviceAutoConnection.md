# 设备自动连接功能使用指南

## 功能概述

当用户从首页点击设备进入 `StoryMachinePanel` 时，系统会自动执行以下流程：

1. **检查设备在线状态** - 验证设备是否可连接
2. **自动连接设备** - 如果设备离线，尝试建立连接
3. **同步DP数据** - 连接成功后同步设备的所有DP数据
4. **重试机制** - 连接失败时自动重试（最多3次）
5. **状态反馈** - 实时显示连接状态和错误信息

## 实现架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   首页设备点击   │───►│  StoryMachine   │───►│ useDeviceConn   │
│   (Native iOS)  │    │     Panel       │    │     Hook        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   设备信息传递   │    │   连接状态显示   │    │   DPBridge      │
│   (Route Params)│    │   (UI Updates)  │    │   (Native)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 核心组件

### 1. `useDeviceConnection` Hook

**功能**: 管理设备连接的完整生命周期

**主要方法**:
- `autoConnectDevice()` - 自动连接设备
- `checkDeviceOnlineStatus()` - 检查设备状态
- `connectToDevice()` - 连接设备
- `disconnectDevice()` - 断开连接

**状态管理**:
```typescript
interface ConnectionStatus {
  isConnecting: boolean;      // 是否正在连接
  isConnected: boolean;       // 是否已连接
  connectionError: string | null;  // 连接错误信息
  lastConnectionTime: number | null;  // 最后连接时间
}
```

### 2. 设备参数接口

从首页传递的设备信息：
```typescript
interface DeviceConnectionParams {
  deviceId: string;          // 设备ID（必需）
  deviceName: string;        // 设备名称
  uuid?: string;             // 设备UUID
  productId?: string;        // 产品ID
  isOnline?: boolean;        // 在线状态
  dps?: Record<string, any>; // DP数据
}
```

## 使用流程

### 1. 首页设备点击

当用户在首页点击设备时，iOS 原生代码会调用：

```objc
// HomeViewController.m
- (void)navigateToRNPageWithDevice:(ThingSmartDeviceModel *)device {
    [RNNavigationManager navigateToStoryMachinePanelFromViewController:self 
                                                           withDevice:device];
}
```

### 2. 设备信息传递

`RNNavigationManager` 将设备信息传递给 React Native：

```objc
// RNNavigationManager.m
+ (void)navigateToStoryMachinePanelFromViewController:(UIViewController *)viewController 
                                           withDevice:(ThingSmartDeviceModel *)device {
    NSDictionary *deviceDetails = @{
        @"deviceId": device.deviceId,
        @"deviceName": device.name,
        @"uuid": device.uuid,
        @"productId": device.productId,
        @"isOnline": @(device.isOnline),
        @"dps": device.dps ?: @{}
    };
    
    // 导航到 StoryMachinePanel 并传递设备信息
}
```

### 3. 自动连接执行

`StoryMachinePanel` 接收设备信息并自动开始连接：

```typescript
// StoryMachinePanel/index.tsx
const deviceDetails = route.params?.deviceDetails;
const deviceConnectionParams = deviceDetails ? {
  deviceId: deviceDetails.deviceId,
  deviceName: deviceDetails.deviceName,
  uuid: deviceDetails.uuid,
  productId: deviceDetails.productId,
  isOnline: deviceDetails.isOnline,
  dps: deviceDetails.dps,
} : undefined;

// 自动连接
const { isConnecting, isConnected, connectionError } = useDeviceConnection(deviceConnectionParams);
```

### 4. 连接状态显示

UI 会实时显示连接状态：

```typescript
<View style={[
  styles.connectionStatus, 
  isConnecting ? styles.connecting : 
  isConnected ? styles.connected : styles.disconnected
]}>
  <Text>
    {isConnecting ? '连接中...' : 
     isConnected ? '已连接' : '未连接'}
  </Text>
</View>
```

## 连接流程详解

### 1. 状态检查阶段

```typescript
// 1. 检查设备是否已连接
const currentlyConnected = await checkDeviceOnlineStatus(deviceId);

if (currentlyConnected) {
  console.log('设备已连接，无需重新连接');
  return true;
}
```

### 2. 连接建立阶段

```typescript
// 2. 设置设备信息
const setInfoResult = await dpBridge.setDeviceInfo(deviceId, uuid, productKey);

// 3. 连接设备
const connectResult = await dpBridge.connectDevice();

// 4. 同步DP数据
const dpData = await dpBridge.syncAllDPFromDevice();
```

### 3. 重试机制

```typescript
// 连接失败时自动重试
let success = await connectToDevice(deviceId, uuid, productId);

while (!success && connectionAttempts.current < maxRetries) {
  await new Promise(resolve => setTimeout(resolve, retryDelay));
  success = await retryConnection(deviceId, uuid, productId);
}
```

## 错误处理

### 1. 连接错误类型

- **设备离线**: 设备不在线或网络不可达
- **认证失败**: 设备ID、UUID或ProductKey错误
- **超时错误**: 连接超时
- **权限错误**: 没有设备控制权限

### 2. 错误显示

```typescript
{connectionError && (
  <Text style={styles.errorText}>
    {connectionError}
  </Text>
)}
```

### 3. 重试机制

- **最大重试次数**: 3次
- **重试间隔**: 2秒
- **指数退避**: 可选实现

## 用户体验优化

### 1. 连接状态指示

- **连接中**: 显示加载动画和"连接中..."文本
- **已连接**: 显示绿色状态和"已连接"文本
- **连接失败**: 显示红色状态和错误信息

### 2. 进度反馈

```typescript
// 连接过程中的状态更新
console.log('🔍 检查设备在线状态...');
console.log('🔗 开始连接设备...');
console.log('📊 同步DP数据...');
console.log('✅ 设备连接成功！');
```

### 3. 错误恢复

- 提供重试按钮
- 显示具体错误原因
- 提供故障排除建议

## 调试和监控

### 1. 日志输出

所有连接过程都有详细的日志输出：

```
🚀 [DeviceConnection] 开始自动连接流程: AI故事机-客厅
📋 [DeviceConnection] 设备参数: {deviceId: "xxx", uuid: "xxx"}
🔍 [DeviceConnection] 检查设备在线状态: xxx
🔗 [DeviceConnection] 开始连接设备: xxx
📊 [DeviceConnection] DP数据同步成功: 15
✅ [DeviceConnection] 设备连接成功！
```

### 2. 调试面板

在开发环境下，可以通过调试面板查看：
- 连接状态历史
- 错误日志
- 性能统计
- 设备信息

### 3. 性能监控

- 连接耗时统计
- 重试次数记录
- 成功率分析

## 最佳实践

### 1. 设备信息完整性

确保从首页传递完整的设备信息：
- `deviceId` (必需)
- `deviceName` (推荐)
- `uuid` (推荐)
- `productId` (推荐)

### 2. 错误处理

```typescript
try {
  const success = await autoConnectDevice(deviceParams);
  if (!success) {
    // 处理连接失败
  }
} catch (error) {
  // 处理异常
}
```

### 3. 状态同步

确保连接状态与DP Store同步：
```typescript
setDeviceConnected(isConnected);
```

## 故障排除

### 1. 设备连接失败

**可能原因**:
- 设备离线
- 网络问题
- 设备信息错误

**解决方案**:
- 检查设备在涂鸦App中的状态
- 验证网络连接
- 确认设备ID和密钥正确

### 2. DP数据同步失败

**可能原因**:
- 设备权限不足
- DP定义不匹配

**解决方案**:
- 检查设备权限
- 验证DP定义配置

现在您的应用已经具备了完整的设备自动连接功能！🎉

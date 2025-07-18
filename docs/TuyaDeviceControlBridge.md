# 涂鸦智能设备控制React Native桥接模块

## 概述

本模块提供了React Native与涂鸦智能设备控制的iOS桥接功能，允许RN端直接调用涂鸦SDK的设备控制功能。

## 功能特性

- ✅ 设备DP指令下发 (`publishDeviceDps`)
- ✅ 设备状态查询 (`getDeviceStatus`)
- ✅ 设备列表获取 (`getDeviceList`)
- ✅ 完善的错误处理和参数验证
- ✅ TypeScript类型定义
- ✅ 工具类封装常用操作

## 文件结构

```
ios/AIToys/RN/
├── TuyaDeviceControlBridge.h      # 桥接模块头文件
└── TuyaDeviceControlBridge.m      # 桥接模块实现文件

src/types/
└── TuyaDeviceControl.ts           # TypeScript类型定义

src/components/
└── TuyaDeviceControlTest.tsx      # 测试组件

src/examples/
└── TuyaDeviceControlExample.tsx   # 使用示例
```

## 安装配置

### 1. iOS原生配置

确保项目已正确集成涂鸦SDK：

```ruby
# Podfile
pod 'ThingSmartHomeKit', '~> 5.8.0'
```

### 2. 桥接模块注册

桥接模块会自动注册到React Native中，无需额外配置。

### 3. TypeScript支持

在项目中导入类型定义：

```typescript
import { TuyaDeviceControl, DeviceControlUtils } from '../types/TuyaDeviceControl';
```

## API文档

### publishDeviceDps

发布设备DP指令

```typescript
publishDeviceDps(deviceId: string, dps: DpsCommand): Promise<PublishDpsResponse>
```

**参数：**
- `deviceId`: 设备ID
- `dps`: DP指令字典，key为dpId字符串，value为对应的dpValue

**返回值：**
```typescript
{
  success: boolean;
  message: string;
  deviceId: string;
  dps: DpsCommand;
}
```

**示例：**
```typescript
// 控制设备开关
await TuyaDeviceControl.publishDeviceDps('device123', {
  '1': true  // DP ID 1 = 开关，true = 开启
});

// 设置亮度
await TuyaDeviceControl.publishDeviceDps('device123', {
  '2': 500  // DP ID 2 = 亮度，500 = 中等亮度
});
```

### getDeviceStatus

获取设备状态

```typescript
getDeviceStatus(deviceId: string): Promise<DeviceStatus>
```

**参数：**
- `deviceId`: 设备ID

**返回值：**
```typescript
{
  success: boolean;
  deviceId: string;
  name: string;
  isOnline: boolean;
  dps: DpsCommand;
  productId: string;
  uuid: string;
  activeTime: number;
  updateTime: number;
}
```

**示例：**
```typescript
const status = await TuyaDeviceControl.getDeviceStatus('device123');
console.log('设备在线状态:', status.isOnline);
console.log('当前DP状态:', status.dps);
```

### getDeviceList

获取设备列表

```typescript
getDeviceList(homeId: number): Promise<DeviceListResponse>
```

**参数：**
- `homeId`: 家庭ID

**返回值：**
```typescript
{
  success: boolean;
  homeId: number;
  devices: DeviceInfo[];
}
```

**示例：**
```typescript
const response = await TuyaDeviceControl.getDeviceList(1);
console.log('设备数量:', response.devices.length);
```

## 工具类使用

### DeviceControlUtils

提供常用设备控制的便捷方法：

```typescript
// 控制开关
await DeviceControlUtils.controlSwitch('device123', true);

// 控制亮度
await DeviceControlUtils.controlBrightness('device123', 800);

// 控制模式
await DeviceControlUtils.controlMode('device123', 'scene_1');

// 检查设备在线状态
const isOnline = await DeviceControlUtils.isDeviceOnline('device123');
```

## 错误处理

### 错误代码

| 错误代码 | 描述 |
|---------|------|
| `INVALID_DEVICE_ID` | 无效的设备ID |
| `INVALID_DPS` | 无效的DP指令 |
| `INVALID_HOME_ID` | 无效的家庭ID |
| `DEVICE_NOT_FOUND` | 设备未找到 |
| `DEVICE_MODEL_NOT_FOUND` | 设备模型未找到 |
| `HOME_NOT_FOUND` | 家庭未找到 |
| `PUBLISH_DPS_FAILED` | DP指令下发失败 |
| `GET_DEVICE_LIST_FAILED` | 获取设备列表失败 |

### 错误处理示例

```typescript
try {
  await TuyaDeviceControl.publishDeviceDps('device123', { '1': true });
} catch (error) {
  switch (error.code) {
    case 'INVALID_DEVICE_ID':
      console.error('设备ID无效');
      break;
    case 'DEVICE_NOT_FOUND':
      console.error('设备未找到');
      break;
    case 'PUBLISH_DPS_FAILED':
      console.error('DP指令下发失败:', error.message);
      break;
    default:
      console.error('未知错误:', error.message);
  }
}
```

## 常用DP定义

### 通用DP ID

| DP ID | 功能 | 数据类型 | 说明 |
|-------|------|----------|------|
| 1 | 开关 | boolean | true=开启, false=关闭 |
| 2 | 亮度 | number | 0-1000 |
| 3 | 颜色 | string | HSV格式 |
| 4 | 模式 | string | 场景模式 |
| 5 | 温度 | number | 温度值 |
| 6 | 湿度 | number | 湿度值 |

### 数据类型说明

- **布尔型 (bool)**: `true` 或 `false`
- **数值型 (value)**: 数字，如 `100`, `500`
- **枚举型 (enum)**: 字符串，如 `"white"`, `"colour"`
- **字符串型 (string)**: 字符串，如 `"hello"`
- **透传型 (raw)**: 字节数组，如 `[0x01, 0x02, 0x03]`

## 测试

### 使用测试组件

```typescript
import TuyaDeviceControlTest from '../components/TuyaDeviceControlTest';

// 在你的页面中使用
<TuyaDeviceControlTest homeId={1} />
```

### 使用示例组件

```typescript
import TuyaDeviceControlExample from '../examples/TuyaDeviceControlExample';

// 在你的页面中使用
<TuyaDeviceControlExample />
```

## 注意事项

1. **设备在线状态**: 只有在线的设备才能接收DP指令
2. **DP ID映射**: 不同产品的DP ID可能不同，需要根据实际产品定义
3. **数据类型**: 确保DP值的数据类型与设备定义一致
4. **错误处理**: 建议对所有API调用进行错误处理
5. **权限检查**: 确保用户有操作设备的权限

## 调试

### 启用日志

iOS端会自动输出详细的调试日志，包括：
- DP指令下发过程
- 设备状态查询
- 错误信息

### 日志格式

```
🎮 [设备控制] 开始下发DP指令 - 设备ID: device123, DP指令: {"1": true}
✅ [设备控制] DP指令下发成功 - 设备ID: device123
❌ [设备控制] DP指令下发失败 - 设备ID: device123, 错误: 设备离线
```

## 更新日志

### v1.0.0 (2025-07-18)
- ✅ 初始版本发布
- ✅ 实现基础设备控制功能
- ✅ 添加TypeScript类型定义
- ✅ 提供测试和示例组件

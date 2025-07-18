# 涂鸦智能设备控制React Native桥接方案

## 🎯 项目概述

本项目为React Native应用实现了完整的涂鸦智能设备控制iOS桥接方案，允许RN端直接调用涂鸦SDK的设备控制功能。

## ✨ 功能特性

- ✅ **设备DP指令下发** - 支持所有类型的DP指令（布尔型、数值型、枚举型、字符串型、透传型）
- ✅ **设备状态查询** - 实时获取设备在线状态和DP状态
- ✅ **设备列表获取** - 获取家庭下的所有设备信息
- ✅ **完善的错误处理** - 详细的错误代码和错误信息
- ✅ **TypeScript支持** - 完整的类型定义和智能提示
- ✅ **工具类封装** - 常用操作的便捷方法
- ✅ **测试组件** - 完整的测试和示例代码

## 📁 文件结构

```
├── ios/AIToys/RN/
│   ├── TuyaDeviceControlBridge.h      # iOS桥接模块头文件
│   └── TuyaDeviceControlBridge.m      # iOS桥接模块实现文件
├── src/
│   ├── types/
│   │   └── TuyaDeviceControl.ts       # TypeScript类型定义
│   ├── components/
│   │   └── TuyaDeviceControlTest.tsx  # 测试组件
│   └── examples/
│       └── TuyaDeviceControlExample.tsx # 使用示例
├── docs/
│   └── TuyaDeviceControlBridge.md     # 详细文档
└── scripts/
    ├── add_bridge_files.rb            # 自动添加文件到Xcode脚本
    └── add-bridge-files-to-xcode.md   # 手动添加文件说明
```

## 🚀 快速开始

### 1. 添加文件到Xcode项目

#### 方法一：自动添加（推荐）

```bash
# 安装xcodeproj gem
gem install xcodeproj

# 运行自动添加脚本
ruby scripts/add_bridge_files.rb
```

#### 方法二：手动添加

1. 打开Xcode项目：`open ios/AIToys.xcworkspace`
2. 在项目导航器中找到 `AIToys` -> `RN` 文件夹
3. 右键选择 "Add Files to 'AIToys'"
4. 添加以下文件：
   - `ios/AIToys/RN/TuyaDeviceControlBridge.h`
   - `ios/AIToys/RN/TuyaDeviceControlBridge.m`

### 2. 编译验证

```bash
# 编译iOS项目
cd ios && xcodebuild -workspace AIToys.xcworkspace -scheme AIToys -sdk iphonesimulator
```

### 3. 在RN中使用

```typescript
import { TuyaDeviceControl, DeviceControlUtils } from '../types/TuyaDeviceControl';

// 控制设备开关
await DeviceControlUtils.controlSwitch('your_device_id', true);

// 获取设备状态
const status = await TuyaDeviceControl.getDeviceStatus('your_device_id');
console.log('设备在线:', status.isOnline);
```

## 📖 API文档

### 核心方法

#### publishDeviceDps
```typescript
publishDeviceDps(deviceId: string, dps: DpsCommand): Promise<PublishDpsResponse>
```
发布设备DP指令，支持所有DP类型。

#### getDeviceStatus
```typescript
getDeviceStatus(deviceId: string): Promise<DeviceStatus>
```
获取设备当前状态，包括在线状态和所有DP值。

#### getDeviceList
```typescript
getDeviceList(homeId: number): Promise<DeviceListResponse>
```
获取指定家庭下的所有设备列表。

### 工具类方法

```typescript
// 控制开关
await DeviceControlUtils.controlSwitch(deviceId, true);

// 控制亮度
await DeviceControlUtils.controlBrightness(deviceId, 500);

// 控制模式
await DeviceControlUtils.controlMode(deviceId, 'scene_1');

// 检查在线状态
const isOnline = await DeviceControlUtils.isDeviceOnline(deviceId);
```

## 🧪 测试

### 使用测试组件

```typescript
import TuyaDeviceControlTest from '../components/TuyaDeviceControlTest';

// 在你的页面中使用
<TuyaDeviceControlTest homeId={1} />
```

测试组件提供：
- 设备列表加载和选择
- 设备状态查询
- 快捷控制（开关、亮度）
- 自定义DP指令发送
- 实时测试结果显示

### 使用示例组件

```typescript
import TuyaDeviceControlExample from '../examples/TuyaDeviceControlExample';

// 在你的页面中使用
<TuyaDeviceControlExample />
```

## 🔧 常用DP定义

| DP ID | 功能 | 数据类型 | 示例值 |
|-------|------|----------|--------|
| 1 | 开关 | boolean | `true`, `false` |
| 2 | 亮度 | number | `0-1000` |
| 3 | 颜色 | string | `"ffffff"` |
| 4 | 模式 | string | `"white"`, `"colour"` |
| 5 | 温度 | number | `2700-6500` |

## ⚠️ 注意事项

1. **设备在线状态** - 只有在线设备才能接收DP指令
2. **DP ID映射** - 不同产品的DP ID可能不同
3. **数据类型** - 确保DP值类型与设备定义一致
4. **权限检查** - 确保用户有操作设备的权限
5. **错误处理** - 建议对所有API调用进行错误处理

## 🐛 错误处理

### 常见错误代码

| 错误代码 | 描述 | 解决方案 |
|---------|------|----------|
| `INVALID_DEVICE_ID` | 设备ID无效 | 检查设备ID格式 |
| `DEVICE_NOT_FOUND` | 设备未找到 | 确认设备已添加到家庭 |
| `PUBLISH_DPS_FAILED` | DP指令下发失败 | 检查设备在线状态和DP格式 |

### 错误处理示例

```typescript
try {
  await TuyaDeviceControl.publishDeviceDps(deviceId, { '1': true });
} catch (error) {
  switch (error.code) {
    case 'DEVICE_NOT_FOUND':
      Alert.alert('错误', '设备未找到，请检查设备是否已添加');
      break;
    case 'PUBLISH_DPS_FAILED':
      Alert.alert('错误', '控制失败，请检查设备是否在线');
      break;
    default:
      Alert.alert('错误', error.message);
  }
}
```

## 📝 调试

### iOS端日志

```
🎮 [设备控制] 开始下发DP指令 - 设备ID: device123, DP指令: {"1": true}
✅ [设备控制] DP指令下发成功 - 设备ID: device123
📊 [设备状态] 开始查询设备状态 - 设备ID: device123
✅ [设备状态] 设备状态查询成功 - 设备ID: device123
```

### RN端调试

```typescript
// 启用详细日志
console.log('TuyaDeviceControl模块:', TuyaDeviceControl);

// 测试模块可用性
if (TuyaDeviceControl) {
  console.log('✅ 桥接模块加载成功');
} else {
  console.log('❌ 桥接模块加载失败');
}
```

## 🔄 更新日志

### v1.0.0 (2025-07-18)
- ✅ 初始版本发布
- ✅ 实现基础设备控制功能
- ✅ 添加TypeScript类型定义
- ✅ 提供测试和示例组件
- ✅ 完善的错误处理机制
- ✅ 详细的文档和使用说明

## 📞 技术支持

如果在使用过程中遇到问题，请：

1. 查看详细文档：`docs/TuyaDeviceControlBridge.md`
2. 运行测试组件验证功能
3. 检查Xcode控制台日志
4. 确认涂鸦SDK版本兼容性

## 🎉 完成

恭喜！你已经成功实现了React Native与涂鸦智能设备控制的完整桥接方案。现在可以在RN应用中自由控制涂鸦智能设备了！

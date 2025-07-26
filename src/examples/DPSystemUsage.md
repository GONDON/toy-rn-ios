# DP 系统使用指南

本文档介绍如何使用基于 dps.csv 文件构建的完整 DP（数据点）系统。

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   DP Store      │    │   iOS Bridge    │
│   Components    │◄──►│   (Zustand)     │◄──►│   (Native)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DP Hooks      │    │   DP Utils      │    │   Device        │
│   (useDPManager)│    │   (Validation)  │    │   (Hardware)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 快速开始

### 1. 基本使用

```typescript
import { useDP, useDPManager } from '../hooks/useDPManager';
import { DPId } from '../types/dp';

function MyComponent() {
  // 初始化 DP 管理器
  const { isDeviceConnected } = useDPManager();
  
  // 使用单个 DP
  const battery = useDP(DPId.BATTERY_PERCENTAGE);
  const aiChat = useDP(DPId.AI_CONVERSATION);
  
  // 设置 DP 值
  const handleToggleAI = async () => {
    const result = await aiChat.setValue(!aiChat.value);
    if (!result.success) {
      console.error('设置失败:', result.error);
    }
  };
  
  return (
    <View>
      <Text>设备连接: {isDeviceConnected ? '已连接' : '未连接'}</Text>
      <Text>电量: {battery.value}%</Text>
      <Switch 
        value={aiChat.value} 
        onValueChange={handleToggleAI}
      />
    </View>
  );
}
```

### 2. 批量操作

```typescript
import { useBatchDP } from '../hooks/useDPManager';
import { DPId } from '../types/dp';

function SettingsComponent() {
  const dpIds = [
    DPId.AI_CONVERSATION,
    DPId.LIGHT_PERCENTAGE,
    DPId.MAX_VOLUME_SET,
  ];
  
  const { values, setValues, hasErrors } = useBatchDP(dpIds);
  
  const handleSaveSettings = async () => {
    const newValues = {
      [DPId.AI_CONVERSATION]: true,
      [DPId.LIGHT_PERCENTAGE]: 5,
      [DPId.MAX_VOLUME_SET]: 8,
    };
    
    const results = await setValues(newValues);
    const allSuccess = results.every(r => r.success);
    
    if (allSuccess) {
      console.log('设置保存成功');
    } else {
      console.error('部分设置保存失败');
    }
  };
  
  return (
    <View>
      {hasErrors && <Text style={{color: 'red'}}>有错误发生</Text>}
      <Button title="保存设置" onPress={handleSaveSettings} />
    </View>
  );
}
```

### 3. 监听 DP 变化

```typescript
import { useDPChangeListener } from '../hooks/useDPManager';
import { DPId } from '../types/dp';

function BatteryMonitor() {
  useDPChangeListener(DPId.BATTERY_PERCENTAGE, (dpId, newValue, oldValue) => {
    console.log(`电量从 ${oldValue}% 变为 ${newValue}%`);
    
    if (newValue < 20) {
      Alert.alert('低电量警告', '设备电量不足，请及时充电');
    }
  });
  
  return null; // 这是一个监听组件
}
```

## 高级用法

### 1. 自定义 Hook

```typescript
// 创建专用的设置面板 Hook
function useSettingsPanel() {
  const battery = useBatteryPercentage();
  const aiChat = useAIConversation();
  const brightness = useLightPercentage();
  
  const saveAllSettings = async (settings: any) => {
    const results = await Promise.all([
      aiChat.setValue(settings.aiEnabled),
      brightness.setValue(settings.brightness),
    ]);
    
    return results.every(r => r.success);
  };
  
  return {
    battery: battery.value,
    aiEnabled: aiChat.value,
    brightness: brightness.value,
    saveAllSettings,
    hasErrors: battery.error || aiChat.error || brightness.error,
  };
}
```

### 2. 错误处理

```typescript
import { dpErrorHandler, DPErrorType } from '../utils/dpLogger';

// 添加全局错误处理
dpErrorHandler.addErrorCallback(DPErrorType.DEVICE_OFFLINE, (error) => {
  Alert.alert('设备离线', '设备连接已断开，请检查设备状态');
});

dpErrorHandler.addErrorCallback(DPErrorType.INVALID_VALUE, (error) => {
  console.warn('无效的DP值:', error.message);
});
```

### 3. 性能监控

```typescript
import { dpPerformanceMonitor } from '../utils/dpLogger';

// 监控 DP 操作性能
function performanceAwareOperation() {
  dpPerformanceMonitor.startTimer('myOperation');
  
  // 执行操作
  
  const duration = dpPerformanceMonitor.endTimer('myOperation');
  console.log(`操作耗时: ${duration}ms`);
}
```

## 调试和测试

### 1. 开发环境调试

在开发环境下，StoryMachinePanel 会显示一个"调试"按钮，点击可以打开调试面板：

- **DP数据**: 查看所有 DP 的当前状态和值
- **日志**: 查看系统日志和错误信息
- **测试**: 运行自动化测试验证系统功能
- **性能**: 查看性能统计和监控数据

### 2. 运行测试

```typescript
import { runDPSystemTests } from '../utils/dpTestUtils';

// 运行完整测试套件
runDPSystemTests().then(report => {
  console.log(report);
});
```

### 3. 手动测试

```typescript
import { quickDPTest } from '../utils/dpTestUtils';

// 快速测试
quickDPTest();
```

## 最佳实践

### 1. 错误处理

```typescript
// 总是检查操作结果
const result = await setDPValue(dpId, value);
if (!result.success) {
  // 处理错误
  console.error('操作失败:', result.error);
  return;
}
```

### 2. 类型安全

```typescript
// 使用类型安全的 DP 操作
import { DPId, ChargeStatus } from '../types/dp';

// 正确：使用枚举值
await setDPValue(DPId.CHARGE_STATUS, ChargeStatus.CHARGING);

// 错误：使用字符串字面量
// await setDPValue(4, 'charging');
```

### 3. 性能优化

```typescript
// 批量操作而不是单个操作
const batchValues = {
  [DPId.AI_CONVERSATION]: true,
  [DPId.LIGHT_PERCENTAGE]: 5,
};

// 好：批量设置
await setBatchDPValues(batchValues);

// 不好：逐个设置
// await setDPValue(DPId.AI_CONVERSATION, true);
// await setDPValue(DPId.LIGHT_PERCENTAGE, 5);
```

### 4. 组件设计

```typescript
// 将 DP 逻辑与 UI 逻辑分离
function useComponentLogic() {
  const dpData = useSettingsPanelDPs();
  
  // 业务逻辑
  const handleSave = async () => {
    // ...
  };
  
  return { dpData, handleSave };
}

function MyComponent() {
  const { dpData, handleSave } = useComponentLogic();
  
  // 只关注 UI 渲染
  return (
    <View>
      {/* UI 组件 */}
    </View>
  );
}
```

## 故障排除

### 1. 设备连接问题

```typescript
// 检查设备连接状态
const { isConnected, connect, disconnect } = useDeviceStatus();

if (!isConnected) {
  // 尝试重连
  await connect();
}
```

### 2. DP 值验证失败

```typescript
import { validateDPValue } from '../utils/dpUtils';

// 在设置前验证值
if (!validateDPValue(dpId, value)) {
  console.error('无效的DP值');
  return;
}
```

### 3. 查看日志

```typescript
import { dpLogger } from '../utils/dpLogger';

// 获取错误日志
const errorLogs = dpLogger.getLogs(LogLevel.ERROR);
console.log('错误日志:', errorLogs);
```

## 扩展系统

### 1. 添加新的 DP

1. 在 `dps.csv` 中添加新的 DP 定义
2. 更新 `src/types/dp.ts` 中的类型定义
3. 更新 `src/config/dpDefinitions.ts` 中的配置
4. 如需要，添加专用的 Hook

### 2. 自定义验证

```typescript
// 在 dpUtils.ts 中添加自定义验证逻辑
function validateCustomDP(value: any): boolean {
  // 自定义验证逻辑
  return true;
}
```

这个 DP 系统提供了完整的类型安全、错误处理、性能监控和调试功能，可以满足复杂的设备控制需求。

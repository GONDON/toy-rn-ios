# 将桥接文件添加到Xcode项目

## 手动添加步骤

由于需要将新创建的桥接文件添加到Xcode项目中，请按照以下步骤操作：

### 1. 打开Xcode项目

```bash
open ios/AIToys.xcworkspace
```

### 2. 添加桥接文件

1. 在Xcode项目导航器中，找到 `AIToys` -> `RN` 文件夹
2. 右键点击 `RN` 文件夹，选择 "Add Files to 'AIToys'"
3. 导航到项目根目录下的 `ios/AIToys/RN/` 文件夹
4. 选择以下文件：
   - `TuyaDeviceControlBridge.h`
   - `TuyaDeviceControlBridge.m`
5. 确保 "Add to target" 中勾选了 `AIToys`
6. 点击 "Add" 按钮

### 3. 验证文件添加

添加完成后，你应该能在Xcode项目导航器中看到：

```
AIToys
└── RN
    ├── RNNavigationTest.m
    ├── ReactViewController.h
    ├── ReactViewController.m
    ├── TuyaDeviceControlBridge.h    ← 新添加
    └── TuyaDeviceControlBridge.m    ← 新添加
```

### 4. 编译测试

1. 选择一个iOS模拟器或真机
2. 按 `Cmd + B` 编译项目
3. 确保没有编译错误

## 自动化脚本（可选）

如果你熟悉pbxproj文件格式，也可以使用以下命令自动添加：

```bash
# 安装xcodeproj gem（如果还没安装）
gem install xcodeproj

# 运行添加脚本
ruby scripts/add_bridge_files.rb
```

## 验证桥接模块

### 1. 在React Native中测试

```typescript
import { TuyaDeviceControl } from '../types/TuyaDeviceControl';

// 测试模块是否可用
console.log('TuyaDeviceControl模块:', TuyaDeviceControl);
```

### 2. 查看日志

在Xcode控制台中应该能看到类似的日志：

```
🎮 [设备控制] 模块已加载
```

## 常见问题

### Q: 编译时提示找不到头文件
A: 确保头文件已正确添加到项目中，并且路径正确。

### Q: 运行时提示模块未找到
A: 检查模块名称是否正确，确保使用 `TuyaDeviceControl` 而不是其他名称。

### Q: DP指令下发失败
A: 检查设备是否在线，DP ID和数据类型是否正确。

## 下一步

文件添加完成后，你可以：

1. 使用测试组件验证功能：`src/components/TuyaDeviceControlTest.tsx`
2. 参考使用示例：`src/examples/TuyaDeviceControlExample.tsx`
3. 查看完整文档：`docs/TuyaDeviceControlBridge.md`

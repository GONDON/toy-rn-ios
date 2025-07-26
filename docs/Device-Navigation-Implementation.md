# RN页面导航系统实现文档

## 概述

本文档描述了项目中统一的React Native页面导航系统，包括从iOS原生代码跳转到RN页面的通用解决方案，支持动态路由和参数传递。

## 实现的功能

1. **统一导航管理**: 创建了`RNNavigationManager`统一管理所有RN页面跳转
2. **动态路由支持**: 支持根据目标功能动态指定路由名称（如`StoryMachinePanel`、`Creation`等）
3. **灵活参数传递**: 支持向RN页面传递任意参数，包括设备详情、来源标识等
4. **特定页面快捷方法**: 为常用页面提供专门的跳转方法
5. **向后兼容**: 保持现有代码的兼容性，同时提供更好的扩展性
6. **调试支持**: 完整的日志输出，便于开发和调试

## 修改的文件

### iOS端

#### 1. 新增文件
- `ios/AIToys/RN/RNNavigationManager.h` - 导航管理器头文件
- `ios/AIToys/RN/RNNavigationManager.m` - 导航管理器实现文件
- `ios/AIToys/RN/RNNavigationExample.m` - 使用示例文件

#### 2. `ios/AIToys/Home/HomeViewController.h`
- 添加了通用的`navigateToRNPage:withParams:`方法声明
- 保留了`navigateToRNPageWithDevice:`方法声明（向后兼容）

#### 3. `ios/AIToys/Home/HomeViewController.m`
- 导入了`RNNavigationManager.h`
- 在`tableView:cellForRowAtIndexPath:`中为`HomeDeviceCell`添加了`itemClickBlock`回调
- 重构了跳转方法，使用`RNNavigationManager`进行统一管理
- 简化了代码，提高了可维护性

#### 4. `ios/AIToys/BaseClass/MyTabBarController.m`
- 导入了`RNNavigationManager.h`
- 为创作页面添加了来源参数传递

#### 5. `ios/AIToys/Home/MusicPlayerExample.m`
- 更新了测试页面跳转，添加了参数传递

### React Native端

#### 1. `src/types/navigation.d.ts`
- 更新了`StoryMachinePanel`的路由参数类型定义
- 添加了`deviceDetails`、`deviceId`、`deviceName`、`source`等参数类型

#### 2. `src/pages/StoryMachinePanel/index.tsx`
- 添加了`useRoute`和`useEffect`来接收路由参数
- 实现了设备详情参数的接收和控制台输出
- 添加了开发模式下的调试信息显示区域
- 动态显示设备名称作为页面标题

## 传递的设备详情数据

从iOS传递给RN的设备详情包含以下信息：

```objc
// 基本信息
deviceId        // 设备ID
deviceName      // 设备名称
productId       // 产品ID
uuid           // 设备UUID
localKey       // 本地密钥

// 状态信息
isOnline       // 是否在线
isCloudOnline  // 云端是否在线
isLocalOnline  // 本地是否在线

// 设备属性
dps           // 设备数据点
schemaArray   // 设备功能点定义

// 其他信息
iconUrl       // 设备图标URL
roomId        // 房间ID
timezoneId    // 时区ID
source        // 来源页面标识
timestamp     // 时间戳
```

## 使用方法

### 1. 通用导航方法

```objc
// 基本用法：跳转到指定RN页面
[RNNavigationManager navigateFromViewController:self toRoute:@"StoryMachinePanel"];

// 带参数跳转
NSDictionary *params = @{
    @"userId": @"12345",
    @"source": @"home-page"
};
[RNNavigationManager navigateFromViewController:self
                                        toRoute:@"Creation"
                                     withParams:params];

// 控制动画
[RNNavigationManager navigateFromViewController:self
                                        toRoute:@"AddDoll"
                                     withParams:nil
                                       animated:NO];
```

### 2. 特定页面快捷方法

```objc
// 跳转到故事机面板
ThingSmartDeviceModel *device = self.deviceList[index];
[RNNavigationManager navigateToStoryMachinePanelFromViewController:self
                                                         withDevice:device];

// 跳转到公仔面板
[RNNavigationManager navigateToDollPanelFromViewController:self
                                                withDollId:@"doll123"];

// 跳转到创作页面
[RNNavigationManager navigateToCreationFromViewController:self
                                               withSource:@"main-menu"];

// 跳转到添加公仔页面
[RNNavigationManager navigateToAddDollFromViewController:self];
```

### 3. 支持的路由名称

- `StoryMachinePanel` - 故事机面板页面
- `DollPanel` - 公仔面板页面
- `Creation` - 创作页面
- `AddDoll` - 添加公仔页面
- `Home` - 首页（如果需要）
- 其他自定义页面名称

### 调试信息查看
- **iOS端**: 查看Xcode控制台中以`🚀 [iOS]`开头的日志
- **RN端**: 查看Metro控制台中以`🚀 [RN]`开头的日志
- **页面调试**: 开发模式下，`StoryMachinePanel`页面顶部会显示调试信息

## 测试步骤

1. 启动React Native开发服务器
   ```bash
   npm start
   # 或
   yarn start
   ```

2. 在Xcode中编译并运行iOS应用

3. 确保首页有设备显示（需要先添加设备到涂鸦平台）

4. 点击任意设备卡片

5. 验证是否正确跳转到`StoryMachinePanel`页面

6. 查看控制台日志确认设备详情传递

7. 在开发模式下查看页面顶部的调试信息

## 注意事项

1. 确保设备已正确添加到涂鸦平台
2. 确保React Native开发服务器正在运行
3. 调试信息仅在开发模式(`__DEV__`)下显示
4. 设备详情数据的完整性取决于涂鸦SDK提供的信息

## 后续开发

基于这个基础实现，可以进一步开发：

1. 根据设备类型显示不同的面板内容
2. 实现设备控制功能
3. 添加设备状态实时更新
4. 优化用户界面和交互体验

# iOS到React Native导航实现指南

## 概述

本文档描述了如何从iOS原生代码导航到React Native页面，并传递路由参数的实现方案。

## 实现的功能

1. **标签栏集成**: 将"创作"标签页从原生`CreationViewController`替换为React Native视图
2. **路由参数传递**: 支持从iOS向RN传递初始路由和参数
3. **自动导航**: RN应用根据传递的参数自动导航到指定页面

## 修改的文件

### iOS端

1. **ReactViewController.h/m** - 增强的RN视图控制器
   - 支持初始路由参数
   - 支持自定义参数传递

2. **MyTabBarController.m** - 标签栏控制器
   - 将创作标签页改为使用ReactViewController
   - 传递"Creation"路由参数

### React Native端

1. **App.tsx** - 主应用组件
   - 改用NavigationContainer动态导航
   - 处理iOS传递的初始路由和参数

2. **src/pages/Creation/index.tsx** - 创作页面
   - 增加路由参数处理逻辑
   - 支持从iOS传递的参数

3. **src/types/navigation.d.ts** - 导航类型定义
   - 更新路由参数类型

## 使用方法

### 基本用法

```objc
// 创建带有指定路由的RN视图控制器
ReactViewController *vc = [ReactViewController viewControllerWithInitialRoute:@"Creation"];
[self.navigationController pushViewController:vc animated:YES];
```

### 带参数的用法

```objc
// 创建带有路由和参数的RN视图控制器
NSDictionary *params = @{
    @"source": @"ios-tab",
    @"userId": @"12345"
};
ReactViewController *vc = [ReactViewController viewControllerWithInitialRoute:@"Creation" params:params];
[self.navigationController pushViewController:vc animated:YES];
```

### RN端接收参数

```typescript
// 在React Native组件中接收参数
const route = useRoute<any>();
const params = route.params; // 获取从iOS传递的参数

useEffect(() => {
    console.log('从iOS接收到的参数:', params);
    if (params?.source === 'ios-tab') {
        // 处理从iOS标签栏进入的逻辑
    }
}, [params]);
```

## 支持的路由

- `Creation` - 创作页面
- `Home` - 首页
- `AddDoll` - 添加公仔页面
- `StoryMachinePanel` - 故事机面板
- `DollPanel` - 公仔面板

## 调试信息

实现中包含了详细的日志输出，可以通过以下方式查看：

1. **iOS端**: 查看Xcode控制台中以`🚀 [iOS]`开头的日志
2. **RN端**: 查看Metro控制台中以`🚀 [RN]`开头的日志

## 注意事项

1. 确保React Native开发服务器正在运行
2. 模块名称必须与`index.js`中注册的名称一致（当前为"HelloWorld"）
3. 路由名称必须与RN端Stack.Navigator中定义的screen名称一致

## 实现的功能

1. **标签栏集成**: 将"创作"标签页从原生`CreationViewController`替换为React Native视图
2. **路由参数传递**: 支持从iOS向RN传递初始路由和参数
3. **自动导航**: RN应用根据传递的参数自动导航到指定页面

## 修改的文件

### iOS端

1. **ReactViewController.h/m** - 增强的RN视图控制器
   - 支持初始路由参数
   - 支持自定义参数传递

2. **MyTabBarController.m** - 标签栏控制器
   - 将创作标签页改为使用ReactViewController
   - 传递"Creation"路由参数

### React Native端

1. **App.tsx** - 主应用组件
   - 改用NavigationContainer动态导航
   - 处理iOS传递的初始路由和参数

2. **src/pages/Creation/index.tsx** - 创作页面
   - 增加路由参数处理逻辑
   - 支持从iOS传递的参数

3. **src/types/navigation.d.ts** - 导航类型定义
   - 更新路由参数类型

## 使用方法

### 基本用法

```objc
// 创建带有指定路由的RN视图控制器
ReactViewController *vc = [ReactViewController viewControllerWithInitialRoute:@"Creation"];
[self.navigationController pushViewController:vc animated:YES];
```

### 带参数的用法

```objc
// 创建带有路由和参数的RN视图控制器
NSDictionary *params = @{
    @"source": @"ios-tab",
    @"userId": @"12345",
    @"feature": @"creation"
};
ReactViewController *vc = [ReactViewController viewControllerWithInitialRoute:@"Creation" params:params];
[self.navigationController pushViewController:vc animated:YES];
```

### RN端接收参数

```typescript
// 在React Native组件中接收参数
const route = useRoute<any>();
const params = route.params;

useEffect(() => {
    console.log('从iOS接收到的参数:', params);
    // 根据参数执行相应逻辑
}, [params]);
```

## 支持的路由

- `Creation` - 创作页面
- `Home` - 首页
- `AddDoll` - 添加公仔页面
- `StoryMachinePanel` - 故事机面板
- `DollPanel` - 公仔面板

## 调试信息

实现中包含了详细的日志输出，便于调试：

- iOS端: 使用`NSLog`输出路由和参数信息
- RN端: 使用`console.log`输出导航状态

## 注意事项

1. 确保React Native开发服务器正在运行
2. 模块名称必须与`index.js`中注册的名称一致
3. 路由名称必须与RN导航器中定义的屏幕名称匹配
4. 参数传递使用JSON序列化，确保参数可序列化

## 测试

可以使用`RNNavigationTest.m`中的测试方法验证功能：

```objc
[RNNavigationTest testCreationNavigation];
[RNNavigationTest testNavigationWithParams];
```

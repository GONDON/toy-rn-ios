//
//  RNNavigationManager.m
//  AIToys
//
//  Created by AI Assistant on 2025/7/24.
//

#import "RNNavigationManager.h"
#import "ReactViewController.h"

@implementation RNNavigationManager

#pragma mark - 通用导航方法

+ (void)navigateFromViewController:(UIViewController *)fromViewController
                           toRoute:(NSString *)routeName
                        withParams:(NSDictionary * _Nullable)params
                          animated:(BOOL)animated {
    
    NSLog(@"🚀 [RNNavigationManager] 准备跳转到RN页面: %@", routeName);
    NSLog(@"🚀 [RNNavigationManager] 传递参数: %@", params);
    
    // 验证参数
    if (!fromViewController) {
        NSLog(@"❌ [RNNavigationManager] 源视图控制器为空");
        return;
    }
    
    if (!routeName || routeName.length == 0) {
        NSLog(@"❌ [RNNavigationManager] 路由名称为空");
        return;
    }
    
    // 创建RN视图控制器
    ReactViewController *rnVC = [ReactViewController viewControllerWithInitialRoute:routeName params:params];
    
    // 跳转到RN页面
    if (fromViewController.navigationController) {
        [fromViewController.navigationController pushViewController:rnVC animated:animated];
    } else {
        // 如果没有导航控制器，使用模态展示
        rnVC.modalPresentationStyle = UIModalPresentationFullScreen;
        [fromViewController presentViewController:rnVC animated:animated completion:nil];
    }
    
    NSLog(@"🚀 [RNNavigationManager] 跳转完成");
}

+ (void)navigateFromViewController:(UIViewController *)fromViewController
                           toRoute:(NSString *)routeName
                        withParams:(NSDictionary * _Nullable)params {
    [self navigateFromViewController:fromViewController toRoute:routeName withParams:params animated:YES];
}

+ (void)navigateFromViewController:(UIViewController *)fromViewController
                           toRoute:(NSString *)routeName {
    [self navigateFromViewController:fromViewController toRoute:routeName withParams:nil animated:YES];
}

#pragma mark - 特定页面导航方法

+ (void)navigateToStoryMachinePanelFromViewController:(UIViewController *)fromViewController
                                           withDevice:(ThingSmartDeviceModel *)device {
    
    NSLog(@"🚀 [RNNavigationManager] 跳转到故事机面板");
    NSLog(@"🚀 [RNNavigationManager] 设备信息 - ID: %@, 名称: %@", device.devId, device.name);
    
    // 构建设备详情数据
    NSMutableDictionary *deviceDetails = [NSMutableDictionary dictionary];
    
    // 基本信息
    if (device.devId) deviceDetails[@"deviceId"] = device.devId;
    if (device.name) deviceDetails[@"deviceName"] = device.name;
    if (device.productId) deviceDetails[@"productId"] = device.productId;
    if (device.uuid) deviceDetails[@"uuid"] = device.uuid;
    if (device.localKey) deviceDetails[@"localKey"] = device.localKey;
    
    // 状态信息
    deviceDetails[@"isOnline"] = @(device.isOnline);
    deviceDetails[@"isCloudOnline"] = @(device.isCloudOnline);
    deviceDetails[@"isLocalOnline"] = @(device.isLocalOnline);
    
    // 设备属性
    if (device.dps) deviceDetails[@"dps"] = device.dps;
    if (device.schemaArray) deviceDetails[@"schemaArray"] = device.schemaArray;
    
    // 其他信息
    if (device.iconUrl) deviceDetails[@"iconUrl"] = device.iconUrl;
    if (device.timezoneId) deviceDetails[@"timezoneId"] = device.timezoneId;
    
    // 创建传递给RN的参数
    NSDictionary *params = @{
        @"deviceDetails": deviceDetails,
        @"deviceId": device.devId ?: @"",
        @"deviceName": device.name ?: @"未知设备",
        @"source": @"home-page",
        @"timestamp": @([[NSDate date] timeIntervalSince1970])
    };
    
    [self navigateFromViewController:fromViewController toRoute:@"StoryMachinePanel" withParams:params];
}

+ (void)navigateToDollPanelFromViewController:(UIViewController *)fromViewController
                                   withDollId:(NSString *)dollId {
    
    NSLog(@"🚀 [RNNavigationManager] 跳转到公仔面板，公仔ID: %@", dollId);
    
    // 构建公仔页面参数
    NSDictionary *params = @{
        @"dollId": dollId ?: @"",
        @"source": @"home-page",
        @"timestamp": @([[NSDate date] timeIntervalSince1970])
    };
    
    [self navigateFromViewController:fromViewController toRoute:@"DollPanel" withParams:params];
}

+ (void)navigateToCreationFromViewController:(UIViewController *)fromViewController
                                  withSource:(NSString * _Nullable)source {
    
    NSLog(@"🚀 [RNNavigationManager] 跳转到创作页面，来源: %@", source);
    
    // 构建创作页面参数
    NSDictionary *params = @{
        @"source": source ?: @"ios-native",
        @"timestamp": @([[NSDate date] timeIntervalSince1970])
    };
    
    [self navigateFromViewController:fromViewController toRoute:@"Creation" withParams:params];
}

+ (void)navigateToAddDollFromViewController:(UIViewController *)fromViewController {
    
    NSLog(@"🚀 [RNNavigationManager] 跳转到添加公仔页面");
    
    // 构建添加公仔页面参数
    NSDictionary *params = @{
        @"source": @"ios-native",
        @"timestamp": @([[NSDate date] timeIntervalSince1970])
    };
    
    [self navigateFromViewController:fromViewController toRoute:@"AddDoll" withParams:params];
}

@end

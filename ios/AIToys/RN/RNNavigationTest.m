//
//  RNNavigationTest.m
//  AIToys
//
//  Created by AI Assistant on 2025/7/18.
//  测试iOS到RN导航功能
//

#import <Foundation/Foundation.h>
#import "ReactViewController.h"

@interface RNNavigationTest : NSObject

+ (void)testCreationNavigation;
+ (void)testNavigationWithParams;

@end

@implementation RNNavigationTest

+ (void)testCreationNavigation {
    NSLog(@"🧪 [测试] 开始测试创作页面导航");
    
    // 测试基本路由
    ReactViewController *vc = [ReactViewController viewControllerWithInitialRoute:@"Creation"];
    NSLog(@"🧪 [测试] 创建了带有Creation路由的RN视图控制器: %@", vc);
}

+ (void)testNavigationWithParams {
    NSLog(@"🧪 [测试] 开始测试带参数的导航");
    
    // 测试带参数的路由
    NSDictionary *params = @{
        @"source": @"ios-tab",
        @"tabIndex": @1,
        @"timestamp": @([[NSDate date] timeIntervalSince1970])
    };
    
    ReactViewController *vc = [ReactViewController viewControllerWithInitialRoute:@"Creation" params:params];
    NSLog(@"🧪 [测试] 创建了带参数的RN视图控制器: %@", vc);
    NSLog(@"🧪 [测试] 参数: %@", params);
}

@end

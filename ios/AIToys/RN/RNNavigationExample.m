//
//  RNNavigationExample.m
//  AIToys
//
//  Created by AI Assistant on 2025/7/24.
//

#import <Foundation/Foundation.h>
#import "RNNavigationManager.h"

/**
 * RN导航管理器使用示例
 * 展示如何在不同场景下使用RNNavigationManager进行页面跳转
 */
@interface RNNavigationExample : NSObject
@end

@implementation RNNavigationExample

#pragma mark - 基本用法示例

+ (void)basicNavigationExample:(UIViewController *)fromViewController {
    // 1. 跳转到指定RN页面（无参数）
    [RNNavigationManager navigateFromViewController:fromViewController
                                            toRoute:@"Creation"];
    
    // 2. 跳转到指定RN页面（带参数）
    NSDictionary *params = @{
        @"userId": @"12345",
        @"source": @"example"
    };
    [RNNavigationManager navigateFromViewController:fromViewController
                                            toRoute:@"Creation"
                                         withParams:params];
    
    // 3. 跳转到指定RN页面（控制动画）
    [RNNavigationManager navigateFromViewController:fromViewController
                                            toRoute:@"Creation"
                                         withParams:params
                                           animated:NO];
}

#pragma mark - 特定页面跳转示例

+ (void)specificPageNavigationExample:(UIViewController *)fromViewController {
    // 1. 跳转到故事机面板（需要设备对象）
    // ThingSmartDeviceModel *device = ...; // 获取设备对象
    // [RNNavigationManager navigateToStoryMachinePanelFromViewController:fromViewController
    //                                                          withDevice:device];
    
    // 2. 跳转到公仔面板
    [RNNavigationManager navigateToDollPanelFromViewController:fromViewController
                                                    withDollId:@"doll123"];
    
    // 3. 跳转到创作页面
    [RNNavigationManager navigateToCreationFromViewController:fromViewController
                                                   withSource:@"example"];
    
    // 4. 跳转到添加公仔页面
    [RNNavigationManager navigateToAddDollFromViewController:fromViewController];
}

#pragma mark - 实际使用场景示例

+ (void)realWorldUsageExample {
    /*
     在实际项目中的使用示例：
     
     1. 在HomeViewController中点击设备：
     - (void)deviceCellDidSelectAtIndex:(NSInteger)index {
         ThingSmartDeviceModel *device = self.deviceList[index];
         [RNNavigationManager navigateToStoryMachinePanelFromViewController:self
                                                                  withDevice:device];
     }
     
     2. 在某个按钮点击事件中跳转到创作页面：
     - (IBAction)createButtonTapped:(id)sender {
         [RNNavigationManager navigateToCreationFromViewController:self
                                                        withSource:@"main-menu"];
     }
     
     3. 在公仔列表中点击公仔：
     - (void)dollCellDidSelectWithDollId:(NSString *)dollId {
         [RNNavigationManager navigateToDollPanelFromViewController:self
                                                         withDollId:dollId];
     }
     
     4. 通用跳转（自定义页面和参数）：
     - (void)navigateToCustomPage {
         NSDictionary *customParams = @{
             @"customData": @"value",
             @"timestamp": @([[NSDate date] timeIntervalSince1970])
         };
         [RNNavigationManager navigateFromViewController:self
                                                 toRoute:@"CustomPage"
                                              withParams:customParams];
     }
     */
}

@end

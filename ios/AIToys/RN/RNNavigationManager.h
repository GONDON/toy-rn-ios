//
//  RNNavigationManager.h
//  AIToys
//
//  Created by AI Assistant on 2025/7/24.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * React Native页面导航管理器
 * 提供统一的RN页面跳转接口，支持动态路由和参数传递
 */
@interface RNNavigationManager : NSObject

/**
 * 从指定的视图控制器跳转到RN页面
 * @param fromViewController 源视图控制器
 * @param routeName RN页面路由名称
 * @param params 传递给RN页面的参数
 * @param animated 是否使用动画
 */
+ (void)navigateFromViewController:(UIViewController *)fromViewController
                           toRoute:(NSString *)routeName
                        withParams:(NSDictionary * _Nullable)params
                          animated:(BOOL)animated;

/**
 * 从指定的视图控制器跳转到RN页面（默认使用动画）
 * @param fromViewController 源视图控制器
 * @param routeName RN页面路由名称
 * @param params 传递给RN页面的参数
 */
+ (void)navigateFromViewController:(UIViewController *)fromViewController
                           toRoute:(NSString *)routeName
                        withParams:(NSDictionary * _Nullable)params;

/**
 * 从指定的视图控制器跳转到RN页面（无参数）
 * @param fromViewController 源视图控制器
 * @param routeName RN页面路由名称
 */
+ (void)navigateFromViewController:(UIViewController *)fromViewController
                           toRoute:(NSString *)routeName;

/**
 * 跳转到故事机面板页面
 * @param fromViewController 源视图控制器
 * @param device 设备模型
 */
+ (void)navigateToStoryMachinePanelFromViewController:(UIViewController *)fromViewController
                                           withDevice:(ThingSmartDeviceModel *)device;

/**
 * 跳转到公仔面板页面
 * @param fromViewController 源视图控制器
 * @param dollId 公仔ID
 */
+ (void)navigateToDollPanelFromViewController:(UIViewController *)fromViewController
                                   withDollId:(NSString *)dollId;

/**
 * 跳转到创作页面
 * @param fromViewController 源视图控制器
 * @param source 来源标识
 */
+ (void)navigateToCreationFromViewController:(UIViewController *)fromViewController
                                  withSource:(NSString * _Nullable)source;

/**
 * 跳转到添加公仔页面
 * @param fromViewController 源视图控制器
 */
+ (void)navigateToAddDollFromViewController:(UIViewController *)fromViewController;

@end

NS_ASSUME_NONNULL_END

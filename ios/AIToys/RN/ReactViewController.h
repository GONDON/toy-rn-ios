//
//  ReactViewController.h
//  demoapp
//
//  Created by gondon on 2025/6/22.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface ReactViewController : UIViewController

// 创建带有初始路由的RN视图控制器
+ (instancetype)viewControllerWithInitialRoute:(NSString *)route;

// 创建带有初始路由和参数的RN视图控制器
+ (instancetype)viewControllerWithInitialRoute:(NSString *)route params:(NSDictionary * _Nullable)params;

@end

NS_ASSUME_NONNULL_END

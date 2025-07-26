//
//  HomeViewController.h
//  AIToys
//
//  Created by 乔不赖 on 2025/6/18.
//

#import "BaseViewController.h"

NS_ASSUME_NONNULL_BEGIN

@interface HomeViewController : BaseViewController

// 通用的RN页面跳转方法
- (void)navigateToRNPage:(NSString *)routeName withParams:(NSDictionary * _Nullable)params;

// 导航到RN页面的方法（保持向后兼容）
- (void)navigateToRNPageWithDevice:(ThingSmartDeviceModel *)device;

@end

NS_ASSUME_NONNULL_END

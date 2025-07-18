//
//  HomeDeviceListVC.h
//  AIToys
//
//  Created by qdkj on 2025/6/25.
//

#import "BaseViewController.h"

NS_ASSUME_NONNULL_BEGIN

@interface HomeDeviceListVC : BaseViewController
@property(strong, nonatomic) ThingSmartHome *home;
@property (nonatomic, strong) NSArray <ThingSmartDeviceModel *>*deviceArr;
@end

NS_ASSUME_NONNULL_END

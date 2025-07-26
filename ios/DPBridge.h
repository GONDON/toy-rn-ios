//
//  DPBridge.h
//  AIToys
//
//  Created by Developer on 2024/01/01.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <ThingSmartDeviceKit/ThingSmartDeviceKit.h>

@interface DPBridge : RCTEventEmitter <RCTBridgeModule>

// 设备连接状态
@property (nonatomic, assign) BOOL isDeviceConnected;
@property (nonatomic, strong) NSString *currentDeviceId;
@property (nonatomic, strong) NSString *currentDeviceUUID;
@property (nonatomic, strong) NSString *currentProductKey;

// 设备信息
@property (nonatomic, strong) NSString *deviceName;
@property (nonatomic, strong) NSString *firmwareVersion;

// DP 数据缓存
@property (nonatomic, strong) NSMutableDictionary *dpDataCache;

// 涂鸦设备实例
@property (nonatomic, strong) ThingSmartDevice *tuyaDevice;

// 私有方法声明（在实现文件中定义）

@end

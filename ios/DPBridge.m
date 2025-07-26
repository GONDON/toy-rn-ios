//
//  DPBridge.m
//  AIToys
//
//  Created by Developer on 2024/01/01.
//

#import "DPBridge.h"
#import <React/RCTLog.h>

// 重连配置
static const NSUInteger MAX_RECONNECT_ATTEMPTS = 5;
static const NSTimeInterval RECONNECT_DELAY = 3.0;

@interface DPBridge () <ThingSmartDeviceDelegate>
@property (nonatomic, strong) NSTimer *reconnectTimer;
@property (nonatomic, assign) NSUInteger reconnectAttempts;
@property (nonatomic, strong) dispatch_queue_t dpQueue;
@end

@implementation DPBridge

// 导出模块名称
RCT_EXPORT_MODULE();

#pragma mark - 初始化

- (instancetype)init
{
    self = [super init];
    if (self) {
        _isDeviceConnected = NO;
        _reconnectAttempts = 0;
        _dpDataCache = [[NSMutableDictionary alloc] init];
        _dpQueue = dispatch_queue_create("com.dpbridge.tuya", DISPATCH_QUEUE_SERIAL);

        // 涂鸦设备实例将在需要时创建

        RCTLogInfo(@"[DPBridge] 涂鸦DP桥接模块初始化完成");
    }
    return self;
}

- (void)dealloc
{
    [self disconnectFromTuyaDevice];
    [self invalidateTimers];
}

- (void)invalidateTimers
{
    if (self.reconnectTimer) {
        [self.reconnectTimer invalidate];
        self.reconnectTimer = nil;
    }
}

// 支持的事件列表
- (NSArray<NSString *> *)supportedEvents
{
    return @[@"DPValueChanged", @"DeviceConnected", @"DeviceDisconnected", @"DPError", @"SyncCompleted"];
}

#pragma mark - ThingSmartDeviceDelegate

- (void)device:(ThingSmartDevice *)device dpsUpdate:(NSDictionary *)dps
{
    RCTLogInfo(@"[DPBridge] 收到DP数据更新: %@", dps);

    // 更新本地缓存
    [self.dpDataCache addEntriesFromDictionary:dps];

    // 发送DP变化事件到React Native
    for (NSString *dpId in dps.allKeys) {
        id value = dps[dpId];
        [self sendEventWithName:@"DPValueChanged" body:@{
            @"dpId": @([dpId integerValue]),
            @"value": value,
            @"deviceId": self.currentDeviceId ?: @""
        }];
    }
}

- (void)deviceInfoUpdate:(ThingSmartDevice *)device
{
    RCTLogInfo(@"[DPBridge] 设备信息更新: %@", device.deviceModel.name);

    // 更新设备信息
    self.deviceName = device.deviceModel.name;
    self.firmwareVersion = device.deviceModel.verSw ?: @"1.0.0";

    // 检查连接状态
    BOOL wasConnected = self.isDeviceConnected;
    self.isDeviceConnected = device.deviceModel.isOnline;

    if (!wasConnected && self.isDeviceConnected) {
        // 设备刚连接
        [self sendEventWithName:@"DeviceConnected" body:@{
            @"deviceId": self.currentDeviceId ?: @"",
            @"deviceName": self.deviceName ?: @"",
            @"isConnected": @(YES)
        }];

        // 连接成功后同步所有DP数据
        [self syncAllTuyaDPData];
    } else if (wasConnected && !self.isDeviceConnected) {
        // 设备断开连接
        [self sendEventWithName:@"DeviceDisconnected" body:@{
            @"deviceId": self.currentDeviceId ?: @"",
            @"deviceName": self.deviceName ?: @"",
            @"isConnected": @(NO)
        }];

        // 开始重连
        [self scheduleReconnect];
    }
}

- (void)deviceRemoved:(ThingSmartDevice *)device
{
    RCTLogInfo(@"[DPBridge] 设备被移除: %@", device.deviceModel.name);

    self.isDeviceConnected = NO;
    [self sendEventWithName:@"DeviceDisconnected" body:@{
        @"deviceId": self.currentDeviceId ?: @"",
        @"deviceName": self.deviceName ?: @"",
        @"isConnected": @(NO),
        @"reason": @"device_removed"
    }];
}

#pragma mark - React Native 导出方法

// 检查设备连接状态
RCT_EXPORT_METHOD(checkDeviceConnection:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLogInfo(@"[DPBridge] checkDeviceConnection called - 当前状态: %@", self.isDeviceConnected ? @"已连接" : @"未连接");

    // 如果有设备ID，使用涂鸦SDK检查连接状态
    if (self.currentDeviceId) {
        BOOL isConnected = [self checkTuyaDeviceConnection:self.currentDeviceId];
        self.isDeviceConnected = isConnected;
        resolve(@(isConnected));
    } else {
        resolve(@(self.isDeviceConnected));
    }
}

// 连接设备
RCT_EXPORT_METHOD(connectDevice:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLogInfo(@"[DPBridge] connectDevice called");

    if (self.isDeviceConnected) {
        RCTLogInfo(@"[DPBridge] 设备已连接");
        resolve(@(YES));
        return;
    }

    // 这里需要设备的UUID和ProductKey，通常从设备列表或配置中获取
    // 暂时使用示例值，实际使用时需要从React Native传入或从本地存储获取
    NSString *deviceUUID = self.currentDeviceUUID ?: @""; // 需要实际的设备UUID
    NSString *productKey = self.currentProductKey ?: @""; // 需要实际的ProductKey

    if (deviceUUID.length == 0 || productKey.length == 0) {
        RCTLogError(@"[DPBridge] 设备UUID或ProductKey为空，无法连接");
        reject(@"MISSING_DEVICE_INFO", @"设备UUID或ProductKey为空", nil);
        return;
    }

    [self connectToTuyaDevice:self.currentDeviceId uuid:deviceUUID productKey:productKey];
    resolve(@(YES));
}

// 断开设备连接
RCT_EXPORT_METHOD(disconnectDevice:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLogInfo(@"[DPBridge] disconnectDevice called");
    [self disconnectFromTuyaDevice];
    resolve(@(YES));
}



// 获取设备信息
RCT_EXPORT_METHOD(getDeviceInfo:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLogInfo(@"[DPBridge] getDeviceInfo called");

    NSDictionary *deviceInfo = @{
        @"deviceId": self.currentDeviceId ?: @"",
        @"deviceName": self.deviceName ?: @"AI Story Machine",
        @"firmwareVersion": self.firmwareVersion ?: @"1.0.0",
        @"isConnected": @(self.isDeviceConnected),
        @"uuid": self.currentDeviceUUID ?: @"",
        @"productKey": self.currentProductKey ?: @""
    };

    resolve(deviceInfo);
}

// 设置设备连接信息（新增方法，用于从React Native设置设备信息）
RCT_EXPORT_METHOD(setDeviceInfo:(NSString *)deviceId
                  uuid:(NSString *)uuid
                  productKey:(NSString *)productKey
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLogInfo(@"[DPBridge] setDeviceInfo called - deviceId: %@, uuid: %@", deviceId, uuid);

    self.currentDeviceId = deviceId;
    self.currentDeviceUUID = uuid;
    self.currentProductKey = productKey;

    // 创建涂鸦设备实例
    if (deviceId.length > 0) {
        self.tuyaDevice = [ThingSmartDevice deviceWithDeviceId:deviceId];
        self.tuyaDevice.delegate = self;

        if (self.tuyaDevice.deviceModel) {
            self.deviceName = self.tuyaDevice.deviceModel.name;
            self.firmwareVersion = self.tuyaDevice.deviceModel.verSw;
            self.isDeviceConnected = self.tuyaDevice.deviceModel.isOnline;
        }
    }

    resolve(@{
        @"success": @(YES),
        @"message": @"设备信息设置成功"
    });
}

// 发送 DP 数据到设备
RCT_EXPORT_METHOD(sendDPToDevice:(NSNumber *)dpId
                  value:(id)value
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLogInfo(@"[DPBridge] sendDPToDevice called - DP ID: %@, Value: %@", dpId, value);

    if (!self.tuyaDevice) {
        reject(@"DEVICE_NOT_INITIALIZED", @"设备未初始化", nil);
        return;
    }

    if (!self.isDeviceConnected) {
        reject(@"DEVICE_NOT_CONNECTED", @"设备未连接", nil);
        return;
    }

    // 构造DP数据
    NSDictionary *dps = @{[dpId stringValue]: value};

    [self.tuyaDevice publishDps:dps success:^{
        RCTLogInfo(@"✅ [DPBridge] DP数据发送成功 - DP ID: %@", dpId);

        // 更新本地缓存
        [self.dpDataCache setObject:value forKey:[dpId stringValue]];

        resolve(@(YES));
    } failure:^(NSError *error) {
        RCTLogError(@"❌ [DPBridge] DP数据发送失败 - DP ID: %@, 错误: %@", dpId, error.localizedDescription);
        reject(@"SEND_DP_FAILED", error.localizedDescription, error);
    }];
}

// 批量发送 DP 数据到设备
RCT_EXPORT_METHOD(sendBatchDPToDevice:(NSDictionary *)dpData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLogInfo(@"[DPBridge] sendBatchDPToDevice called - Data: %@", dpData);

    if (!self.tuyaDevice) {
        reject(@"DEVICE_NOT_INITIALIZED", @"设备未初始化", nil);
        return;
    }

    if (!self.isDeviceConnected) {
        reject(@"DEVICE_NOT_CONNECTED", @"设备未连接", nil);
        return;
    }

    // 转换DP数据格式（确保key为字符串）
    NSMutableDictionary *formattedDps = [NSMutableDictionary dictionary];
    for (id key in dpData.allKeys) {
        NSString *dpKey = [key isKindOfClass:[NSNumber class]] ? [key stringValue] : key;
        formattedDps[dpKey] = dpData[key];
    }

    [self.tuyaDevice publishDps:formattedDps success:^{
        RCTLogInfo(@"✅ [DPBridge] 批量DP数据发送成功");

        // 更新本地缓存
        [self.dpDataCache addEntriesFromDictionary:formattedDps];

        resolve(@(YES));
    } failure:^(NSError *error) {
        RCTLogError(@"❌ [DPBridge] 批量DP数据发送失败 - 错误: %@", error.localizedDescription);
        reject(@"SEND_BATCH_DP_FAILED", error.localizedDescription, error);
    }];
}

// 从设备读取 DP 数据
RCT_EXPORT_METHOD(readDPFromDevice:(NSNumber *)dpId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLogInfo(@"[DPBridge] readDPFromDevice called - DP ID: %@", dpId);

    if (!self.tuyaDevice) {
        reject(@"DEVICE_NOT_INITIALIZED", @"设备未初始化", nil);
        return;
    }

    // 从本地缓存读取
    NSString *dpKey = [dpId stringValue];
    id value = self.dpDataCache[dpKey];

    if (value) {
        resolve(value);
    } else {
        // 如果缓存中没有，从设备模型读取
        if (self.tuyaDevice.deviceModel && self.tuyaDevice.deviceModel.dps) {
            id deviceValue = self.tuyaDevice.deviceModel.dps[dpKey];
            if (deviceValue) {
                self.dpDataCache[dpKey] = deviceValue;
                resolve(deviceValue);
            } else {
                resolve([NSNull null]);
            }
        } else {
            resolve([NSNull null]);
        }
    }
}

// 批量读取 DP 数据
RCT_EXPORT_METHOD(readBatchDPFromDevice:(NSArray *)dpIds
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLogInfo(@"[DPBridge] readBatchDPFromDevice called - DP IDs: %@", dpIds);

    NSMutableDictionary *result = [NSMutableDictionary dictionary];

    for (NSNumber *dpId in dpIds) {
        NSString *dpKey = [dpId stringValue];

        // 先从缓存读取
        id value = self.dpDataCache[dpKey];

        // 如果缓存中没有，从设备模型读取
        if (!value && self.tuyaDevice.deviceModel && self.tuyaDevice.deviceModel.dps) {
            value = self.tuyaDevice.deviceModel.dps[dpKey];
            if (value) {
                self.dpDataCache[dpKey] = value;
            }
        }

        if (value) {
            result[[dpId stringValue]] = value;
        }
    }

    resolve(result);
}

// 同步所有 DP 数据
RCT_EXPORT_METHOD(syncAllDPFromDevice:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLogInfo(@"[DPBridge] syncAllDPFromDevice called");

    if (!self.tuyaDevice) {
        reject(@"DEVICE_NOT_INITIALIZED", @"设备未初始化", nil);
        return;
    }

    if (self.tuyaDevice.deviceModel && self.tuyaDevice.deviceModel.dps) {
        // 从设备模型获取所有DP数据
        NSDictionary *allDps = self.tuyaDevice.deviceModel.dps;

        // 更新本地缓存
        [self.dpDataCache addEntriesFromDictionary:allDps];

        RCTLogInfo(@"✅ [DPBridge] DP数据同步成功，共 %lu 个DP", (unsigned long)allDps.count);

        // 发送同步完成事件
        [self sendEventWithName:@"SyncCompleted" body:@{
            @"dpCount": @(allDps.count),
            @"timestamp": @([[NSDate date] timeIntervalSince1970])
        }];

        resolve(allDps);
    } else {
        RCTLogWarn(@"[DPBridge] 设备模型或DP数据为空");
        resolve(@{});
    }
}

#pragma mark - 私有方法

// 连接到涂鸦设备
- (void)connectToTuyaDevice:(NSString *)deviceId uuid:(NSString *)uuid productKey:(NSString *)productKey
{
    RCTLogInfo(@"[DPBridge] 开始连接涂鸦设备 - 设备ID: %@", deviceId);

    if (!deviceId || deviceId.length == 0) {
        RCTLogError(@"[DPBridge] 设备ID为空，无法连接");
        return;
    }

    // 创建涂鸦设备实例
    self.tuyaDevice = [ThingSmartDevice deviceWithDeviceId:deviceId];
    if (!self.tuyaDevice) {
        RCTLogError(@"❌ [DPBridge] 无法创建涂鸦设备实例");
        [self sendEventWithName:@"DPError" body:@{
            @"error": @"无法创建设备实例",
            @"type": @"DEVICE_CREATION_ERROR"
        }];
        return;
    }

    // 设置设备代理
    self.tuyaDevice.delegate = self;

    // 检查设备是否在线
    if (self.tuyaDevice.deviceModel && self.tuyaDevice.deviceModel.isOnline) {
        RCTLogInfo(@"✅ [DPBridge] 涂鸦设备已在线");

        self.isDeviceConnected = YES;
        self.reconnectAttempts = 0;

        // 更新设备信息
        self.deviceName = self.tuyaDevice.deviceModel.name;
        self.firmwareVersion = self.tuyaDevice.deviceModel.verSw;

        // 发送连接成功事件
        [self sendEventWithName:@"DeviceConnected" body:@{
            @"deviceId": deviceId ?: @"",
            @"deviceName": self.deviceName ?: @"",
            @"isConnected": @(YES)
        }];

        // 连接成功后同步DP数据
        [self syncAllTuyaDPData];

    } else {
        RCTLogWarn(@"⚠️ [DPBridge] 设备离线或不可用");

        self.isDeviceConnected = NO;

        [self sendEventWithName:@"DPError" body:@{
            @"error": @"设备离线或不可用",
            @"type": @"DEVICE_OFFLINE"
        }];

        // 设备离线，开始重连
        [self scheduleReconnect];
    }
}

// 断开涂鸦设备连接
- (void)disconnectFromTuyaDevice
{
    RCTLogInfo(@"[DPBridge] 断开涂鸦设备连接");

    // 清除设备代理
    if (self.tuyaDevice) {
        self.tuyaDevice.delegate = nil;
        self.tuyaDevice = nil;
    }

    self.isDeviceConnected = NO;
    [self invalidateTimers];

    // 发送断开连接事件
    [self sendEventWithName:@"DeviceDisconnected" body:@{
        @"deviceId": self.currentDeviceId ?: @"",
        @"deviceName": self.deviceName ?: @"",
        @"isConnected": @(NO)
    }];

    RCTLogInfo(@"✅ [DPBridge] 涂鸦设备断开完成");
}

// 检查涂鸦设备连接状态
- (BOOL)checkTuyaDeviceConnection:(NSString *)deviceId
{
    if (!deviceId || deviceId.length == 0) {
        return NO;
    }

    // 如果有设备实例，检查其在线状态
    if (self.tuyaDevice && self.tuyaDevice.deviceModel) {
        return self.tuyaDevice.deviceModel.isOnline;
    }

    // 如果没有设备实例，尝试创建一个来检查状态
    ThingSmartDevice *device = [ThingSmartDevice deviceWithDeviceId:deviceId];
    if (device && device.deviceModel) {
        return device.deviceModel.isOnline;
    }

    return NO;
}

// 同步所有涂鸦DP数据
- (void)syncAllTuyaDPData
{
    dispatch_async(self.dpQueue, ^{
        if (self.tuyaDevice && self.tuyaDevice.deviceModel) {
            NSDictionary *dps = self.tuyaDevice.deviceModel.dps;
            if (dps && dps.count > 0) {
                [self.dpDataCache addEntriesFromDictionary:dps];

                dispatch_async(dispatch_get_main_queue(), ^{
                    [self sendEventWithName:@"SyncCompleted" body:@{
                        @"dpCount": @(dps.count),
                        @"timestamp": @([[NSDate date] timeIntervalSince1970])
                    }];
                });
            }
        }
    });
}

// 安排重连
- (void)scheduleReconnect
{
    if (self.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        RCTLogError(@"[DPBridge] 达到最大重连次数，停止重连");
        return;
    }

    self.reconnectAttempts++;
    RCTLogInfo(@"[DPBridge] 安排重连 (第 %lu 次)", (unsigned long)self.reconnectAttempts);

    [self invalidateTimers];

    self.reconnectTimer = [NSTimer scheduledTimerWithTimeInterval:RECONNECT_DELAY
                                                           target:self
                                                         selector:@selector(attemptReconnect)
                                                         userInfo:nil
                                                          repeats:NO];
}

// 尝试重连
- (void)attemptReconnect
{
    RCTLogInfo(@"[DPBridge] 尝试重连设备");

    if (self.currentDeviceId && self.currentDeviceUUID && self.currentProductKey) {
        [self connectToTuyaDevice:self.currentDeviceId
                             uuid:self.currentDeviceUUID
                       productKey:self.currentProductKey];
    }
}

@end

//
//  TuyaDeviceControlBridge.m
//  AIToys
//
//  Created by AI Assistant on 2025/7/18.
//  涂鸦智能设备控制React Native桥接模块
//

#import "TuyaDeviceControlBridge.h"
#import <React/RCTLog.h>

@interface TuyaDeviceControlBridge()

@end

@implementation TuyaDeviceControlBridge

#pragma mark - Private Methods

/**
 * 验证设备ID是否有效
 */
- (BOOL)isValidDeviceId:(NSString *)deviceId {
    return deviceId && [deviceId isKindOfClass:[NSString class]] && deviceId.length > 0;
}

/**
 * 验证DP指令是否有效
 */
- (BOOL)isValidDps:(NSDictionary *)dps {
    if (!dps || ![dps isKindOfClass:[NSDictionary class]] || dps.count == 0) {
        return NO;
    }

    // 验证DP指令格式：key必须是字符串，value必须是基本数据类型
    for (id key in dps.allKeys) {
        if (![key isKindOfClass:[NSString class]]) {
            return NO;
        }

        id value = dps[key];
        if (![value isKindOfClass:[NSString class]] &&
            ![value isKindOfClass:[NSNumber class]] &&
            ![value isKindOfClass:[NSArray class]]) {
            return NO;
        }
    }

    return YES;
}

/**
 * 验证家庭ID是否有效
 */
- (BOOL)isValidHomeId:(NSNumber *)homeId {
    return homeId && [homeId isKindOfClass:[NSNumber class]] && [homeId longLongValue] > 0;
}

/**
 * 创建标准化的错误响应
 */
- (void)rejectWithCode:(NSString *)code
               message:(NSString *)message
                 error:(NSError *)error
              rejecter:(RCTPromiseRejectBlock)reject {
    RCTLogError(@"❌ [桥接错误] %@: %@", code, message);
    reject(code, message, error);
}

// 导出模块名称
RCT_EXPORT_MODULE(TuyaDeviceControl);

/**
 * 发布设备DP指令
 * @param deviceId 设备ID
 * @param dps DP指令字典，key为dpId字符串，value为对应的dpValue
 * @param resolve Promise成功回调
 * @param reject Promise失败回调
 */
RCT_EXPORT_METHOD(publishDeviceDps:(NSString *)deviceId
                  dps:(NSDictionary *)dps
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // 参数验证
    if (![self isValidDeviceId:deviceId]) {
        [self rejectWithCode:@"INVALID_DEVICE_ID"
                     message:@"设备ID不能为空或格式不正确"
                       error:nil
                    rejecter:reject];
        return;
    }

    if (![self isValidDps:dps]) {
        [self rejectWithCode:@"INVALID_DPS"
                     message:@"DP指令不能为空或格式不正确"
                       error:nil
                    rejecter:reject];
        return;
    }
    
    RCTLogInfo(@"🎮 [设备控制] 开始下发DP指令 - 设备ID: %@, DP指令: %@", deviceId, dps);
    
    // 创建设备实例
    ThingSmartDevice *device = [ThingSmartDevice deviceWithDeviceId:deviceId];
    if (!device) {
        reject(@"DEVICE_NOT_FOUND", @"未找到指定设备", nil);
        return;
    }
    
    // 下发DP指令
    [device publishDps:dps success:^{
        RCTLogInfo(@"✅ [设备控制] DP指令下发成功 - 设备ID: %@", deviceId);
        resolve(@{
            @"success": @YES,
            @"message": @"DP指令下发成功",
            @"deviceId": deviceId,
            @"dps": dps
        });
    } failure:^(NSError *error) {
        RCTLogError(@"❌ [设备控制] DP指令下发失败 - 设备ID: %@, 错误: %@", deviceId, error.localizedDescription);
        reject(@"PUBLISH_DPS_FAILED", 
               [NSString stringWithFormat:@"DP指令下发失败: %@", error.localizedDescription], 
               error);
    }];
}

/**
 * 获取设备状态
 * @param deviceId 设备ID
 * @param resolve Promise成功回调
 * @param reject Promise失败回调
 */
RCT_EXPORT_METHOD(getDeviceStatus:(NSString *)deviceId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // 参数验证
    if (![self isValidDeviceId:deviceId]) {
        [self rejectWithCode:@"INVALID_DEVICE_ID"
                     message:@"设备ID不能为空或格式不正确"
                       error:nil
                    rejecter:reject];
        return;
    }
    
    RCTLogInfo(@"📊 [设备状态] 开始查询设备状态 - 设备ID: %@", deviceId);
    
    // 创建设备实例
    ThingSmartDevice *device = [ThingSmartDevice deviceWithDeviceId:deviceId];
    if (!device) {
        reject(@"DEVICE_NOT_FOUND", @"未找到指定设备", nil);
        return;
    }
    
    // 获取设备模型
    ThingSmartDeviceModel *deviceModel = device.deviceModel;
    if (!deviceModel) {
        reject(@"DEVICE_MODEL_NOT_FOUND", @"设备模型不存在", nil);
        return;
    }
    
    RCTLogInfo(@"✅ [设备状态] 设备状态查询成功 - 设备ID: %@", deviceId);
    
    // 返回设备状态信息
    resolve(@{
        @"success": @YES,
        @"deviceId": deviceId,
        @"name": deviceModel.name ?: @"",
        @"isOnline": @(deviceModel.isOnline),
        @"dps": deviceModel.dps ?: @{},
        @"productId": deviceModel.productId ?: @"",
        @"uuid": deviceModel.uuid ?: @"",
        @"activeTime": @(deviceModel.activeTime),
    });
}

/**
 * 获取设备列表
 * @param homeId 家庭ID
 * @param resolve Promise成功回调
 * @param reject Promise失败回调
 */
RCT_EXPORT_METHOD(getDeviceList:(NSNumber *)homeId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // 参数验证
    if (![self isValidHomeId:homeId]) {
        [self rejectWithCode:@"INVALID_HOME_ID"
                     message:@"家庭ID不能为空或格式不正确"
                       error:nil
                    rejecter:reject];
        return;
    }
    
    RCTLogInfo(@"📋 [设备列表] 开始查询设备列表 - 家庭ID: %@", homeId);
    
    // 创建家庭实例
    ThingSmartHome *home = [ThingSmartHome homeWithHomeId:[homeId longLongValue]];
    if (!home) {
        reject(@"HOME_NOT_FOUND", @"未找到指定家庭", nil);
        return;
    }
    
    // 获取家庭数据
    [home getHomeDataWithSuccess:^(ThingSmartHomeModel *homeModel) {
        // 使用home.deviceList而不是homeModel.deviceList
        NSArray<ThingSmartDeviceModel *> *deviceList = home.deviceList;
        RCTLogInfo(@"✅ [设备列表] 设备列表查询成功 - 家庭ID: %@, 设备数量: %lu", homeId, (unsigned long)deviceList.count);

        NSMutableArray *deviceArray = [NSMutableArray array];
        for (ThingSmartDeviceModel *device in deviceList) {
            [deviceArray addObject:@{
                @"deviceId": device.devId ?: @"",
                @"name": device.name ?: @"",
                @"isOnline": @(device.isOnline),
                @"productId": device.productId ?: @"",
                @"uuid": device.uuid ?: @"",
                @"dps": device.dps ?: @{}
            }];
        }

        resolve(@{
            @"success": @YES,
            @"homeId": homeId,
            @"devices": deviceArray
        });
    } failure:^(NSError *error) {
        RCTLogError(@"❌ [设备列表] 设备列表查询失败 - 家庭ID: %@, 错误: %@", homeId, error.localizedDescription);
        [self rejectWithCode:@"GET_DEVICE_LIST_FAILED"
                     message:[NSString stringWithFormat:@"设备列表查询失败: %@", error.localizedDescription]
                       error:error
                    rejecter:reject];
    }];
}

@end

//
//  DPBridgeTest.m
//  AIToys
//
//  简单的编译测试文件
//

#import "DPBridge.h"

@interface DPBridgeTest : NSObject
@end

@implementation DPBridgeTest

+ (void)testDPBridgeCompilation
{
    // 简单的编译测试
    DPBridge *bridge = [[DPBridge alloc] init];
    NSLog(@"DPBridge 编译测试通过: %@", bridge);
}

@end

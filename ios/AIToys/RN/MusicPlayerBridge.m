//
//  MusicPlayerBridge.m
//  AIToys
//
//  Created by AI Assistant on 2025/7/23.
//

#import "MusicPlayerBridge.h"
#import <React/RCTLog.h>

@implementation MusicPlayerBridge

RCT_EXPORT_MODULE(MusicPlayerBridge);

// 支持的事件
- (NSArray<NSString *> *)supportedEvents {
    return @[
        @"onPlaybackStateChanged",
        @"onTrackChanged",
        @"onPlaylistChanged",
        @"onPlayerVisibilityChanged"
    ];
}

#pragma mark - 播放控制方法

RCT_EXPORT_METHOD(showPlayer) {
    RCTLogInfo(@"🎵 [MusicPlayerBridge] showPlayer called");
    
    dispatch_async(dispatch_get_main_queue(), ^{
        // 发送事件到RN端显示播放器
        [self sendEventWithName:@"onPlayerVisibilityChanged" body:@{@"isVisible": @YES}];
    });
}

RCT_EXPORT_METHOD(hidePlayer) {
    RCTLogInfo(@"🎵 [MusicPlayerBridge] hidePlayer called");
    
    dispatch_async(dispatch_get_main_queue(), ^{
        // 发送事件到RN端隐藏播放器
        [self sendEventWithName:@"onPlayerVisibilityChanged" body:@{@"isVisible": @NO}];
    });
}

RCT_EXPORT_METHOD(playTrack:(NSString *)trackId) {
    RCTLogInfo(@"🎵 [MusicPlayerBridge] playTrack: %@", trackId);
    
    dispatch_async(dispatch_get_main_queue(), ^{
        // 发送播放事件到RN端
        [self sendEventWithName:@"onPlaybackStateChanged" body:@{
            @"action": @"play",
            @"trackId": trackId
        }];
    });
}

RCT_EXPORT_METHOD(pausePlayer) {
    RCTLogInfo(@"🎵 [MusicPlayerBridge] pausePlayer called");
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onPlaybackStateChanged" body:@{
            @"action": @"pause"
        }];
    });
}

RCT_EXPORT_METHOD(stopPlayer) {
    RCTLogInfo(@"🎵 [MusicPlayerBridge] stopPlayer called");
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onPlaybackStateChanged" body:@{
            @"action": @"stop"
        }];
    });
}

RCT_EXPORT_METHOD(nextTrack) {
    RCTLogInfo(@"🎵 [MusicPlayerBridge] nextTrack called");
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onPlaybackStateChanged" body:@{
            @"action": @"next"
        }];
    });
}

RCT_EXPORT_METHOD(previousTrack) {
    RCTLogInfo(@"🎵 [MusicPlayerBridge] previousTrack called");
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onPlaybackStateChanged" body:@{
            @"action": @"previous"
        }];
    });
}

#pragma mark - 播放列表管理

RCT_EXPORT_METHOD(setPlaylist:(NSArray *)tracks startIndex:(NSNumber *)startIndex) {
    RCTLogInfo(@"🎵 [MusicPlayerBridge] setPlaylist with %lu tracks, startIndex: %@", 
               (unsigned long)tracks.count, startIndex);
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onPlaylistChanged" body:@{
            @"tracks": tracks,
            @"startIndex": startIndex ?: @0
        }];
    });
}

RCT_EXPORT_METHOD(addTrack:(NSDictionary *)track) {
    RCTLogInfo(@"🎵 [MusicPlayerBridge] addTrack: %@", track[@"title"]);
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onPlaylistChanged" body:@{
            @"action": @"add",
            @"track": track
        }];
    });
}

#pragma mark - 获取播放状态

RCT_EXPORT_METHOD(getPlaybackState:(RCTResponseSenderBlock)callback) {
    RCTLogInfo(@"🎵 [MusicPlayerBridge] getPlaybackState called");
    
    // 这里可以返回当前的播放状态
    // 实际项目中可能需要从音频服务获取真实状态
    NSDictionary *playbackState = @{
        @"isPlaying": @NO,
        @"currentTrack": [NSNull null],
        @"currentTime": @0,
        @"duration": @0,
        @"isVisible": @NO
    };
    
    callback(@[playbackState]);
}

#pragma mark - 便捷方法

// 从原生iOS页面调用的便捷方法
+ (void)showMusicPlayerFromNative {
    // 通过通知或其他方式通知RN端显示播放器
    [[NSNotificationCenter defaultCenter] postNotificationName:@"ShowMusicPlayer" object:nil];
}

+ (void)hideMusicPlayerFromNative {
    // 通过通知或其他方式通知RN端隐藏播放器
    [[NSNotificationCenter defaultCenter] postNotificationName:@"HideMusicPlayer" object:nil];
}

+ (void)playMusicFromNative:(NSDictionary *)trackInfo {
    // 播放指定音乐
    [[NSNotificationCenter defaultCenter] postNotificationName:@"PlayMusicFromNative" 
                                                        object:nil 
                                                      userInfo:trackInfo];
}

@end

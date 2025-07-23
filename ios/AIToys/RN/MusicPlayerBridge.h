//
//  MusicPlayerBridge.h
//  AIToys
//
//  Created by AI Assistant on 2025/7/23.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

NS_ASSUME_NONNULL_BEGIN

@interface MusicPlayerBridge : RCTEventEmitter <RCTBridgeModule>

// 播放控制方法
- (void)showPlayer;
- (void)hidePlayer;
- (void)playTrack:(NSString *)trackId;
- (void)pausePlayer;
- (void)stopPlayer;
- (void)nextTrack;
- (void)previousTrack;

// 播放列表管理
- (void)setPlaylist:(NSArray *)tracks startIndex:(NSNumber *)startIndex;
- (void)addTrack:(NSDictionary *)track;

// 获取播放状态
- (void)getPlaybackState:(RCTResponseSenderBlock)callback;

@end

NS_ASSUME_NONNULL_END

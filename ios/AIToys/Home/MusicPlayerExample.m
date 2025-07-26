//
//  MusicPlayerExample.m
//  AIToys
//
//  Created by AI Assistant on 2025/7/23.
//  音乐播放器原生iOS使用示例
//

#import "MusicPlayerExample.h"
#import "../RN/MusicPlayerBridge.h"
#import "../RN/ReactViewController.h"

@interface MusicPlayerExample ()

@property (nonatomic, strong) UIButton *showPlayerButton;
@property (nonatomic, strong) UIButton *playMusicButton;
@property (nonatomic, strong) UIButton *hidePlayerButton;
@property (nonatomic, strong) UIButton *openRNPageButton;

@end

@implementation MusicPlayerExample

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.view.backgroundColor = [UIColor whiteColor];
    self.title = @"音乐播放器示例";
    
    [self setupUI];
}

- (void)setupUI {
    // 显示播放器按钮
    self.showPlayerButton = [UIButton buttonWithType:UIButtonTypeSystem];
    [self.showPlayerButton setTitle:@"显示音乐播放器" forState:UIControlStateNormal];
    [self.showPlayerButton setBackgroundColor:[UIColor systemBlueColor]];
    [self.showPlayerButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    self.showPlayerButton.layer.cornerRadius = 8;
    [self.showPlayerButton addTarget:self action:@selector(showMusicPlayerExample) forControlEvents:UIControlEventTouchUpInside];
    
    // 播放音乐按钮
    self.playMusicButton = [UIButton buttonWithType:UIButtonTypeSystem];
    [self.playMusicButton setTitle:@"播放示例音乐" forState:UIControlStateNormal];
    [self.playMusicButton setBackgroundColor:[UIColor systemGreenColor]];
    [self.playMusicButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    self.playMusicButton.layer.cornerRadius = 8;
    [self.playMusicButton addTarget:self action:@selector(playExampleMusic) forControlEvents:UIControlEventTouchUpInside];
    
    // 隐藏播放器按钮
    self.hidePlayerButton = [UIButton buttonWithType:UIButtonTypeSystem];
    [self.hidePlayerButton setTitle:@"隐藏音乐播放器" forState:UIControlStateNormal];
    [self.hidePlayerButton setBackgroundColor:[UIColor systemOrangeColor]];
    [self.hidePlayerButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    self.hidePlayerButton.layer.cornerRadius = 8;
    [self.hidePlayerButton addTarget:self action:@selector(hideMusicPlayerExample) forControlEvents:UIControlEventTouchUpInside];
    
    // 打开RN测试页面按钮
    self.openRNPageButton = [UIButton buttonWithType:UIButtonTypeSystem];
    [self.openRNPageButton setTitle:@"打开RN测试页面" forState:UIControlStateNormal];
    [self.openRNPageButton setBackgroundColor:[UIColor systemPurpleColor]];
    [self.openRNPageButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    self.openRNPageButton.layer.cornerRadius = 8;
    [self.openRNPageButton addTarget:self action:@selector(openRNTestPage) forControlEvents:UIControlEventTouchUpInside];
    
    // 添加到视图
    [self.view addSubview:self.showPlayerButton];
    [self.view addSubview:self.playMusicButton];
    [self.view addSubview:self.hidePlayerButton];
    [self.view addSubview:self.openRNPageButton];
    
    // 设置约束
    self.showPlayerButton.translatesAutoresizingMaskIntoConstraints = NO;
    self.playMusicButton.translatesAutoresizingMaskIntoConstraints = NO;
    self.hidePlayerButton.translatesAutoresizingMaskIntoConstraints = NO;
    self.openRNPageButton.translatesAutoresizingMaskIntoConstraints = NO;
    
    [NSLayoutConstraint activateConstraints:@[
        // 显示播放器按钮
        [self.showPlayerButton.centerXAnchor constraintEqualToAnchor:self.view.centerXAnchor],
        [self.showPlayerButton.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor constant:100],
        [self.showPlayerButton.widthAnchor constraintEqualToConstant:200],
        [self.showPlayerButton.heightAnchor constraintEqualToConstant:50],
        
        // 播放音乐按钮
        [self.playMusicButton.centerXAnchor constraintEqualToAnchor:self.view.centerXAnchor],
        [self.playMusicButton.topAnchor constraintEqualToAnchor:self.showPlayerButton.bottomAnchor constant:20],
        [self.playMusicButton.widthAnchor constraintEqualToConstant:200],
        [self.playMusicButton.heightAnchor constraintEqualToConstant:50],
        
        // 隐藏播放器按钮
        [self.hidePlayerButton.centerXAnchor constraintEqualToAnchor:self.view.centerXAnchor],
        [self.hidePlayerButton.topAnchor constraintEqualToAnchor:self.playMusicButton.bottomAnchor constant:20],
        [self.hidePlayerButton.widthAnchor constraintEqualToConstant:200],
        [self.hidePlayerButton.heightAnchor constraintEqualToConstant:50],
        
        // 打开RN页面按钮
        [self.openRNPageButton.centerXAnchor constraintEqualToAnchor:self.view.centerXAnchor],
        [self.openRNPageButton.topAnchor constraintEqualToAnchor:self.hidePlayerButton.bottomAnchor constant:40],
        [self.openRNPageButton.widthAnchor constraintEqualToConstant:200],
        [self.openRNPageButton.heightAnchor constraintEqualToConstant:50],
    ]];
}

#pragma mark - 音乐播放器控制方法

- (void)showMusicPlayerExample {
    NSLog(@"🎵 [Native] 显示音乐播放器");
    [MusicPlayerBridge showMusicPlayerFromNative];
}

- (void)playExampleMusic {
    NSLog(@"🎵 [Native] 播放示例音乐");
    
    // 创建示例音乐数据
    NSDictionary *trackInfo = @{
        @"id": @"native_example_1",
        @"title": @"The mouse steals1...",
        @"artist": @"Story Teller",
        @"artwork": @"https://via.placeholder.com/300x300/4A90E2/ffffff?text=🐭",
        @"url": @"https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        @"duration": @310
    };
    
    [MusicPlayerBridge playMusicFromNative:trackInfo];
}

- (void)hideMusicPlayerExample {
    NSLog(@"🎵 [Native] 隐藏音乐播放器");
    [MusicPlayerBridge hideMusicPlayerFromNative];
}

- (void)openRNTestPage {
    NSLog(@"🎵 [Native] 打开RN测试页面");

    // 创建RN视图控制器，导航到测试页面
    NSDictionary *testParams = @{
        @"source": @"music-player-test",
        @"timestamp": @([[NSDate date] timeIntervalSince1970])
    };
    ReactViewController *rnVC = [ReactViewController viewControllerWithInitialRoute:@"MusicPlayerTest" params:testParams];
    rnVC.modalPresentationStyle = UIModalPresentationFullScreen;

    [self presentViewController:rnVC animated:YES completion:^{
        NSLog(@"🎵 [Native] RN测试页面已打开");
    }];
}

@end

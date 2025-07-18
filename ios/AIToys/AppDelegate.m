//
//  AppDelegate.m
//  AIToys
//
//  Created by qdkj on 2025/6/17.
//

#import "AppDelegate.h"
#import "LoginViewController.h"
#import "MyTabBarController.h"
#import "GlobalBluetoothManager.h"
#import "ADImageView.h"
#import "BannerModel.h"

@interface AppDelegate ()

@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [[ThingSmartSDK sharedInstance] startWithAppKey:Smart_APPID secretKey:Smart_AppSecret];
#ifdef DEBUG
    [[ThingSmartSDK sharedInstance] setDebugMode:YES];
#else
#endif
    [SVProgressHUD setSuccessImage:QD_IMG(@"hud_success")];
    [SVProgressHUD setErrorImage:QD_IMG(@"hud_error")];
    [SVProgressHUD setDefaultStyle:SVProgressHUDStyleDark];
    //蓝牙监听
    [GlobalBluetoothManager sharedManager];
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    self.window.backgroundColor = [UIColor whiteColor];
    [self setUpRootVC];
    [self.window makeKeyAndVisible];
    //启动广告图
    [self loadAD];
    return YES;
}

-(void)setUpRootVC{
    if ([ThingSmartUser sharedInstance].isLogin) {
        MyTabBarController *tabbar = [MyTabBarController new];
        self.window.rootViewController = tabbar;
    }else{
        self.window.rootViewController = [[MyNavigationController alloc] initWithRootViewController:[LoginViewController new]];
    }
    
}

#pragma mark - ----------------------- 启动广告图 -----------------------
#pragma mark 加载远程广告
- (void)loadAD {
    
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask, YES);
    NSString *filePath = [[paths objectAtIndex:0] stringByAppendingPathComponent:[NSString stringWithFormat:@"loading.png"]];
    NSString *modelPath = [[paths objectAtIndex:0] stringByAppendingPathComponent:[NSString stringWithFormat:@"adModel"]];
    
    NSFileManager *fileManager = [NSFileManager defaultManager];
    BOOL isDir = FALSE;
    BOOL isExit = [fileManager fileExistsAtPath:filePath isDirectory:&isDir];
    BannerModel *adModel = [NSKeyedUnarchiver unarchiveObjectWithFile:modelPath];
    //url是否已被缓存
    if (isExit && adModel){
        WEAK_SELF
        //自定义广告ImageView
        ADImageView *launch = [[ADImageView alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
        launch.image = [UIImage imageWithContentsOfFile:filePath];
        //广告点击跳转
        launch.adPicTapClick = ^{
            [weakSelf jumpToAdView:adModel];
        };
        //设置window层级
        [weakSelf.window addSubview:launch];
    }
    [self asyncInit];
}

//获取网络数据
-(void)asyncInit{
    WEAK_SELF
    [[APIManager shared] GET:SplashScreen_URL parameter:nil success:^(id  _Nonnull result, id  _Nonnull data, NSString * _Nonnull msg)  {
      
        NSArray *dataArr = @[];
        if ([data isKindOfClass:NSArray.class]){
            dataArr = (NSArray *)data;
        }
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask, YES);
        NSString *filePath = [[paths objectAtIndex:0] stringByAppendingPathComponent:[NSString stringWithFormat:@"loading.png"]];
        NSString *modelPath = [[paths objectAtIndex:0] stringByAppendingPathComponent:[NSString stringWithFormat:@"adModel"]];
        if (dataArr.count)
        {
            BannerModel *adModel = [BannerModel mj_objectWithKeyValues:[dataArr firstObject]];
            [NSKeyedArchiver archiveRootObject: adModel toFile:modelPath];
            //异步下载并缓存以供下次直接读取
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                if (adModel.imageUrl.length>0) {
                    NSData *data = [NSData dataWithContentsOfURL:[NSURL URLWithString:adModel.imageUrl]];
                    UIImage *image = [UIImage imageWithData:data];
                    // 保存文件的名称
                    [UIImagePNGRepresentation(image) writeToFile:filePath atomically:YES];
                    
                }
            });
        }else{
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(5.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                BOOL isDir = FALSE;
                BOOL isExit = [[NSFileManager defaultManager] fileExistsAtPath:filePath isDirectory:&isDir];
                if (isExit) {
                    NSError *error;
                    [[NSFileManager defaultManager]removeItemAtPath:filePath error:&error];

                    if (error)
                    {
                      // file deletion failed
                        NSLog(@"广告页清除失败");
                    }
                }
            });
            
        }
    } failure:^(NSError * _Nonnull error, NSString * _Nonnull msg){
       NSLog(@"广告页加载失败");
    }];
}

#pragma mark 启动广告图的点击跳转
- (void)jumpToAdView:(BannerModel *)adModel
{
    if (adModel.linkUrl.length == 0) {
        return;
    }
    MyWebViewController *VC = [MyWebViewController new];
    VC.mainUrl =  adModel.linkUrl;
    [[PublicObj getCurrentViewController].navigationController pushViewController:VC animated:YES];
}

@end

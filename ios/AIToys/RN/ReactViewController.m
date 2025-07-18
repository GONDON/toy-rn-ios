#import "ReactViewController.h"
#import <RCTAppDependencyProvider.h>
#import <RCTDefaultReactNativeFactoryDelegate.h>
#import <RCTReactNativeFactory.h>
#import <React/RCTBundleURLProvider.h>

@interface ReactViewController ()

@end

@interface ReactNativeFactoryDelegate : RCTDefaultReactNativeFactoryDelegate
@end

@implementation ReactViewController {
  RCTReactNativeFactory *_factory;
  id<RCTReactNativeFactoryDelegate> _factoryDelegate;
  NSString *_initialRoute;
  NSDictionary *_initialParams;
}

+ (instancetype)viewControllerWithInitialRoute:(NSString *)route {
  return [self viewControllerWithInitialRoute:route params:nil];
}

+ (instancetype)viewControllerWithInitialRoute:(NSString *)route params:(NSDictionary *)params {
  ReactViewController *vc = [[ReactViewController alloc] init];
  vc->_initialRoute = route;
  vc->_initialParams = params;
  return vc;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  // Do any additional setup after loading the view.

  // 隐藏导航栏，让RN页面充满屏幕
  self.navigationItem.title = @"";
  self.navigationController.navigationBarHidden = YES;

  // 设置视图控制器的边缘扩展属性，让内容延伸到状态栏下方
  self.edgesForExtendedLayout = UIRectEdgeAll;
  self.extendedLayoutIncludesOpaqueBars = YES;
  self.automaticallyAdjustsScrollViewInsets = NO;

  _factoryDelegate = [ReactNativeFactoryDelegate new];
  _factoryDelegate.dependencyProvider = [RCTAppDependencyProvider new];
  _factory = [[RCTReactNativeFactory alloc] initWithDelegate:_factoryDelegate];

  // 准备初始属性
  NSMutableDictionary *initialProps = [NSMutableDictionary dictionary];
  if (_initialRoute) {
    initialProps[@"initialRoute"] = _initialRoute;
  }
  if (_initialParams) {
    initialProps[@"initialParams"] = _initialParams;
  } else if (_initialRoute) {
    // 如果没有提供参数但有路由，添加默认参数
    initialProps[@"initialParams"] = @{@"source": @"ios-tab"};
  }

  NSLog(@"🚀 [iOS] 启动RN视图，初始路由: %@, 参数: %@", _initialRoute, initialProps);

  // 创建RN视图
  UIView *rnView = [_factory.rootViewFactory viewWithModuleName:@"HelloWorld" initialProperties:initialProps];

  // 设置RN视图的frame，让它充满整个屏幕
  rnView.frame = self.view.bounds;
  rnView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

  self.view = rnView;
}

- (void)viewWillAppear:(BOOL)animated {
  NSLog(@"🚀 [iOS] ReactViewController viewWillAppear");
  [super viewWillAppear:animated];

  // 确保导航栏隐藏
  [self.navigationController setNavigationBarHidden:YES animated:animated];
}

- (void)viewDidAppear:(BOOL)animated {
  NSLog(@"🚀 [iOS] ReactViewController viewDidAppear");
  [super viewDidAppear:animated];
  NSLog(@"🚀 [iOS] 当前view: %@", self.view);

  // 再次确保导航栏隐藏
  [self.navigationController setNavigationBarHidden:YES animated:NO];
}

- (void)viewWillDisappear:(BOOL)animated {
  NSLog(@"🚀 [iOS] ReactViewController viewWillDisappear");
  [super viewWillDisappear:animated];

  // 当离开RN页面时，恢复导航栏显示（如果需要的话）
  // 注意：由于这是在标签栏中，通常不需要恢复导航栏
  // [self.navigationController setNavigationBarHidden:NO animated:animated];
}

@end

@implementation ReactNativeFactoryDelegate

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  NSLog(@"🌉 [iOS] sourceURLForBridge 被调用");
  return [self bundleURL];
}

- (NSURL *)bundleURL {
  NSLog(@"📦 [iOS] bundleURL 方法被调用");
#if DEBUG
  NSLog(@"📦 [iOS] DEBUG模式，使用开发服务器");

  // 首先尝试使用RCTBundleURLProvider
  NSURL *url =
      [RCTBundleURLProvider.sharedSettings jsBundleURLForBundleRoot:@"index"];
  NSLog(@"📦 [iOS] RCTBundleURLProvider返回的URL: %@", url);

  // 如果URL是nil，手动构造
  if (!url) {
    NSLog(@"❌ [iOS] RCTBundleURLProvider返回nil，使用手动构造的URL");

    // 尝试不同的主机地址
    NSArray *hosts = @[ @"localhost", @"127.0.0.1" ];
    for (NSString *host in hosts) {
      NSString *urlString = [NSString
          stringWithFormat:
              @"http://%@:8081/index.bundle?platform=ios&dev=true&minify=false",
              host];
      url = [NSURL URLWithString:urlString];
      NSLog(@"📦 [iOS] 尝试URL: %@", urlString);

      // 简单的连接测试（这里只是构造URL，实际连接会在后续进行）
      break; // 使用第一个URL
    }
  }

  NSLog(@"📦 [iOS] 最终使用的URL: %@", url);
  NSLog(@"📦 [iOS] URL字符串: %@", [url absoluteString]);

  return url;
#else
  NSLog(@"📦 [iOS] RELEASE模式，使用本地bundle");
  NSURL *url = [NSBundle.mainBundle URLForResource:@"main"
                                     withExtension:@"jsbundle"];
  NSLog(@"📦 [iOS] 本地bundle URL: %@", url);
  return url;
#endif
}

@end

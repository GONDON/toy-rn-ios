//
//  APIManager.m
//  KunQiTong
//
//  Created by 乔不赖 on 2021/8/28.
//

#import "APIManager.h"
#import "AFNetworking.h"
#import "AFNetworkActivityIndicatorManager.h"
#import "AppDelegate.h"
#import "CompressImageData.h"

static NSString * const successMsg = @"操作成功";
static NSString * const failureMsg = @"数据异常";
static NSString * const netErrorMsg = @"网络异常";

#define ApiVersion [UIApplication sharedApplication].appVersion

@interface APIManager ()


@end

@implementation APIManager

#pragma mark -- 上传图片
- (void)uploadImg:(UIImage *)img
             isH5:(BOOL)isH5
             Succ:(void(^)(NSString *data))succ
             fail:(failBlock)fail{
    NSString *url = isH5? [NSString stringWithFormat:@"%@Order/upload_imgss.html",PATH]: API(@"up_imgs.html");
    NSData *data = UIImageJPEGRepresentation(img, 1);
    NSLog(@"图片大小===%li kb",data.length / 1024);
    if (data.length > 8*1000*1000){
        if (fail) {
            fail(@"图片文件不能大于10MB");
            return;
        }
    }
    UIImage *image = [CompressImageData compressImgQuality:img toByte:1024*1024];
    [self uploadImages:url parameters:nil imageArray:@[image] fileName:@"pic" progress:^(NSProgress *uploadProgress) {
        
    } success:^(id result) {
        if (succ) {
            if(isH5){
                if ([result[@"code"] isEqualToString:@"200"]) {
                    if([result[@"data"] isKindOfClass:[NSArray class]]){
                        NSArray *arr = result[@"data"];
                        if(arr.count>0){
                            succ([NSString stringWithFormat:@"%@", arr[0]]);
                        }
                    }
                }else{
                    if (fail) {
                        fail(result[@"msg"]);
                    }
                }
            }else{
                succ(result[@"data"]);
            }
            
        }
    } failure:^(NSError *error) {
        if (fail) {
            fail(@"请求超时，请检查网络后稍后重试");
        }
        
    }];
}

#pragma mark -- 单例方法
+ (instancetype)shared {
    static APIManager *manager = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [[APIManager alloc] init];
        manager.netStatus = NetStatus_Unknown;
        [manager startNetStatusNotify];
        //显示状态栏网络活动指示器
        [AFNetworkActivityIndicatorManager sharedManager].enabled = YES;
    });
    return manager;
}

#pragma mark -- 网络状态监听

- (void)startNetStatusNotify {
    AFNetworkReachabilityManager *manager = [AFNetworkReachabilityManager sharedManager];
    //网络一发生变化就会触发下面的方法
    [manager setReachabilityStatusChangeBlock:^(AFNetworkReachabilityStatus status) {
        switch (status) {
            case AFNetworkReachabilityStatusReachableViaWWAN:
            {// 蜂窝移动网络
            }
                break;
            case AFNetworkReachabilityStatusReachableViaWiFi:
            {// WiFi网络
                [[NSNotificationCenter defaultCenter] postNotificationName:@"NetworkReachableWifi" object:nil];
            }
                break;
            case AFNetworkReachabilityStatusUnknown:
            {// 状态未知
                [[NSNotificationCenter defaultCenter] postNotificationName:@"NotReachable" object:nil];
            }
                break;
            case AFNetworkReachabilityStatusNotReachable:
            {// 没有网络
                [[NSNotificationCenter defaultCenter] postNotificationName:@"NotReachable" object:nil];
            }
                break;
            default:
                break;
        }
        //网络状态发生变化时发出通知
        NSInteger old = (NSInteger)self.netStatus;
        self.netStatus = (NSInteger)status;
//        [[NSNotificationCenter defaultCenter] postNotificationName:kNetChange object:self userInfo:@{@"newStatus":[NSNumber numberWithInteger:(NSInteger)status], @"oldStatus":[NSNumber numberWithInteger:old]}];
    }];
    
    [manager startMonitoring];
}

#pragma mark -- GET请求
- (void)GET:(NSString *)urlStr
  parameter:(NSDictionary *_Nullable)parameter
    success:(void(^)(id result, id data, NSString *msg))success
    failure:(void(^)(NSError *error, NSString *msg))failure
{
    [self myRequestWithUrlStr:urlStr method:@"GET" contentType:@"application/x-www-form-urlencoded" parameters:parameter completionHandler:^(NSURLResponse *response, id responseObject, NSError *error) {
        NSLog(@"\n网络请求\n%@\n参数%@\n结果%@", urlStr,parameter, responseObject);
        NSDictionary *dic = responseObject;
        if (dic&&[dic isKindOfClass:[NSDictionary class]]) {
            [APIManager verifyResult:responseObject succ:^(id data, NSString *msg) {
                if (success) {
                    if ([urlStr isEqualToString:GetUserInfo_URL]) {
                        NSDictionary *user = data;
                        [self saveSelfData:user];
                    }
                    success(responseObject, data, msg);
                }
            } fail:^(int code, NSString *msg) {
                if (failure) {
                    failure(nil, msg);
                }
                [SVProgressHUD showErrorWithStatus:msg];
            }];
        }else{
            if (failure) {
                failure(nil, @"返回数据格式错误");//返回数据格式错误
            }
        }
    }];
}

- (void)GETTxt:(NSString *)urlStr
   parameter:(NSDictionary *)parameter
     success:(void(^)(id result, id data, NSString *msg))success
     failure:(void(^)(NSError *error, NSString *msg))failure
{
    AFHTTPSessionManager *manager = [self AFHTTPSessionManager];
    
    //对url中的中文字符进行转码
    NSString *str = [urlStr stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
    
    //GET请求
    [manager GET:str parameters:parameter headers:@{@"token":(kMyUser.accessToken?:@"")} progress:^(NSProgress * _Nonnull downloadProgress) {
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        [manager.session finishTasksAndInvalidate];
        NSLog(@"\n网络请求\n%@\n参数%@\n结果%@", urlStr,[ConvertJsonStr convertToJsonData:parameter], responseObject);
        if ([urlStr isEqualToString:@"http://114.116.108.180/kqt_app_self_belay.txt"]) {
            success(responseObject, nil, nil);
            return;
        }
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [manager.session finishTasksAndInvalidate];
        NSLog(@"\n网络请求 error(%ld) %@ 拼接参数 %@", (long)error.code, urlStr, parameter);
        if (failure) {
            failure(error, netErrorMsg);
        }
        [SVProgressHUD showErrorWithStatus:netErrorMsg];
    }];
}

#pragma mark -- Post请求
- (void)POST:(NSString *)urlStr
   parameter:(NSDictionary *_Nullable)parameter
     success:(void(^)(id result, id data, NSString *msg))success
     failure:(void(^)(NSError *error, NSString *msg))failure
{
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:parameter];
    
    [self myRequestWithUrlStr:urlStr method:@"POST" contentType:@"application/x-www-form-urlencoded" parameters:dic completionHandler:^(NSURLResponse *response, id responseObject, NSError *error) {
        NSLog(@"\n网络请求\n%@\n参数%@\n结果%@", urlStr,dic, responseObject);
        NSDictionary *dic = responseObject;
        if (dic&&[dic isKindOfClass:[NSDictionary class]]) {
            [APIManager verifyResult:responseObject succ:^(id data, NSString *msg) {
                if (success) {
                    if ([urlStr isEqualToString:Login_URL]) {
                        NSDictionary *user = data;
                        [self saveSelfData:user];
                    }
                    success(responseObject, data, msg);
                }
            } fail:^(int code, NSString *msg) {
                if (failure) {
                    if(code == 001 && [urlStr isEqualToString:GetLoginSmsCode_URL]){
                        msg = @"验证码发送过于频繁,请稍后再试!";
                    }
                    failure(nil, msg);
                }
                [SVProgressHUD showErrorWithStatus:msg];
            }];
        }else{
            if (failure) {
                failure(nil, @"返回数据格式错误");//返回数据格式错误
            }
        }
    }];
}

- (void)POSTJSON:(NSString *)urlStr
   parameter:(NSDictionary *_Nullable)parameter
     success:(void(^)(id result, id data, NSString *msg))success
     failure:(void(^)(NSError *error, NSString *msg))failure
{
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:parameter];
    
    [self myRequestWithUrlStr:urlStr method:@"POST" contentType:@"application/json" parameters:dic completionHandler:^(NSURLResponse *response, id responseObject, NSError *error) {
        NSLog(@"\n网络请求\n%@\n参数%@\n结果%@", urlStr,dic, responseObject);
        NSDictionary *dic = responseObject;
        if (dic&&[dic isKindOfClass:[NSDictionary class]]) {
            [APIManager verifyResult:responseObject succ:^(id data, NSString *msg) {
                if (success) {
                    if ([urlStr isEqualToString:Login_URL]) {
                        NSDictionary *user = data;
                        [self saveSelfData:user];
                    }
                    success(responseObject, data, msg);
                }
            } fail:^(int code, NSString *msg) {
                if (failure) {
                    if(code == 001 && [urlStr isEqualToString:GetLoginSmsCode_URL]){
                        msg = @"验证码发送过于频繁,请稍后再试!";
                    }
                    failure(nil, msg);
                }
                [SVProgressHUD showErrorWithStatus:msg];
            }];
        }else{
            if (failure) {
                failure(nil, @"返回数据格式错误");//返回数据格式错误
            }
        }
    }];
}


- (void)PUTJSON:(NSString *)urlStr
   parameter:(NSDictionary *_Nullable)parameter
     success:(void(^)(id result, id data, NSString *msg))success
     failure:(void(^)(NSError *error, NSString *msg))failure
{
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:parameter];
    
    [self myRequestWithUrlStr:urlStr method:@"PUT" contentType:@"application/json" parameters:dic completionHandler:^(NSURLResponse *response, id responseObject, NSError *error) {
        NSLog(@"\n网络请求\n%@\n参数%@\n结果%@", urlStr,dic, responseObject);
        NSDictionary *dic = responseObject;
        if (dic&&[dic isKindOfClass:[NSDictionary class]]) {
            [APIManager verifyResult:responseObject succ:^(id data, NSString *msg) {
                if (success) {
                    if ([urlStr isEqualToString:Login_URL]) {
                        NSDictionary *user = data;
                        [self saveSelfData:user];
                    }
                    success(responseObject, data, msg);
                }
            } fail:^(int code, NSString *msg) {
                if (failure) {
                    if(code == 001 && [urlStr isEqualToString:GetLoginSmsCode_URL]){
                        msg = @"验证码发送过于频繁,请稍后再试!";
                    }
                    failure(nil, msg);
                }
                [SVProgressHUD showErrorWithStatus:msg];
            }];
        }else{
            if (failure) {
                failure(nil, @"返回数据格式错误");//返回数据格式错误
            }
        }
    }];
}

#pragma mark -- private methods

// AFN的相关设置
- (AFHTTPSessionManager *)AFHTTPSessionManager {
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    
    // 添加 Header
    [manager.requestSerializer setValue:[NSString stringWithFormat:@"Bearer %@", kMyUser.accessToken] forHTTPHeaderField:@"Authorization"];
    // 申明返回结果的类型
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"text/html", @"application/json", @"text/plain", @"text/json",@"text/javascript",@"multipart/form-data", nil];
    // 设置超时时间
    manager.requestSerializer.timeoutInterval = 30;
    
    // 证书验证模式
    AFSecurityPolicy *securityPolicy = [AFSecurityPolicy policyWithPinningMode:AFSSLPinningModeNone];
    // 是否允许无效证书（也就是自建的证书），默认为NO
    securityPolicy.allowInvalidCertificates = YES;
    // 是否验证域名，默认为YES；
    securityPolicy.validatesDomainName = NO;
    [manager setSecurityPolicy:securityPolicy];
    
    return manager;
}

- (NSURLSessionDataTask *)myRequestWithUrlStr:(NSString *)urlStr
                                       method:(NSString *)methodStr
                                  contentType:(NSString *)contentType
                                   parameters:(NSDictionary *_Nullable)parameters
                            completionHandler:(void (^)(NSURLResponse *response, id responseObject, NSError *error))completionHandler{
    
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
    AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:configuration];
    NSMutableURLRequest * request;
    if ([contentType isEqualToString:@"application/json"]) {
        AFJSONResponseSerializer* response = [AFJSONResponseSerializer serializer];
        manager.responseSerializer = response;
        request = [[AFJSONRequestSerializer serializer] requestWithMethod:methodStr URLString:urlStr parameters:parameters error:nil];
    }else{
        request = [[AFHTTPRequestSerializer serializer] requestWithMethod:methodStr URLString:urlStr parameters:parameters error:nil];
    }
    [request setValue:contentType forHTTPHeaderField:@"Content-Type"];
    
    if (kMyUser.accessToken.length != 0) {
        [request setValue:[NSString stringWithFormat:@"Bearer %@", kMyUser.accessToken] forHTTPHeaderField:@"Authorization"];
        NSLog(@"====%@",[NSString stringWithFormat:@"Bearer %@", kMyUser.accessToken]);
    }
    request.timeoutInterval = 10;
    NSURLSessionDataTask *dataTask = [manager dataTaskWithRequest:request uploadProgress:nil downloadProgress:nil  completionHandler:completionHandler];
    [dataTask resume];
    return dataTask;
}


//上传视频
- (void)uploadVideo:(NSString *)urlStr
          parameters:(NSDictionary *)parameter
          video:(NSData *)videoData
            fileName:(NSString *)name
            progress:(void (^)(NSProgress *uploadProgress))progress
             success:(void (^)(id result))success
             failure:(void (^)(NSError *error))failure
{
    AFHTTPSessionManager *manager = [self AFHTTPSessionManager];
    ;
    NSURLSessionDataTask *uploadTask = [manager POST:urlStr parameters:parameter headers:@{@"token":(kMyUser.accessToken?:@"")} constructingBodyWithBlock:^(id<AFMultipartFormData>  _Nonnull formData) {
        NSDateFormatter *formatter = [[FormatFactory shared] dateFormatterWithFormat:@"yyyyMMddHHmmss"];
        NSString *dateStr = [formatter stringFromDate:[NSDate date]];
        NSString *fileName = [NSString  stringWithFormat:@"%@.mp4", dateStr];
        [formData appendPartWithFileData:videoData name:name fileName:fileName mimeType:@"video/mp4"];
    } progress:^(NSProgress * _Nonnull uploadProgress) {
        if (progress) {
            progress(uploadProgress);
        }
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        [manager.session finishTasksAndInvalidate];
        NSLog(@"\n网络请求 %@ 拼接参数 %@ \n结果%@", urlStr, parameter, responseObject);
        if (success) {
            success(responseObject);
        }
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [manager.session finishTasksAndInvalidate];
        NSLog(@"\n网络请求 error(%ld) %@ 拼接参数 %@", (long)error.code, urlStr, parameter);
        if (failure) {
            failure(error);
        }
    }];
    
    [uploadTask resume];
}

//上传图片
- (void)uploadImages:(NSString *)urlStr
          parameters:(NSDictionary *)parameter
          imageArray:(NSArray *)imageArray
            fileName:(NSString *)name
            progress:(void (^)(NSProgress *uploadProgress))progress
             success:(void (^)(id result))success
             failure:(void (^)(NSError *error))failure
{
    AFHTTPSessionManager *manager = [self AFHTTPSessionManager];
    NSMutableDictionary *headerDic = [[NSMutableDictionary alloc] init];
    
    NSURLSessionDataTask *uploadTask = [manager POST:urlStr parameters:parameter headers:headerDic constructingBodyWithBlock:^(id<AFMultipartFormData>  _Nonnull formData) {
        for (int i = 0; i < imageArray.count; i ++) {
            @autoreleasepool {
                UIImage *image = imageArray[i];
                //旋转图片
                UIImage *normalizedImage = image;
                if (image.imageOrientation != UIImageOrientationUp) {
                    UIGraphicsBeginImageContextWithOptions(image.size, NO, image.scale);
                    [image drawInRect:(CGRect){0, 0, image.size}];
                    UIImage *norImage = UIGraphicsGetImageFromCurrentImageContext();
                    UIGraphicsEndImageContext();
                    normalizedImage = norImage;
                }
                NSData *imageData = UIImageJPEGRepresentation(normalizedImage, 1);
                NSDateFormatter *formatter = [[FormatFactory shared] dateFormatterWithFormat:@"yyyyMMddHHmmss"];
                NSString *dateStr = [formatter stringFromDate:[NSDate date]];
                NSString *fileName = [NSString  stringWithFormat:@"%@.jpg", dateStr];
                NSString *n = [NSString stringWithFormat:@"%@%d", name, i];
                if (imageArray.count == 1) {
                    n = [NSString stringWithFormat:@"%@", name];
                }
                [formData appendPartWithFileData:imageData name:n fileName:fileName mimeType:@"image/jpeg"];
            }
        }
    } progress:^(NSProgress * _Nonnull uploadProgress) {
        if (progress) {
            progress(uploadProgress);
        }
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        [manager.session finishTasksAndInvalidate];
        NSLog(@"\n网络请求 %@ 拼接参数 %@ \n结果%@", urlStr, parameter, responseObject);
        if (success) {
            success(responseObject);
        }
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [manager.session finishTasksAndInvalidate];
        NSLog(@"\n网络请求 error(%ld) %@ 拼接参数 %@", (long)error.code, urlStr, parameter);
        if (failure) {
            failure(error);
        }
    }];
    
    [uploadTask resume];
}


+ (void)verifyResult:(id)result
                succ:(void(^)(id data, NSString *msg))success
                fail:(void(^)(int code, NSString *msg))failure
{
    /**
    * 网络请求状态码
    *
    * ' 500' => '客户不存在,请刷新页面后再试',
    * '401' => '签名失败，Token失效',
    */
    WEAK_SELF
    int code = [result[@"code"] intValue];
    NSString *msg = result[@"msg"];
    if (code == 0) {
        if (success) {
            if ([msg isKindOfClass:NSString.class]){
                if (msg.length == 0) {
                    msg = successMsg;
                }
            }
            success(result[@"data"], successMsg);
        }
    }else {
        if (failure) {
            if ([msg isKindOfClass:NSString.class]) {
                if (msg.length == 0) {
                    msg = failureMsg;
                }
            }
            if (code == 401) {
                msg = @"登录已过期，请重新登录！";
                [UserInfo clearMyUser];
                [UserInfo showLogin];
                
            }else if (code == 701){
                
            }
            failure(code, msg);
        }
    }
}

//更新并保存用户资料
- (void)saveSelfData:(NSDictionary *)dic {
    UserInfo *model = [UserInfo mj_objectWithKeyValues:dic];
    if (model.accessToken) {
        kMyUser.accessToken = model.accessToken;
    }
    if (model.userId) {
        kMyUser.userId = model.userId;
    }
    [UserInfo saveMyUser];
}


#pragma mark -- 获取当前VC
- (UIViewController *)getCurrentViewController
{
    
    UIWindow* window = [[[UIApplication sharedApplication] delegate] window];
    UIViewController* currentViewController = window.rootViewController;
    BOOL runLoopFind = YES;
    while (runLoopFind) {
        if (currentViewController.presentedViewController) {
            
            currentViewController = currentViewController.presentedViewController;
        } else if ([currentViewController isKindOfClass:[UINavigationController class]]) {
            
            UINavigationController* navigationController = (UINavigationController* )currentViewController;
            currentViewController = [navigationController.childViewControllers lastObject];
            
        } else if ([currentViewController isKindOfClass:[UITabBarController class]]) {
            
            UITabBarController* tabBarController = (UITabBarController* )currentViewController;
            currentViewController = tabBarController.selectedViewController;
        } else {
            
            NSUInteger childViewControllerCount = currentViewController.childViewControllers.count;
            if (childViewControllerCount > 0) {
                
                currentViewController = currentViewController.childViewControllers.lastObject;
                
                return currentViewController;
            } else {
                
                return currentViewController;
            }
        }
        
    }
    return currentViewController;
}

@end

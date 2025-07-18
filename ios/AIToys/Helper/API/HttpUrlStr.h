//
//  HttpUrlStr.h
//  KunQiTong
//
//  Created by 乔不赖 on 2021/11/2.
//

#ifndef HttpUrlStr_h
#define HttpUrlStr_h

#pragma mark -- 服务器地址

#define Release 0

//域名
#define PATH  Release ? @"https://test-talenpal-api.baseus.cn:10002/" : @"https://test-talenpal-api.baseus.cn:10002/"

//服务器接口
#define  API(URL)  [NSString stringWithFormat:@"%@app-api/%@",PATH,URL]


//登录
#define Login_URL API(@"member/auth/login")

//首页
#define HomeDoolList_URL API(@"doll/instance/page")

//首页Banner
#define HomeBannerList_URL API(@"content/banner/list")

//启动图
#define SplashScreen_URL API(@"content/splash-screen/list")

//手动添加设备列表
#define DoolModelList_URL API(@"doll/model/list")


//获取登录短信验证码
#define GetLoginSmsCode_URL API(@"send_messagess.html")

//个人信息
#define GetUserInfo_URL API(@"index_msgs.html")

//修改用户信息
#define EditUserInfo_URL API(@"change_users.html")

//客服中心
#define CustomerCenterUrl [NSString stringWithFormat:@"%@xiaogenihao/qd/opinion.html",PATH]
//用户协议
#define UserAgreementUrl [NSString stringWithFormat:@"%@vue-app/#/userAgreement",PATH]
//隐私协议
#define PrivacyAgreementUrl [NSString stringWithFormat:@"%@vue-app/#/privacyAgreement",PATH]


#endif /* HttpUrlStr_h */

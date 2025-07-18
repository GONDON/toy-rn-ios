//
//  AppConfigureHeader.h
//  HelloBrother
//
//  Created by 乔不赖 on 2024/1/15.
//

#ifndef AppConfigureHeader_h
#define AppConfigureHeader_h


//涂鸦SDK
#define Smart_APPID @"us4nm48mewaesxx3qaq9"
#define Smart_AppSecret @"v94csad5tkq4fmxjg8fqgpjh5t98fw5e"
#define Country_Code @"86"

//#define Smart_APPID @"qu5yrxr58d3snsyvmff9"
//#define Smart_AppSecret @"epxh4qeag73tgk8ye73j7hddyvdd4y59"


#pragma mark - ************** key **************

// 是否首次启动 key
#define KEY_ISFIRSTLAUNCH @"KEY_IsFirstLaunch"

#define PROVINCENAME @"ProvinceName"
#define CITYNAME @"CityName"
#define HOMEID @"HomeID"

// wifi 网络
#define NetworkReachableWifi @"NetworkReachableWifi"


#pragma mark - ************** 颜色 **************

#define BLOCKCOLOR RGBCOLOR(0, 0, 0)
#define WHITECOLOR RGBCOLOR(255, 255, 255)

#define ORANGECOLOR RGBCOLOR(255, 90, 96) //RGBCOLOR(255, 132, 32)
#define PINKCOLOR_255_90_96 RGBCOLOR(255, 90, 96) //RGBCOLOR(248, 160, 3)
#define ORANGECOLOR_249 RGBCOLOR(255, 90, 96) //RGBCOLOR(249, 202, 6)


#define GRAYCOLOR RGBCOLOR(26, 26, 26)
#define GRAYCOLORALPHA RGBACOLOR(26, 26, 26, 0.5)
#define GRAYCOLOR_26 RGBCOLOR(26, 26, 26)
#define GRAYCOLOR_51 RGBCOLOR(51, 51, 51)
#define GRAYCOLOR_167 RGBCOLOR(167, 167, 167)
#define GRAYCOLOR_243 RGBCOLOR(243, 243, 243)
#define GRAYCOLOR_153 RGBCOLOR(153, 153, 153)
#define GRAYCOLOR_248 RGBCOLOR(248, 160, 3)
#define GRAYCOLOR_FFFFFF @"#ffffff"
#define SHADOWCOLOR [UIColor colorWithRed:0.0f/255.0f green:0.0f/255.0f blue:0.0f/255.0f alpha:0.1f]

#define SUBJECTCOLOR RGBCOLOR(255, 90, 96) //[UIColor colorWithRed:0.97 green:0.79 blue:0.18 alpha:1.00]

#define LINE_COLOR_245 RGBCOLOR(245, 245, 245)
#define WHITE_COLOR_245 RGBCOLOR(245, 245, 245)
#pragma mark - ************** 字体大小 **************

#define ATT_FONT_14 [UIFont systemFontOfSize:VScaleW(14.0f)]
#define ATT_FONT_16 [UIFont systemFontOfSize:VScaleW(16.0f)]
#define ATT_FONT_17 [UIFont systemFontOfSize:VScaleW(17.0f)]
#define ATT_FONT_BOLD_17 [UIFont boldSystemFontOfSize:VScaleW(17.0f)]



/// 暗黑模式 YES是
#define CKDarkMode @available(iOS 13.0, *) && UITraitCollection.currentTraitCollection.userInterfaceStyle == UIUserInterfaceStyleDark

// MARK: - 十六进制颜色

#define HexOf(rgbValue) Hex_A(rgbValue,1.0)

#define Hex_A(rgbValue,a) [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 green:((float)((rgbValue & 0xFF00) >> 8))/255.0 blue:((float)(rgbValue & 0xFF))/255.0 alpha:a]

// MARK: - 用全局变量设置背景、文字,可以优雅的主题切换 (取全局唯一性的名称,便于维护;最前面的优先级最高)


#define Color_Title     CKDarkMode?HexOf(0xFFFFFF):HexOf(0x393939) //主文字颜色      白色/黑色

#define Color_Subtitle  CKDarkMode?HexOf(0x999999):HexOf(0x999999) //副文字颜色      浅白色/灰色

#define Color_Line      CKDarkMode?HexOf(0x191C32):HexOf(0xf4f4f4) //分割线

#define Color_DarkGray  CKDarkMode?HexOf(0x333333):HexOf(0x333333) //深灰色

#define Color_Gray      CKDarkMode?HexOf(0x666666):HexOf(0x666666) //灰色

#define Color_LightGray CKDarkMode?HexOf(0x999999):HexOf(0x999999) //浅灰色


// 颜色(RGB)
#define RGBCOLOR(r, g, b)       [UIColor colorWithRed:(r)/255.0f green:(g)/255.0f blue:(b)/255.0f alpha:1]
#define RGBACOLOR(r, g, b, a)   [UIColor colorWithRed:(r)/255.0f green:(g)/255.0f blue:(b)/255.0f alpha:(a)]
// 随机颜色
#define RANDOM_UICOLOR     [UIColor colorWithRed:arc4random_uniform(256) / 255.0 green:arc4random_uniform(256) / 255.0 blue:arc4random_uniform(256) / 255.0 alpha:1]

// 当前语言
#define CURRENTLANGUAGE         ([[NSLocale preferredLanguages] objectAtIndex:0])

// 本地化字符串
/** NSLocalizedString宏做的其实就是在当前bundle中查找资源文件名“Localizable.strings”(参数:键＋注释) */
#define LocalString(x, ...)     NSLocalizedString(x, nil)
/** NSLocalizedStringFromTable宏做的其实就是在当前bundle中查找资源文件名“xxx.strings”(参数:键＋文件名＋注释) */
#define AppLocalString(x, ...)  NSLocalizedStringFromTable(x, @"someName", nil)

// 时间间隔
#define kHUDDuration            (1.f)
// 一天的秒数
#define SecondsOfDay            (24.f * 60.f * 60.f)
// 秒数
#define Seconds(Days)           (24.f * 60.f * 60.f * (Days))
// 一天的毫秒数
#define MillisecondsOfDay       (24.f * 60.f * 60.f * 1000.f)
// 毫秒数
#define Milliseconds(Days)      (24.f * 60.f * 60.f * 1000.f * (Days))

#define KUserDefaults [NSUserDefaults standardUserDefaults]

// 检查字符串是否为空(PS：这里认为nil," ", "\n"均是空)
#define strIsEmpty(str)      (str==nil || [str length]==0 || [[str stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] length] == 0)

//防止多次调用
#define kPreventRepeatClickTime(_seconds_) \
static BOOL shouldPrevent; \
if (shouldPrevent) return; \
shouldPrevent = YES; \
dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)((_seconds_) * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{ \
shouldPrevent = NO; \
}); \


#define TempAppDelegate ((AppDelegate *)[UIApplication sharedApplication].delegate)
#define TempAppKeyWindow [UIApplication sharedApplication].keyWindow

//keyWindow
#define kWindow [UIApplication sharedApplication].delegate.window

//rootViewController
#define kRootVC [UIApplication sharedApplication].delegate.window.rootViewController

//weakSelf
#define WS(weakSelf)  __weak __typeof(&*self)weakSelf = self

#define QD_IMG(_name_) [UIImage imageNamed:_name_]

#endif /* AppConfigureHeader_h */

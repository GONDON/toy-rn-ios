//
//  MineViewController.m
//  AIToys
//
//  Created by 乔不赖 on 2025/6/18.
//

#import "MineViewController.h"
#import "LoginViewController.h"

@interface MineViewController ()

@end

@implementation MineViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
}

//退出登录
- (IBAction)exitBtnClick:(id)sender {
    [[ThingSmartUser sharedInstance] loginOut:^{
//        [UserInfo clearMyUser];
        [UIApplication sharedApplication].keyWindow.rootViewController = [[MyNavigationController alloc]initWithRootViewController:[LoginViewController new]];
    } failure:^(NSError *error) {
        [SVProgressHUD showErrorWithStatus:@"Failed to Logout."];
    }];
}

- (IBAction)deleteBtnClick:(id)sender {
    [[ThingSmartUser sharedInstance] cancelAccount:^{
            NSLog(@"cancel account success");
        [UserInfo clearMyUser];
        [UIApplication sharedApplication].keyWindow.rootViewController = [[MyNavigationController alloc]initWithRootViewController:[LoginViewController new]];
        } failure:^(NSError *error) {
            NSLog(@"cancel account failure: %@", error);
        }];
}


/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end

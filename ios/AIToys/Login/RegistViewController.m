//
//  RegistViewController.m
//  AIToys
//
//  Created by 乔不赖 on 2025/6/18.
//

#import "RegistViewController.h"
#import "CodeViewController.h"
#import "AcountLoginViewController.h"
#import "LoginViewController.h"

@interface RegistViewController ()<UITextFieldDelegate>
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (weak, nonatomic) IBOutlet UILabel *acountTitleLabel;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *accountTitleH;

@property (weak, nonatomic) IBOutlet UITextField *textField;
@property (weak, nonatomic) IBOutlet UIButton *sendCodeBtn;
@property (weak, nonatomic) IBOutlet UILabel *alertLabel;

@end

@implementation RegistViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self setUpUI];
}

-(void)setUpUI{
    self.textField.delegate = self;
    self.titleLabel.text = self.isForgetPwd ? NSLocalizedString(@"忘记密码", @""): NSLocalizedString(@"注册", @"");
    self.acountTitleLabel.text = NSLocalizedString(@"账号", @"");
    self.textField.placeholder = NSLocalizedString(@"账号", @"");
    self.alertLabel.text = NSLocalizedString(@"请输入正确的邮箱地址", @"");
    [self.sendCodeBtn setTitle:NSLocalizedString(@"获取验证码", @"") forState:0];
    [PublicObj makeButtonUnEnable:self.sendCodeBtn];
    if(self.numStr.length>0){
        self.textField.text = self.numStr;
        self.acountTitleLabel.hidden = NO;
        self.accountTitleH.constant = 15;
        [self checkEmail];
    }
}

- (IBAction)sendCodeBtnClcik:(UIButton *)sender {
    kPreventRepeatClickTime(1)
    WS(weakSelf);
    [[ThingSmartUser sharedInstance] sendVerifyCodeWithUserName:self.textField.text region:[[ThingSmartUser sharedInstance] getDefaultRegionWithCountryCode:Country_Code] countryCode:Country_Code type:self.isForgetPwd ? 3 : 1 success:^{
        [SVProgressHUD showSuccessWithStatus:@"Verification Code Sent Successfully"];
        CodeViewController *VC = [CodeViewController new];
        VC.numStr = weakSelf.textField.text;
        VC.isForgetPwd = weakSelf.isForgetPwd;
        [weakSelf.navigationController pushViewController:VC animated:YES];
    } failure:^(NSError *error) {
        if(error.code == 1506){
            [UIAlertController cs_alertControllerWithTitle:nil message:LocalString(@"账号已存在，是否立即登录?") preferredStyle:UIAlertControllerStyleAlert cancleButtonTitle:LocalString(@"取消") otherTitle:@[LocalString(@"确定")] controller:self actionBlock:^(UIAlertAction * _Nonnull action, NSInteger idx) {
                if(idx == 1){
                    kMyUser.email = weakSelf.textField.text;
                    //跳转去一个特定的界面
                   NSArray *vcsArr =  self.navigationController.viewControllers;
                   NSMutableArray *vcsMutArr = [[NSMutableArray alloc]initWithArray:vcsArr];
                    for (UIViewController *controller in vcsArr) {
                        if ([controller isKindOfClass:[LoginViewController class]]){
                            //创建要跳转去的控制器
                            AcountLoginViewController *bankListVc = [[AcountLoginViewController alloc]init];
                            //获取查找出来的控制器index
                            NSInteger index = [vcsMutArr indexOfObject:controller];
                            //把要跳转去的控制器插入数组
                            [vcsMutArr insertObject:bankListVc atIndex:index + 1];
                            //再次给self.navigationController.viewControllers赋值
                            [weakSelf.navigationController setViewControllers:vcsMutArr];
                            //跳转去控制器
                            [weakSelf.navigationController popToViewController:bankListVc animated:YES];
                        }
                    }
                }
            }];
        }else{
            [SVProgressHUD showErrorWithStatus:error.localizedDescription];
        }
    }];
}

#pragma mark -- UITextFieldDelegate
- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string{
    if(textField.text.length + string.length - range.length > 0){
        self.acountTitleLabel.hidden = NO;
        self.accountTitleH.constant = 15;
        [self checkEmail];
    }else{
        self.acountTitleLabel.hidden = YES;
        self.accountTitleH.constant = 0;
    }
    return YES;
}

-(void)textFieldDidEndEditing:(UITextField *)textField{
    [self checkEmail];
}

- (void)checkEmail{
    if(![self.textField.text validateForRegex:[NSString emailRegex]]) {
        //格式错误
        self.alertLabel.hidden = NO;
        [PublicObj makeButtonUnEnable:self.sendCodeBtn];
    }else{
        self.alertLabel.hidden = YES;
        [PublicObj makeButtonEnable:self.sendCodeBtn];
    }
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

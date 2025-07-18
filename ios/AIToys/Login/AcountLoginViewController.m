//
//  AcountLoginViewController.m
//  AIToys
//
//  Created by qdkj on 2025/6/20.
//

#import "AcountLoginViewController.h"
#import "RegistViewController.h"
#import "MyTabBarController.h"
#import "UserPermmitVC.h"

@interface AcountLoginViewController ()<UITextFieldDelegate,UITextViewDelegate>
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (weak, nonatomic) IBOutlet UILabel *accountNameLab;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *accountLabH;
@property (weak, nonatomic) IBOutlet UITextField *accountTextField;
@property (weak, nonatomic) IBOutlet UILabel *pwdNameLab;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *pwdLabH;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *viewBtnRight;

@property (weak, nonatomic) IBOutlet UITextField *pwdTextField;
@property (weak, nonatomic) IBOutlet UIImageView *agreeImg;
@property (weak, nonatomic) IBOutlet UITextView *agreeTextView;
@property (weak, nonatomic) IBOutlet UIButton *loginBtn;
@property (weak, nonatomic) IBOutlet UIButton *forgetBtn;
@property (weak, nonatomic) IBOutlet UIButton *viewBtn;

@end

@implementation AcountLoginViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self setUpUI];
    if (kMyUser.email) {
        self.accountTextField.text = kMyUser.email;
        self.accountNameLab.hidden = NO;
        self.accountLabH.constant = 15;
    }
    if (kMyUser.passWord) {
        self.pwdTextField.text = kMyUser.passWord;
        self.pwdNameLab.hidden = NO;
        self.pwdLabH.constant = 15;
    }
    if(self.accountTextField.text.length > 0 && self.pwdTextField.text.length > 0){
        [PublicObj makeButtonEnable:self.loginBtn];
    }else{
        [PublicObj makeButtonUnEnable:self.loginBtn];
    }
}

-(void)setUpUI{
    self.accountTextField.delegate = self;
    self.pwdTextField.delegate = self;
    self.agreeTextView.delegate =  self;
    self.titleLabel.text = NSLocalizedString(@"登录", @"");
    self.accountNameLab.text = NSLocalizedString(@"账号", @"");
    self.accountTextField.placeholder = NSLocalizedString(@"账号", @"");
    self.pwdNameLab.text = NSLocalizedString(@"密码", @"");
    self.pwdTextField.placeholder = NSLocalizedString(@"密码", @"");
    [self.loginBtn setTitle:NSLocalizedString(@"登录", @"") forState:0];
    [self.forgetBtn setTitle:NSLocalizedString(@"忘记密码", @"") forState:0];
    NSString *fullText = NSLocalizedString(@"同意 <隐私政策> <用户服务协议> ", @"");
    NSMutableAttributedString *attrStr = [[NSMutableAttributedString alloc] initWithString:fullText];
    // 设置协议文本颜色
    [attrStr addAttribute:NSForegroundColorAttributeName
                       value:mainColor
                       range:[fullText rangeOfString:NSLocalizedString(@"<隐私政策>", @"")]];
    [attrStr addAttribute:NSForegroundColorAttributeName
                       value:mainColor
                       range:[fullText rangeOfString:NSLocalizedString(@"<用户服务协议>", @"")]];
        
    // 添加自定义链接标识
    [attrStr addAttribute:NSLinkAttributeName
                       value:@"privacyPolicy://"
                       range:[fullText rangeOfString:NSLocalizedString(@"<隐私政策>", @"")]];
    [attrStr addAttribute:NSLinkAttributeName
                       value:@"userProtocol://"
                       range:[fullText rangeOfString:NSLocalizedString(@"<用户服务协议>", @"")]];
    self.agreeTextView.attributedText = attrStr;
    UITapGestureRecognizer *tapRecognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(addGestureRecognizer:)];
    [self.agreeTextView addGestureRecognizer:tapRecognizer];
    [self setRightBtn];
    self.pwdTextField.clearButtonMode = UITextFieldViewModeWhileEditing;
}

//设置右侧按钮
-(void)setRightBtn{
    UIButton *rightButton = [[UIButton alloc] initWithFrame:CGRectMake(0,0, 40, 44)];
    [rightButton setTitle:LocalString(@"注册") forState:UIControlStateNormal];
    [rightButton setTitleColor:UIColorFromRGBA(000000, 0.9) forState:UIControlStateNormal];
    rightButton.titleLabel.font = [UIFont systemFontOfSize:15];
    rightButton.titleLabel.textAlignment = NSTextAlignmentCenter;
    [rightButton addTarget:self action:@selector(regist) forControlEvents:UIControlEventTouchUpInside];
    UIBarButtonItem* rightItem = [[UIBarButtonItem alloc]initWithCustomView:rightButton];
    self.navigationItem.rightBarButtonItem = rightItem;
}

-(void)regist{
    RegistViewController *VC = [RegistViewController new];
    [self.navigationController pushViewController:VC animated:YES];
}

//查看明文密码
- (IBAction)viewPwd:(UIButton *)sender {
    sender.selected = !sender.selected;
    self.pwdTextField.secureTextEntry = !self.pwdTextField.secureTextEntry;
}

//同意协议
- (IBAction)agreeBtnClick:(UIButton *)sender {
    self.agreeImg.highlighted = !self.agreeImg.highlighted;
}

//登录
- (IBAction)loginBtnClick:(UIButton *)sender {
    if(!self.agreeImg.highlighted){
        [SVProgressHUD showErrorWithStatus:@"请勾选协议"];
        return;
    }
    if(![self.accountTextField.text validateForRegex:[NSString emailRegex]]) {
        //格式错误
        [SVProgressHUD showErrorWithStatus:@"请输入正确的邮箱"];
        return;
    }
    [self showHud];
    WEAK_SELF
    [[ThingSmartUser sharedInstance] loginByEmail:Country_Code email:self.accountTextField.text password:self.pwdTextField.text success:^{
        //登录平台账号
        [weakSelf loginSaas];
    } failure:^(NSError *error) {
        [weakSelf hiddenHud];
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    }];
    
    
}

- (void)loginSaas{
    WEAK_SELF
    NSMutableDictionary *param = [NSMutableDictionary dictionary];
    NSString *uid = [ThingSmartUser sharedInstance].uid;
    [param setObject: uid forKey:@"username"];
    [param setObject: [uid md5String] forKey:@"password"];
    [param setObject: @(1) forKey:@"autoRegister"];
    [[APIManager shared] POSTJSON:Login_URL parameter:param success:^(id  _Nonnull result, id  _Nonnull data, NSString * _Nonnull msg) {
        [weakSelf hiddenHud];
        [SVProgressHUD showSuccessWithStatus:@"Login Successfully"];
        kMyUser.email = weakSelf.accountTextField.text;
        kMyUser.passWord = weakSelf.pwdTextField.text;
        [UserInfo saveMyUser];
        //第一次启动app
        if (![[NSUserDefaults standardUserDefaults] boolForKey:KEY_ISFIRSTLAUNCH]) {
            //权限页
            UserPermmitVC *VC = [[UserPermmitVC alloc] init];
            [self.navigationController pushViewController:VC animated:YES];
        } else {
            //进入首页
            MyTabBarController *tabbar = [MyTabBarController new];
            [UIApplication sharedApplication].keyWindow.rootViewController = tabbar;
        }
        
    } failure:^(NSError * _Nonnull error, NSString * _Nonnull msg) {
        [weakSelf hiddenHud];
    }];
}

//忘记密码
- (IBAction)forgetBtnClick:(UIButton *)sender {
    RegistViewController *VC = [RegistViewController new];
    VC.isForgetPwd = YES;
    VC.numStr = self.accountTextField.text;
    [self.navigationController pushViewController:VC animated:YES];
}

//添加点击手势
-(void)addGestureRecognizer:(UIGestureRecognizer*)gestureRecognizer{
    if ([gestureRecognizer isKindOfClass:[UITapGestureRecognizer class]])
    {
        CGPoint tapLocation = [gestureRecognizer locationInView:self.agreeTextView];
        UITextPosition *textPosition = [self.agreeTextView closestPositionToPoint:tapLocation];
        NSDictionary *attributes = [self.agreeTextView textStylingAtPosition:textPosition inDirection:UITextStorageDirectionBackward];
        NSURL *url = attributes[NSLinkAttributeName];
        if(url) {
            NSRange range = [self.agreeTextView.text rangeOfString:NSLocalizedString(@"<隐私政策>", @"")];
            if (([url isKindOfClass:[NSString class]] && [(NSString *)url containsString:@"privacyPolicy"]) || (([url isKindOfClass:[NSURL class]] && [[url scheme] containsString:@"privacyPolicy"]))) {
                range = [self.agreeTextView.text rangeOfString:NSLocalizedString(@"<隐私政策>", @"")];
            } else if(([url isKindOfClass:[NSString class]] && [(NSString *)url containsString:@"userProtocol"]) || (([url isKindOfClass:[NSURL class]] && [[url scheme] containsString:@"userProtocol"]))){
                range = [self.agreeTextView.text rangeOfString:NSLocalizedString(@"<用户服务协议>", @"")];
            }
            [self textView:self.agreeTextView shouldInteractWithURL:url inRange:range];
        }
    }
}

#pragma mark -- UITextFieldDelegate
- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string{
    if(textField.text.length + string.length - range.length > 0){
        if([textField isEqual:self.accountTextField]){
            self.accountNameLab.hidden = NO;
            self.accountLabH.constant = 15;
        }else{
            self.pwdNameLab.hidden = NO;
            self.pwdLabH.constant = 15;
            self.viewBtn.hidden = NO;
        }
        
    }else{
        if([textField isEqual:self.pwdTextField]){
            self.pwdNameLab.hidden = YES;
            self.pwdLabH.constant = 0;
            self.viewBtn.hidden = YES;
        }else{
            self.accountNameLab.hidden = YES;
            self.accountLabH.constant = 0;
        }
    }
    return YES;
}

-(void)textFieldDidBeginEditing:(UITextField *)textField{
    if([textField isEqual:self.pwdTextField]){
        self.viewBtn.hidden = textField.text.length == 0;
    }
}

-(void)textFieldDidEndEditing:(UITextField *)textField{
    self.viewBtn.hidden = YES;
    if(self.accountTextField.text.length > 0 && self.pwdTextField.text.length > 0) {
        [PublicObj makeButtonEnable:self.loginBtn];
    }else{
        [PublicObj makeButtonUnEnable:self.loginBtn];
    }
}

- (BOOL)textView:(UITextView *)textView shouldInteractWithURL:(NSURL *)URL inRange:(NSRange)characterRange{
    if ([(NSString *)URL containsString:@"userProtocol"]) {
        //用户协议
        NSLog(@"点击了用户协议");
        return NO;
    } else if ([(NSString *)URL containsString:@"privacyPolicy"]) {
        NSLog(@"点击了隐私政策");
        return NO;
    }
    return YES;
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

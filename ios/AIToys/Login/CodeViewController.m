//
//  CodeViewController.m
//  AIToys
//
//  Created by 乔不赖 on 2025/6/18.
//

#import "CodeViewController.h"
#import "HWTextCodeView.h"
#import "QSTextCodeView.h"
#import "SetPasswordVC.h"
#import "SetNewPasswordViewController.h"
#import "UILabel+ClickIndex.h"

@interface CodeViewController ()
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (weak, nonatomic) IBOutlet UILabel *subTitleLabel;
@property (weak, nonatomic) IBOutlet UIView *codeView;
@property (weak, nonatomic) IBOutlet UIButton *unReceiveBtn;
@property (weak, nonatomic) IBOutlet UILabel *alertLabel;

@property (nonatomic, strong) QSTextCodeView *textView;
@property (nonatomic, copy) NSString *codeStr;
@end

@implementation CodeViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.titleLabel.text = NSLocalizedString(@"输入验证码", @"");
    self.textView = [[QSTextCodeView alloc] initWithFrame:CGRectMake(0, 0, self.codeView.width, 45)];
    self.textView.fieldCount = 6;
    WS(weakSelf);
    self.textView.resultBlock = ^(NSString * _Nonnull str, NSDictionary * _Nonnull dic, BOOL isOK) {
        NSLog(@"输入框文字 = %@",str);
        weakSelf.codeStr = str;
        if(isOK){
            if (weakSelf.codeStr.length < 6) {
                [SVProgressHUD showErrorWithStatus:@"请输入6位验证码"];
                return;
            }
            [[ThingSmartUser sharedInstance] checkCodeWithUserName:weakSelf.numStr region:[[ThingSmartUser sharedInstance] getDefaultRegionWithCountryCode:Country_Code] countryCode:Country_Code code:weakSelf.codeStr type:weakSelf.isForgetPwd ? 3 : 1 success:^(BOOL result) {
                if (result) {
                    if(weakSelf.isForgetPwd){
                        SetNewPasswordViewController *VC = [SetNewPasswordViewController new];
                        VC.numStr = weakSelf.numStr;
                        VC.codeStr = weakSelf.codeStr;
                        [weakSelf.navigationController pushViewController:VC animated:YES];
                    }else{
                        //设置密码
                        SetPasswordVC *VC = [SetPasswordVC new];
                        VC.numStr = weakSelf.numStr;
                        VC.codeStr = weakSelf.codeStr;
                        [weakSelf.navigationController pushViewController:VC animated:YES];
                    }
                } else {
                    [SVProgressHUD showErrorWithStatus:LocalString(@"验证码有误")];
                }
            } failure:^(NSError *error) {
                [SVProgressHUD showErrorWithStatus:error.localizedDescription];
                
            }];
            
        }
        
    };
    [self.codeView addSubview:self.textView];
    
    [self setCountDown];
    [self.unReceiveBtn setTitle:NSLocalizedString(@"收不到验证码?", @"") forState:0];
    NSString *str = [NSString stringWithFormat:@"%@：%@",NSLocalizedString(@"验证码已发送到您的邮箱", @""),self.numStr];
    NSMutableAttributedString *attStr=[[NSMutableAttributedString alloc]initWithString:str];
    self.subTitleLabel.attributedText = attStr;
    UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleLabelTap:)];
    [self.subTitleLabel addGestureRecognizer:tapGesture];
}

//验证码倒计时
- (void)setCountDown{
    __block int timeValue = 60;
    NSTimer *timer = [NSTimer timerWithTimeInterval:1.0 block:^(NSTimer * _Nonnull timer) {
        
        if (timeValue > 0) {
            self.subTitleLabel.userInteractionEnabled = NO;
            NSString *str = [NSString stringWithFormat:@"%@：%@，%@（%ds）",NSLocalizedString(@"验证码已发送到您的邮箱", @""),self.numStr,NSLocalizedString(@"重新发送", @""),timeValue--];
            NSMutableAttributedString *attStr=[[NSMutableAttributedString alloc]initWithString:str];
            self.subTitleLabel.attributedText = attStr;
//            self.countLabel.text = [NSString stringWithFormat:@"重新发送（%ds）",timeValue--];
        }else if (timeValue == 0){
            [timer invalidate];
            timeValue = 60;
            self.subTitleLabel.userInteractionEnabled = YES; // 确保label可以响应手势
            NSString *str = [NSString stringWithFormat:@"%@：%@，%@",NSLocalizedString(@"验证码已发送到您的邮箱", @""),self.numStr,NSLocalizedString(@"重新发送", @"")];
            //获取要调整颜色的文字位置,调整颜色
            NSMutableAttributedString *attStr=[[NSMutableAttributedString alloc]initWithString:str];
            NSRange range=[[attStr string]rangeOfString:NSLocalizedString(@"重新发送", @"")];
            [attStr addAttribute:NSForegroundColorAttributeName value:mainColor range:range];
            self.subTitleLabel.attributedText = attStr;
        }
    } repeats:YES];
    [[NSRunLoop currentRunLoop]addTimer:timer forMode:NSRunLoopCommonModes];
}

//发送验证码
- (IBAction)sentBtnClick:(id)sender {
    [self sendCode];
}

-(void)sendCode{
    WS(weakSelf);
    [[ThingSmartUser sharedInstance] sendVerifyCodeWithUserName:self.numStr region:[[ThingSmartUser sharedInstance] getDefaultRegionWithCountryCode:Country_Code] countryCode:Country_Code type: self.isForgetPwd ? 3 : 1 success:^{
        [SVProgressHUD showSuccessWithStatus:@"Verification Code Sent Successfully"];
        [weakSelf setCountDown];
    } failure:^(NSError *error) {
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    }];
}

//未收到验证码
- (IBAction)unReceiveBtnClick:(id)sender {
   
}

- (void)handleLabelTap:(UITapGestureRecognizer *)gesture {
    WS(weakSelf);
    UILabel *label = (UILabel *)gesture.view;
    NSString *text = label.text;
    NSRange targetRange = [text rangeOfString:NSLocalizedString(@"重新发送", @"")];
    
    CGPoint tapLocation = [gesture locationInView:label];
    CGRect textRect = [label textRectForBounds:label.bounds
                        limitedToNumberOfLines:label.numberOfLines];
    
    if (CGRectContainsPoint(textRect, tapLocation)) {
        NSUInteger index = [label characterIndexAtPoint:tapLocation];
        if (NSLocationInRange(index, targetRange)) {
            NSLog(@"点击了目标文字");
            [weakSelf sendCode];
        }
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

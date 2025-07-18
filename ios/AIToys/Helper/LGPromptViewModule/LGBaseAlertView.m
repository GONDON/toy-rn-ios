//
//  LGBaseAlertView.m
//  QiDianProhibit
//
//  Created by KWOK on 2019/4/24.
//  Copyright © 2019 Henan Qidian Network Technology Co. All rights reserved.
//

#import "LGBaseAlertView.h"
#import "LGTextView.h"
#import <MBProgressHUD+JDragon.h>

@interface LGBaseAlertView ()<UITextViewDelegate>
@property (nonatomic, strong) UITableView *tableView;
@property (nonatomic, strong) NSArray        *dataArr;
@property (nonatomic, strong) UIControl* bgControl;
@property (nonatomic, assign) float keyBoardHight;
@property (assign, nonatomic) CGRect originalFrame;
@end

@implementation LGBaseAlertView

- (instancetype)initWithType:(ALERT_VIEW_TYPE )type block:(void (^)(BOOL, id))block
{
    if(self = [super initWithFrame:CGRectMake(0, 0, kScreenWidth, kScreenHeight)]){
        _type = type;
        _block = block;
        _lastHeight = 0;
         _originalFrame = self.frame;
        [self setBackgroundColor:UIColorFromRGBA(0x000000, 0.4)];
//        [[NSNotificationCenter defaultCenter] addObserver:self
//                                                 selector:@selector(keyboardWasShow:)
//                                                     name:UIKeyboardWillShowNotification object:nil];
//
//        [[NSNotificationCenter defaultCenter] addObserver:self
//                                                 selector:@selector(keyboardWillBeHidden:)
//                                                     name:UIKeyboardWillHideNotification object:nil];
    }
    return self;
}
#pragma mark - == 键盘弹出事件 ==
- (void)keyboardWasShow:(NSNotification*)notification{
    
    CGRect keyBoardFrame = [[[notification userInfo] objectForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
    
    _keyBoardHight = keyBoardFrame.size.height;
    
    [self translationWhenKeyboardDidShow:_keyBoardHight];
}

- (void)keyboardWillBeHidden:(NSNotification*)notification{
    
    [self translationWhenKeyBoardDidHidden];
}

- (void)translationWhenKeyboardDidShow:(CGFloat)keyBoardHight{
    [UIView animateWithDuration:0.25 animations:^{
        self.frame = CGRectMake(self.frame.origin.x, kScreenHeight-(keyBoardHight+self.frame.size.height - 100), self.frame.size.width, self.frame.size.height);
    }];
}

- (void)translationWhenKeyBoardDidHidden{
    [UIView animateWithDuration:0.25 animations:^{
        self.frame = _originalFrame;
    }];
}

//默认弹窗
+ (LGBaseAlertView* )showAlertWithTitle:(NSString *)titleStr content:(NSString *)contentStr cancelBtnStr:(NSString *)cancelStr confirmBtnStr:(NSString *)confirmStr confirmBlock:(void (^)(BOOL is_value, id obj))block
{
    NSMutableDictionary* info = @{}.mutableCopy;
    [info setValue:titleStr forKey:@"title"];
    [info setValue:contentStr forKey:@"content"];
    [info setValue:cancelStr forKey:@"cancelStr"];
    [info setValue:confirmStr forKey:@"confirmStr"];   
    return [self showAlertInfo:info withType:ALERT_VIEW_TYPE_NORMAL confirmBlock:block];

}
+ (LGBaseAlertView *)showAlertwWithContent:(NSString *)contentStr WithHandle:(void (^)(BOOL isValue, id obj))block{
    NSMutableDictionary* info = @{}.mutableCopy;
    [info setValue:@"温馨提示" forKey:@"title"];
    [info setValue:contentStr forKey:@"content"];
    [info setValue:@"取消" forKey:@"cancelStr"];
    [info setValue:@"确定" forKey:@"confirmStr"];
    return [self showAlertInfo:info withType:ALERT_VIEW_TYPE_NORMAL confirmBlock:block];
}
+ (LGBaseAlertView* )showAlertWithContent:(NSString *)contentStr  confirmBlock:(void (^)(BOOL is_value, id obj))block {
    NSMutableDictionary* info = @{}.mutableCopy;
    [info setValue:@"温馨提示" forKey:@"title"];
    [info setValue:contentStr forKey:@"content"];
    [info setValue:@"确定" forKey:@"confirmStr"];
    return [self showAlertInfo:info withType:ALERT_VIEW_TYPE_NORMAL_VERTION confirmBlock:block];
}

//自定义弹出
+ (LGBaseAlertView * )showAlertInfo:(id)info withType:(ALERT_VIEW_TYPE )type confirmBlock:(void (^)(BOOL is_value, id obj))block
{
    LGBaseAlertView* alert = [[self alloc] initWithType:type block:block];
    [alert show];
    alert.info = info;
    [alert layoutAlert];
    return alert;
}
/**
 按钮点击回调
 */
- (void)bgControlResponse
{
    WEAK_SELF
    if(_isAllowDismiss){
        [UIView animateWithDuration:.25 animations:^{
            [self setAlpha:0];
        } completion:^(BOOL finished) {
            [self removeFromSuperview];
            if(weakSelf.block) {
                weakSelf.block(NO, @(0));
            }
        }];
    }
}

- (void)btnSelect:(UIButton* )btn
{
    WEAK_SELF
    if (self.type == ALERT_VIEW_TYPE_NORMAL_CANCEL && btn.tag == 1) {
        if (self.textView.tx.length == 0) {
            [MBProgressHUD showErrorMessage:@"取消原因不能为空"];
            return;
        }
    }
    [UIView animateWithDuration:.25 animations:^{
        [self setAlpha:0];
    } completion:^(BOOL finished) {
        [self removeFromSuperview];
        if (self.type == ALERT_VIEW_TYPE_NORMAL_REJECT || self.type == ALERT_VIEW_TYPE_NORMAL_CANCEL | self.type == ALERT_VIEW_TYPE_EditText) {
            [self removeFromSuperview];
            if(weakSelf.block) {
                weakSelf.block(btn.tag, self.textView.text);
            }
        } else {
            if(weakSelf.block){
                weakSelf.block(btn.tag, nil);
            }
        }
    }];
}

/**
 弹出方法
 */
- (void)show
{
    UIWindow* window  = [UIApplication sharedApplication].keyWindow;
    [window addSubview:self];
    self.bgControl.transform = CGAffineTransformMakeScale(.8, .8);
    [UIView animateWithDuration:.25 delay:0 usingSpringWithDamping:.5 initialSpringVelocity:10 options:UIViewAnimationOptionCurveEaseInOut animations:^{
        self.bgControl.transform = CGAffineTransformIdentity;
        [self.bgControl setAlpha:1.0];
    } completion:^(BOOL finished) {
    }];
}
#pragma mark - 获取根视图视图控制器
- (UINavigationController *)getRootVCformViewController
{
    UIViewController *rootVC = [UIApplication sharedApplication].keyWindow.rootViewController;
    UINavigationController *nav = nil;
    if ([rootVC isKindOfClass:[UITabBarController class]]) {
        UITabBarController *tabbar = (UITabBarController *)rootVC;
        NSInteger index = tabbar.selectedIndex;
        nav = tabbar.childViewControllers[index];
    }else if ([rootVC isKindOfClass:[UINavigationController class]]) {
        nav = (UINavigationController *)rootVC;
    }else if ([rootVC isKindOfClass:[UIViewController class]]) {
        NSLog(@"This no UINavigationController...");
    }
    return nav;
}
#pragma mark - Layout
/**
 layout
 */
- (void)layoutAlert
{
    switch (_type) {
        case ALERT_VIEW_TYPE_NORMAL_VERTION:{
            if(_info[@"title"]){
                self.titleLabel.text = _info[@"title"];
                [self.titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
                    make.top.mas_offset(20);
                    make.centerX.mas_equalTo(self.bgView);
                    make.width.mas_lessThanOrEqualTo(self.bgView.mas_width).mas_offset(-80);
                }];
                _lastObj = _titleLabel;
            }
            if(_info[@"content"]){
                UIView *lastView = (UIView *)_lastObj;
                self.contentLabel.text = _info[@"content"];
                [self.contentLabel mas_makeConstraints:^(MASConstraintMaker *make) {
                    make.top.equalTo(lastView.mas_bottom).offset(20);
                    make.centerX.mas_equalTo(self.bgView);
                    make.width.mas_lessThanOrEqualTo(self.bgView.mas_width).mas_offset(-80);
                }];
                _lastObj = _contentLabel;
            }
            [self.bgView addSubview:self.lineView];
            UIView *lastView = (UIView *)_lastObj;
            [self.lineView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(lastView.mas_bottom).offset(20);
                make.left.equalTo(self.bgView);
                make.right.equalTo(self.bgView);
                make.height.mas_equalTo(.5);
            }];
            _lastObj = _lineView;
            if(_info[@"confirmStr"]){
                UIView *lastView = (UIView *)_lastObj;
                [self.confirmBtn setTitle:_info[@"confirmStr"] forState:UIControlStateNormal];
                [self.confirmBtn mas_makeConstraints:^(MASConstraintMaker *make) {
                    make.top.equalTo(self.lineView.mas_bottom);
                    make.centerX.mas_equalTo(self.bgView);
                    make.size.mas_equalTo(CGSizeMake(200, 56));
                }];
                [self.bgLayer setFillColor:UIColorFromRGB(0xF4F5F9).CGColor];
                [self.bgLayer setShadowColor:UIColorFromRGB(0xF4F5F9).CGColor];
                _lastObj = _confirmBtn;
                _lastHeight = 0;
            }
        }
            break;
        case ALERT_VIEW_TYPE_NORMAL:{//通用
            if(_info[@"title"]){
                self.titleLabel.text = _info[@"title"];
                [self.titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
                    make.top.mas_offset(20);
                    make.centerX.mas_equalTo(self.bgView);
                    make.width.mas_lessThanOrEqualTo(self.bgView.mas_width).mas_offset(-20);
                }];
                _lastObj = _titleLabel;
            }
            if(_info[@"content"]){
                UIView *lastView = (UIView *)_lastObj;
                self.contentLabel.text = _info[@"content"];
                [self.contentLabel mas_makeConstraints:^(MASConstraintMaker *make) {
                    make.top.equalTo(lastView.mas_bottom).offset(20);
                    make.centerX.mas_equalTo(self.bgView);
                    make.width.mas_lessThanOrEqualTo(self.bgView.mas_width).mas_offset(-20);
                }];
                _lastObj = _contentLabel;
            }
            [self.bgView addSubview:self.lineView];
            UIView *lastView = (UIView *)_lastObj;
            [self.lineView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(lastView.mas_bottom).offset(20);
                make.left.equalTo(self.bgView);
                make.right.equalTo(self.bgView);
                make.height.mas_equalTo(.5);
            }];
            _lastObj = _lineView;
            [self.bgView addSubview:self.midlleView];
            [self.midlleView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(self.lineView.mas_bottom);
                make.centerX.equalTo(self.bgView);
                make.size.mas_equalTo(CGSizeMake(.5, 56));
            }];
            _lastObj = _midlleView;
            if(_info[@"cancelStr"]){
                UIView *lastView = (UIView *)_lastObj;
                [self.cancelBtn setTitle:_info[@"cancelStr"] forState:UIControlStateNormal];
                [self.cancelBtn setTitleColor:UIColorFromRGBA(0x000000, 0.9) forState:UIControlStateNormal];
                [self.cancelBtn mas_makeConstraints:^(MASConstraintMaker *make) {
                    make.top.equalTo(self.lineView.mas_bottom);
                    make.left.mas_offset(0);
                    make.right.equalTo(self.midlleView.mas_left);
                    make.height.mas_equalTo(56);
                }];
            }
            if(_info[@"confirmStr"]){
                UIView *lastView = (UIView *)_lastObj;
                [self.confirmBtn setTitle:_info[@"confirmStr"] forState:UIControlStateNormal];
                if(_cancelBtn){
                    [self.confirmBtn mas_makeConstraints:^(MASConstraintMaker *make) {
                        make.top.equalTo(self.lineView.mas_bottom);
                        make.right.mas_offset(0);
                        make.left.equalTo(self.midlleView.mas_right);
                        make.height.mas_equalTo(56);
                    }];
                }else{
                    [self.confirmBtn mas_makeConstraints:^(MASConstraintMaker *make) {
                        make.top.equalTo(self.lineView.mas_bottom);
                        make.centerX.mas_equalTo(self.bgView);
                        make.size.mas_equalTo(CGSizeMake(180, 56));
                    }];
                }
                [self.bgLayer setFillColor:UIColorFromRGB(0xF4F5F9).CGColor];
                [self.bgLayer setShadowColor:UIColorFromRGB(0xF4F5F9).CGColor];
                _lastObj = _confirmBtn;
                _lastHeight = 0;
            }
        }
            break;
        case ALERT_VIEW_TYPE_NORMAL_REJECT: {
            //驳回
            [self.bgView addSubview:self.textView];
            [self.textView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.mas_offset(20);
                make.centerX.mas_equalTo(self.bgView);
                make.width.mas_equalTo(251);
                make.height.mas_equalTo(60);
            }];
            [self.bgView addSubview:self.lineView];
            [self.lineView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_textView.mas_bottom);
                make.left.right.equalTo(self.bgView);
                make.height.mas_equalTo(0.5);
            }];
            [self.bgView addSubview:self.midlleView];
            [_midlleView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_lineView.mas_bottom);
                make.bottom.equalTo(self.bgView.mas_bottom);
                make.width.mas_equalTo(1);
                make.centerX.equalTo(self.bgView);
            }];
            [self.cancelBtn setTitle:@"取消" forState:UIControlStateNormal];
            [self.cancelBtn setTitleColor:UIColorFromRGBA(0x000000, 0.9) forState:UIControlStateNormal];
            [self.cancelBtn mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_lineView.mas_bottom);
                make.left.equalTo(self.bgView);
                make.right.equalTo(self.midlleView);
                make.bottom.equalTo(self.bgView);
            }];
            [self.confirmBtn setTitle:@"确定" forState:UIControlStateNormal];
            [self.confirmBtn setTitleColor:mainColor forState:UIControlStateNormal];
            [self.confirmBtn mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_lineView.mas_bottom);
                make.left.equalTo(self.midlleView.mas_right);
                make.right.equalTo(self.bgView);
                make.bottom.equalTo(self.bgView);
            }];
            [self.bgLayer setFillColor:UIColorFromRGB(0xF4F5F9).CGColor];
            [self.bgLayer setShadowColor:UIColorFromRGB(0xF4F5F9).CGColor];
            _lastObj = _confirmBtn;
            _lastHeight = 10;
        }
            break;
        case ALERT_VIEW_TYPE_NORMAL_CANCEL: {
            [self.bgView addSubview:self.textView];
            [self.textView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.mas_offset(20);
                make.centerX.mas_equalTo(self.bgView);
                make.width.mas_equalTo(251);
                make.height.mas_equalTo(60);
            }];
            [self.bgView addSubview:self.lineView];
            [self.lineView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_textView.mas_bottom);
                make.left.right.equalTo(self.bgView);
                make.height.mas_equalTo(0.5);
            }];
            [self.bgView addSubview:self.midlleView];
            [_midlleView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_lineView.mas_bottom);
                make.bottom.equalTo(self.bgView.mas_bottom);
                make.width.mas_equalTo(1);
                make.centerX.equalTo(self.bgView);
            }];
            [self.cancelBtn setTitle:@"取消" forState:UIControlStateNormal];
            [self.cancelBtn setTitleColor:UIColorFromRGBA(0x000000, 0.9) forState:UIControlStateNormal];
            [self.cancelBtn mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_lineView.mas_bottom);
                make.left.equalTo(self.bgView);
                make.right.equalTo(self.midlleView);
                make.bottom.equalTo(self.bgView);
            }];
            [self.confirmBtn setTitle:@"确定" forState:UIControlStateNormal];
            [self.confirmBtn setTitleColor:mainColor forState:UIControlStateNormal];
            [self.confirmBtn mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_lineView.mas_bottom);
                make.left.equalTo(self.midlleView.mas_right);
                make.right.equalTo(self.bgView);
                make.bottom.equalTo(self.bgView);
            }];
            [self.bgLayer setFillColor:UIColorFromRGB(0xF4F5F9).CGColor];
            [self.bgLayer setShadowColor:UIColorFromRGB(0xF4F5F9).CGColor];
            _lastObj = _confirmBtn;
            _lastHeight = 10;
        }
            break;
        case ALERT_VIEW_TYPE_EditText: {
            if(_info[@"title"]){
                self.titleLabel.text = _info[@"title"];
                self.titleLabel.backgroundColor = UIColor.redColor;
                [self.titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
                    make.top.mas_offset(10);
                    make.centerX.mas_equalTo(self.bgView);
                    make.width.mas_lessThanOrEqualTo(self.bgView.mas_width).mas_offset(-20);
                }];
            }
            self.textView.placeholder = @"请输入";
            self.textView.text = _info[@"value"];
            self.textView.keyboardType = [_info[@"bordType"] integerValue];
//            self.textView.backgroundColor = UIColorFromRGB(0xDFDFDF);
//            self.textView.layer.cornerRadius = 6;
            [self.bgView addSubview:self.textView];
            [self.textView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(self.titleLabel.mas_bottom).offset(15);
                make.left.equalTo(self.bgView).offset(15);
                make.right.equalTo(self.bgView).offset(-15);
                make.height.mas_equalTo(50);
            }];
            [self.bgView addSubview:self.lineView];
            [self.lineView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_textView.mas_bottom).offset(15);
                make.left.right.equalTo(self.bgView);
                make.height.mas_equalTo(0.5);
            }];
            [self.bgView addSubview:self.midlleView];
            [_midlleView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_lineView.mas_bottom);
                make.bottom.equalTo(self.bgView.mas_bottom);
                make.width.mas_equalTo(1);
                make.centerX.equalTo(self.bgView);
            }];
            [self.cancelBtn setTitle:@"取消" forState:UIControlStateNormal];
            [self.cancelBtn setTitleColor:UIColorFromRGBA(0x000000, 0.9) forState:UIControlStateNormal];
            [self.cancelBtn mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_lineView.mas_bottom);
                make.left.equalTo(self.bgView);
                make.right.equalTo(self.midlleView);
                make.bottom.equalTo(self.bgView);
            }];
            [self.confirmBtn setTitle:@"确定" forState:UIControlStateNormal];
            [self.confirmBtn setTitleColor:mainColor forState:UIControlStateNormal];
            [self.confirmBtn mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.equalTo(_lineView.mas_bottom);
                make.left.equalTo(self.midlleView.mas_right);
                make.right.equalTo(self.bgView);
                make.bottom.equalTo(self.bgView);
            }];
            [self.bgLayer setFillColor:UIColorFromRGB(0xF4F5F9).CGColor];
            [self.bgLayer setShadowColor:UIColorFromRGB(0xF4F5F9).CGColor];
            _lastObj = _confirmBtn;
            _lastHeight = 10;
        }
            break;
        default:
            break;
    }
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    [self layoutIfNeeded];
    CGFloat f_y = CGRectGetMaxY([(UIView* )_lastObj frame]) + _lastHeight;
    [self.bgView mas_updateConstraints:^(MASConstraintMaker *make) {
        make.height.mas_equalTo(f_y);
    }];
    [self layoutIfNeeded];
    UIBezierPath* bezier = [UIBezierPath bezierPathWithRoundedRect:self.bgView.frame byRoundingCorners:UIRectCornerAllCorners cornerRadii:CGSizeMake(6.0, 6.0)];
    self.bgLayer.path = bezier.CGPath;
}

#pragma mark - Getter

//- (UIImageView *)imgView
//{
//    if(!_imgView){
//        _imgView = [UIImageView new];
//        [self.bgView addSubview:_imgView];
////        [_imgView setBackgroundColor:colorFromRGB(0xf0f0f0)];
//    }
//    return _imgView;
//}

- (UILabel *)titleLabel
{
    if(!_titleLabel){
        _titleLabel = [[UILabel alloc] init];
        _titleLabel.textColor = UIColorFromRGBA(000000,0.9);
        _titleLabel.font = [UIFont boldSystemFontOfSize:18];
        _titleLabel.textAlignment = NSTextAlignmentCenter;
        _titleLabel.numberOfLines = 0;
        [self.bgView addSubview:_titleLabel];
    }
    return _titleLabel;
}

- (UILabel *)subLabel
{
    if(!_subLabel){
        _subLabel = [[UILabel alloc] init];
        _subLabel.textColor = UIColorFromRGB(0x323232);
        _subLabel.font = [UIFont systemFontOfSize:16];
        _subLabel.textAlignment = NSTextAlignmentCenter;
        _subLabel.numberOfLines = 0;
        [self.bgView addSubview:_subLabel];
    }
    return _subLabel;
}

- (UILabel *)contentLabel
{
    if(!_contentLabel){
        _contentLabel = [[UILabel alloc] init];
        _contentLabel.textColor = UIColorFromRGB(0x8C8F9D);
        _contentLabel.font = [UIFont systemFontOfSize:16];
        _contentLabel.textAlignment = NSTextAlignmentCenter;
        _contentLabel.numberOfLines = 0;
        [self.bgView addSubview:_contentLabel];
    }
    return _contentLabel;
}
- (UILabel *)detaileLab {
    if (!_detaileLab) {
        _detaileLab = [[UILabel alloc] init];
        _detaileLab.textColor = UIColorFromRGB(0x8E8E8E);
        _detaileLab.font = [UIFont systemFontOfSize:14];
        _detaileLab.textAlignment = NSTextAlignmentCenter;
        _detaileLab.numberOfLines = 0;
        [self.bgView addSubview:_detaileLab];
    }
    return _detaileLab;
}
- (UIButton *)cancelBtn
{
    if(!_cancelBtn){
        _cancelBtn = [UIButton buttonWithType:UIButtonTypeCustom];
        [self.bgView addSubview:_cancelBtn];
        [_cancelBtn.titleLabel setFont:[UIFont systemFontOfSize:16]];
        _cancelBtn.tag = 0;
        [_cancelBtn addTarget:self action:@selector(btnSelect:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _cancelBtn;
}

- (UIButton *)confirmBtn
{
    if(!_confirmBtn){
        _confirmBtn = [UIButton buttonWithType:UIButtonTypeCustom];
        [self.bgView addSubview:_confirmBtn];
        [_confirmBtn.titleLabel setFont:[UIFont boldSystemFontOfSize:14]];
        [_confirmBtn setTitleColor:UIColorFromRGB(0x018AFF) forState:UIControlStateNormal];
        _confirmBtn.tag = 1;
        [_confirmBtn addTarget:self action:@selector(btnSelect:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _confirmBtn;
}

- (UIView *)lineView
{
    if(!_lineView){
        _lineView = [UIView new];
        _lineView.backgroundColor = UIColorFromRGB(0xDFDFDF);
        [self.bgView addSubview:_lineView];
    }
    return _lineView;
}
- (UIView *)midlleView
{
    if(!_midlleView){
        _midlleView = [UIView new];
        _midlleView.backgroundColor = UIColorFromRGB(0xDFDFDF);
        [self.bgView addSubview:_midlleView];
    }
    return _midlleView;
}

- (UIView *)bgView
{
    if(!_bgView){
        _bgView = [UIView new];
        [self.bgControl addSubview:_bgView];
        [_bgView setBackgroundColor:[UIColor whiteColor]];
        [_bgView mas_makeConstraints:^(MASConstraintMaker *make) {
            make.centerY.mas_equalTo(self.mas_centerY).offset(-50);
            make.centerX.equalTo(self);
            make.width.mas_equalTo(kScreenWidth-80);
            make.height.mas_equalTo(150);
        }];
    }
    return _bgView;
}

- (CAShapeLayer *)bgLayer
{
    if(!_bgLayer){
        _bgLayer = [CAShapeLayer layer];
        [self.bgControl.layer addSublayer:_bgLayer];
        _bgLayer.zPosition = -1;
        [_bgLayer setFillColor:UIColorFromRGB((0xffffff)).CGColor];
        [_bgLayer setShadowColor:UIColorFromRGB(0xffffff).CGColor];
        [_bgLayer setShadowOpacity:.3];
        [_bgLayer setShadowRadius:2.0];
        [_bgLayer setShadowOffset:CGSizeMake(0, 2)];
    }
    return _bgLayer;
}

- (UIControl *)bgControl
{
    if(!_bgControl){
        _bgControl = [UIControl new];
        [self insertSubview:_bgControl atIndex:0];
        [_bgControl addTarget:self action:@selector(bgControlResponse) forControlEvents:UIControlEventTouchUpInside];
        [_bgControl mas_makeConstraints:^(MASConstraintMaker *make) {
            make.edges.mas_equalTo(self);
        }];
    }
    return _bgControl;
}
- (LGTextView *)textView {
    if(!_textView){
        _textView = [[LGTextView alloc]init];
        _textView.delegate = self;
        _textView.backgroundColor = UIColor.whiteColor;
        _textView.tag = 1999;
        _textView.placeholder = @"请输入原因....";
        [_textView setFont:[UIFont systemFontOfSize:16]];
        [_textView setTextColor:UIColorFromRGBA(000000, 0.9)];
        [_textView setTintColor:mainColor];
    }
    return _textView;
}
- (BOOL)textView:(UITextView *)textView shouldChangeTextInRange:(NSRange)range replacementText:(NSString *)text{
    NSInteger existedLength = textView.text.length;
    NSInteger selectedLength = range.length;
    NSInteger replaceLength = text.length;
    NSInteger length = existedLength - selectedLength + replaceLength;
    if (self.type == ALERT_VIEW_TYPE_NORMAL_CANCEL) {
        if (length > 50) {
            [MBProgressHUD showWarnMessage:@"最多输入50字"];
            return NO;
        }
    }
    return YES;
}
@end

//
//  HomeDeviceItem.m
//  AIToys
//
//  Created by 乔不赖 on 2025/6/21.
//

#import "HomeDeviceItem.h"

@implementation HomeDeviceItem

- (void)awakeFromNib {
    [super awakeFromNib];
    // Initialization code
}

-(void)setIndex:(NSInteger)index{
    _index = index;
    NSArray *bgColorArr = @[UIColorHex(e4f2fe),UIColorHex(faf6e4),UIColorHex(f8e9dd),UIColorHex(ede7fc),UIColorHex(daeeec),UIColorHex(fce7f8),UIColorHex(f9dede),UIColorHex(daf2f9),UIColorHex(dce2f7),UIColorHex(e6f8e9)];
    self.bgView.backgroundColor = bgColorArr[index % 10];
    self.rankLabel.text = [NSString stringWithFormat:@"%li",index + 1];
}

-(void)setIsEdit:(BOOL)isEdit{
    _isEdit = isEdit;
    [self starAnimation:isEdit];
    if(isEdit){
        self.rankView.hidden = YES;
        self.chooseImgView.hidden = NO;
    }else{
        self.rankView.hidden = self.index > 1;
        self.chooseImgView.hidden = YES;
    }
}

-(void)setIsSel:(BOOL)isSel{
    _isSel = isSel;
    if(isSel){
        self.chooseImgView.highlighted = YES;
    }else{
        self.chooseImgView.highlighted = NO;
    }
}

-(void)setModel:(ThingSmartDeviceModel *)model{
    _model = model;
    self.nameLabel.text = model.name;
    self.onlineImgview.image = model.isOnline ? [UIImage imageNamed:@"icon_online"] : [UIImage imageNamed:@"icon_offline"];
    self.onlineLabel.text = model.isOnline ? LocalString(@"在线"):LocalString(@"离线");
}

-(void)starAnimation:(BOOL)animaiton
{
    if (animaiton) {
        CABasicAnimation *basicAnimation = [CABasicAnimation animationWithKeyPath:@"transform.rotation.z"];
        //抖动的话添加一个旋转角度给他就好
        basicAnimation.fromValue = @(-M_PI_4/14);
        basicAnimation.toValue = @(M_PI_4/14);
        basicAnimation.duration = 0.08;
        basicAnimation.repeatCount = MAXFLOAT;
        basicAnimation.autoreverses = YES;
        [self.layer addAnimation:basicAnimation forKey:[NSString stringWithFormat:@"%li",(long)index + 1]];

    }else{
        [self.layer removeAllAnimations];
    }
    
}

@end

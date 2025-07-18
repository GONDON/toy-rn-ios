//
//  SwitchFamailyCell.m
//  AIToys
//
//  Created by qdkj on 2025/6/26.
//

#import "SwitchFamailyCell.h"

@implementation SwitchFamailyCell

- (void)awakeFromNib {
    [super awakeFromNib];
    // Initialization code
}
- (void)setIsSel:(BOOL)isSel{
    _isSel = isSel;
    self.chooseImgView.highlighted = isSel;
    self.homeImgView.highlighted = isSel;
    self.nameLabel.highlighted = isSel;
}

-(void)setModel:(ThingSmartHomeModel *)model{
    _model = model;
    self.nameLabel.text = model.name;
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

@end

//
//  UserPermmitCell.m
//  AIToys
//
//  Created by qdkj on 2025/7/9.
//

#import "UserPermmitCell.h"

@implementation UserPermmitCell

- (void)awakeFromNib {
    [super awakeFromNib];
}

-(void)setIsSelct:(BOOL)isSelct{
    _isSelct = isSelct;
    self.selImgView.highlighted = isSelct;
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

@end

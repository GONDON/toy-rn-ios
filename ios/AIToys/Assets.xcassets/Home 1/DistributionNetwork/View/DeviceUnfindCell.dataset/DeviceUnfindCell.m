//
//  DeviceUnfindCell.m
//  AIToys
//
//  Created by 乔不赖 on 2025/6/28.
//

#import "DeviceUnfindCell.h"

@implementation DeviceUnfindCell

- (void)awakeFromNib {
    [super awakeFromNib];
    // Initialization code
}

//尝试按钮
- (IBAction)tryBtnClick:(id)sender {
    if(self.tryBlock){
        self.tryBlock();
    }
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

@end

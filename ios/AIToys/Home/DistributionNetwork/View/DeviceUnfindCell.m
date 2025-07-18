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
    self.titleLabel.text = LocalString(@"未发现设备");
    self.subTitleLabel.text = LocalString(@"请查看 帮助说明，确保设备处于待配网状态。");
    [self.tryBtn setTitle:LocalString(@"重新扫描") forState:0];
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

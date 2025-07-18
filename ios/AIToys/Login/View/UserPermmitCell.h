//
//  UserPermmitCell.h
//  AIToys
//
//  Created by qdkj on 2025/7/9.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface UserPermmitCell : UITableViewCell
@property (weak, nonatomic) IBOutlet UIImageView *selImgView;
@property (nonatomic, assign) BOOL isSelct;
@end

NS_ASSUME_NONNULL_END

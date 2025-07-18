//
//  HomeExploreToysView.h
//  AIToys
//
//  Created by qdkj on 2025/6/26.
//

#import <UIKit/UIKit.h>
#import "JXPageListView.h"
#import "HomeDollModel.h"

NS_ASSUME_NONNULL_BEGIN

@interface HomeExploreToysView : UIView< JXPageListViewListDelegate>
@property (nonatomic, strong) HomeDollModel *model;
@end

NS_ASSUME_NONNULL_END

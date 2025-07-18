//
//  HomeViewController.m
//  AIToys
//
//  Created by 乔不赖 on 2025/6/18.
//

#import "HomeViewController.h"
#import <SDCycleScrollView.h>
#import "HomeNoDeviceCell.h"
#import "HomeDeviceCell.h"
#import "HomeToysCell.h"
#import "JHCustomMenu.h"
#import "FamailyManageVC.h"
#import "AddToysGuideVC.h"
#import "ToysGuideFindVC.h"
#import "HomeDeviceListVC.h"
#import "HomeToysListVC.h"
#import "SwitchFamailyVC.h"
#import "JXPageListView.h"
#import "ReactViewController.h"
#import "HomeExploreToysView.h"
#import "RYFGifHeader.h"
#import "FindDeviceViewController.h"
#import "BannerModel.h"
#import "ReactViewController.h"

static const CGFloat JXPageheightForHeaderInSection = 126;

@interface HomeViewController ()<SDCycleScrollViewDelegate,UITableViewDelegate,UITableViewDataSource,JHCustomMenuDelegate,ThingSmartHomeManagerDelegate,JXPageListViewDelegate,ThingSmartHomeDelegate>
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (weak, nonatomic) IBOutlet UIView *containerView;

@property (nonatomic, strong) SDCycleScrollView *cycleScrollView;

@property (nonatomic, strong) JHCustomMenu *menu;

@property (nonatomic, strong) NSArray <ThingSmartDeviceModel *>*deviceArr;

@property(strong, nonatomic) ThingSmartHomeManager *homeManager;
@property(strong, nonatomic) NSMutableArray<ThingSmartHomeModel *> *homeList;
@property(strong, nonatomic) ThingSmartHome *currentHome;

@property (nonatomic, strong) NSMutableArray <NSString *> *titles;
@property (nonatomic, strong) NSMutableArray <NSURL *> *imageURLs;
@property (nonatomic, strong) JXPageListView *pageListView;
@property (nonatomic, strong) NSMutableArray <HomeExploreToysView *> *listViewArray;

@property(strong, nonatomic) NSMutableArray<HomeDollModel *> *diyDollList;
@property(strong, nonatomic) NSMutableArray<HomeDollModel *> *exploreDollList;
@property (nonatomic, strong) NSMutableArray <BannerModel *> *bannerImgArray;
@end

@implementation HomeViewController

-(NSMutableArray *)listViewArray{
    if (!_listViewArray) {
        _listViewArray = [NSMutableArray array];
    }
    return _listViewArray;
}

-(NSMutableArray *)titles{
    if (!_titles) {
        _titles = [NSMutableArray array];
    }
    return _titles;
}

-(NSMutableArray *)imageURLs{
    if (!_imageURLs) {
        _imageURLs = [NSMutableArray array];
    }
    return _imageURLs;
}

-(NSMutableArray *)bannerImgArray{
    if (!_bannerImgArray) {
        _bannerImgArray = [NSMutableArray array];
    }
    return _bannerImgArray;
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self getData];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.hj_NavIsHidden = YES;
    self.view.backgroundColor = tableBgColor;
    self.titleLabel.text = NSLocalizedString(@"小朋友，你好！", @"") ;

    self.containerView.layer.cornerRadius = 20;
    [self setUpUI];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(deviceConnectStateChanged:) name:@"DeviceConnectStatusChanged" object:nil];
}

-(void)setUpUI{
    self.pageListView = [[JXPageListView alloc] initWithDelegate:self];
    //Tips:pinCategoryViewHeight要赋值
    self.pageListView.pinCategoryViewHeight = JXPageheightForHeaderInSection;
    //Tips:操作pinCategoryView进行配置
    self.pageListView.pinCategoryView.titles = self.titles;
    self.pageListView.pinCategoryView.titleColor = UIColorFromRGBA(000000, 0.6);
    self.pageListView.pinCategoryView.titleFont = [UIFont systemFontOfSize:12];
    self.pageListView.pinCategoryView.titleSelectedColor = mainColor;
    self.pageListView.pinCategoryView.titleSelectedFont = [UIFont boldSystemFontOfSize:14];
//    self.pageListView.pinCategoryView.imageURLs = self.imageURLs;
//    self.pageListView.pinCategoryView.selectedImageURLs = self.imageURLs;
    //指示器
    JXCategoryIndicatorLineView *lineView = [[JXCategoryIndicatorLineView alloc] init];
    lineView.lineStyle = JXCategoryIndicatorLineStyle_Normal;
    lineView.indicatorLineViewColor = mainColor;
    self.pageListView.pinCategoryView.indicators = @[lineView];
    
//    NSMutableArray *imageTypesArr = [NSMutableArray array];
//    for (NSObject *obj in self.imageNames) {
//        [imageTypesArr addObject:@(JXCategoryTitleImageType_TopImage)];
//    }
//    self.pageListView.pinCategoryView.imageTypes = imageTypesArr;
//    self.pageListView.pinCategoryView.imageSize = CGSizeMake(64, 64);
    
    //Tips:成为mainTableView dataSource和delegate的代理，像普通UITableView一样使用它
    self.pageListView.mainTableView.dataSource = self;
    self.pageListView.mainTableView.delegate = self;
    self.pageListView.mainTableView.scrollsToTop = NO;
    self.pageListView.mainTableView.layer.cornerRadius = 32;
    self.pageListView.mainTableView.backgroundColor = self.view.backgroundColor;
    self.pageListView.mainTableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    self.pageListView.mainTableView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    self.pageListView.mainTableView.tableHeaderView = [self setupHeaderView];
    [self.pageListView.mainTableView registerNib:[UINib nibWithNibName:NSStringFromClass([HomeNoDeviceCell class]) bundle:nil] forCellReuseIdentifier:@"HomeNoDeviceCell"];
    [self.pageListView.mainTableView registerNib:[UINib nibWithNibName:NSStringFromClass([HomeDeviceCell class]) bundle:nil] forCellReuseIdentifier:@"HomeDeviceCell"];
    [self.pageListView.mainTableView registerNib:[UINib nibWithNibName:NSStringFromClass([HomeToysCell class]) bundle:nil] forCellReuseIdentifier:@"HomeToysCell"];
    
    self.pageListView.mainTableView.mj_header = [RYFGifHeader headerWithRefreshingBlock:^{
        [self getData];
    }];
    [self.containerView addSubview:self.pageListView];
}


- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];

    self.pageListView.frame = self.containerView.bounds;
}

//banner
- (UIView *)setupHeaderView {
    CGFloat cycleScrollH = (kScreenWidth-30) *151/343.0;
    UIView *headerView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, cycleScrollH + 30)];
    [PublicObj makeCornerToView:headerView withFrame:headerView.bounds withRadius:32 position:1];
    
    self.cycleScrollView = [SDCycleScrollView cycleScrollViewWithFrame:CGRectMake(15, 15, kScreenWidth-30, cycleScrollH) delegate:self placeholderImage:QD_IMG(@"home_banner")];
    [headerView addSubview:self.cycleScrollView];
//    self.cycleScrollView.localizationImageNamesGroup = @[@"home_banner", @"home_banner", @"home_banner", @"home_banner"];
    self.cycleScrollView.bannerImageViewContentMode = UIViewContentModeScaleToFill;
    self.cycleScrollView.autoScrollTimeInterval = 3;
    self.cycleScrollView.layer.cornerRadius = 32;
    self.cycleScrollView.layer.masksToBounds = YES;
    self.cycleScrollView.clipsToBounds =  YES;
    self.cycleScrollView.currentPageDotColor = UIColor.whiteColor;
    self.cycleScrollView.pageDotColor = UIColorFromRGBA(0xD8D8D8, 0.6);
    WEAK_SELF
    self.cycleScrollView.clickItemOperationBlock = ^(NSInteger currentIndex) {
        [weakSelf bannerImgClick:weakSelf.bannerImgArray[currentIndex]];
    };
    return headerView;
}

//轮播图跳转
-(void)bannerImgClick:(BannerModel *)model{
    if (!strIsEmpty(model.linkUrl) ){
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:model.linkUrl] options:@{} completionHandler:nil];
    }
}

//请求数据
- (void)getData{
    WEAK_SELF
    dispatch_group_t group = dispatch_group_create();
    dispatch_group_enter(group);
    dispatch_group_async(group, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        //请求1 轮播图
        [[APIManager shared] GET:HomeBannerList_URL parameter:nil success:^(id  _Nonnull result, id  _Nonnull data, NSString * _Nonnull msg) {
            [weakSelf.bannerImgArray removeAllObjects];
            [weakSelf.bannerImgArray addObjectsFromArray:[BannerModel mj_objectArrayWithKeyValuesArray:data]];
            NSMutableArray *imgUrlArr = [NSMutableArray array];
            for (BannerModel *model in weakSelf.bannerImgArray) {
                [imgUrlArr addObject:model.mediaUrl];
            }
            weakSelf.cycleScrollView.imageURLStringsGroup = imgUrlArr;
            dispatch_group_leave(group);
        } failure:^(NSError * _Nonnull error, NSString * _Nonnull msg) {
            dispatch_group_leave(group);
        }];
    });
    
    dispatch_group_enter(group);
    dispatch_group_async(group, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        //请求2 首页创意公仔列表
        NSMutableDictionary *param = [NSMutableDictionary dictionary];
        [param setObject:@(1) forKey:@"pageNo"];
        [param setObject:@(10) forKey:@"pageSize"];
        [param setObject:@"creative,ip" forKey:@"dollModelType"];
        [[APIManager shared] GET:HomeDoolList_URL parameter:param success:^(id  _Nonnull result, id  _Nonnull data, NSString * _Nonnull msg) {

            dispatch_group_leave(group);
            NSArray *dataArr = @[];
            if ([data isKindOfClass:NSDictionary.class]) {
                if ([data[@"list"] isKindOfClass:NSArray.class]) {
                    dataArr = (NSArray *)data[@"list"];
                    weakSelf.diyDollList = [NSMutableArray arrayWithArray:[HomeDollModel mj_objectArrayWithKeyValuesArray:dataArr]];
                }
            }
            
        } failure:^(NSError * _Nonnull error, NSString * _Nonnull msg) {
            dispatch_group_leave(group);
        }];
    });
    
    dispatch_group_enter(group);
    dispatch_group_async(group, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        //请求3 首页探索公仔列表
        NSMutableDictionary *param = [NSMutableDictionary dictionary];
        [param setObject:@(1) forKey:@"pageNo"];
        [param setObject:@(100) forKey:@"pageSize"];
        [param setObject:@"explore" forKey:@"dollModelType"];
        [[APIManager shared] GET:HomeDoolList_URL parameter:param success:^(id  _Nonnull result, id  _Nonnull data, NSString * _Nonnull msg) {
            dispatch_group_leave(group);
            NSArray *dataArr = @[];
            if ([data isKindOfClass:NSDictionary.class]) {
                if ([data[@"list"] isKindOfClass:NSArray.class]) {
                    dataArr = (NSArray *)data[@"list"];
                    weakSelf.exploreDollList = [NSMutableArray arrayWithArray:[HomeDollModel mj_objectArrayWithKeyValuesArray:dataArr]];
                }
            }
        } failure:^(NSError * _Nonnull error, NSString * _Nonnull msg) {
            dispatch_group_leave(group);
        }];
    });
    
    dispatch_group_enter(group);
    dispatch_group_async(group, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        //涂鸦平台 家庭列表信息
        [weakSelf.homeManager getHomeListWithSuccess:^(NSArray<ThingSmartHomeModel *> *homes) {
            weakSelf.homeList = [homes mutableCopy];
            if(weakSelf.homeList.count > 0){
                weakSelf.currentHome = [ThingSmartHome homeWithHomeId:weakSelf.homeList[0].homeId];
                weakSelf.currentHome.delegate = self;
                [weakSelf.currentHome getHomeDataWithSuccess:^(ThingSmartHomeModel *homeModel) {
                    dispatch_group_leave(group);
                    if(weakSelf.currentHome){
                        weakSelf.deviceArr = weakSelf.currentHome.deviceList;
                        
                    }
                } failure:^(NSError *error) {
                    dispatch_group_leave(group);
                }];
            }
            
        } failure:^(NSError *error) {
            dispatch_group_leave(group);
        }];
    });
    
    dispatch_group_notify(group, dispatch_get_main_queue(), ^{
        [weakSelf.titles removeAllObjects];
        for (HomeDollModel *item in weakSelf.exploreDollList) {
            [weakSelf.titles addObject:item.dollModel.name];
            [weakSelf.imageURLs addObject:[NSURL URLWithString:item.dollModel.coverImg]];
        }
        
        for (HomeDollModel *item in weakSelf.exploreDollList) {
            HomeExploreToysView *exploreView = [[HomeExploreToysView alloc] init];
            exploreView.model = item;
            [weakSelf.listViewArray addObject:exploreView];
        }
        weakSelf.pageListView.pinCategoryView.imageURLs = weakSelf.imageURLs;
        weakSelf.pageListView.pinCategoryView.selectedImageURLs = weakSelf.imageURLs;
        weakSelf.pageListView.pinCategoryView.loadImageCallback = ^(UIImageView *imageView, NSURL *imageURL) {
            [imageView sd_setImageWithURL:imageURL];
        };
        NSMutableArray *imageTypesArr = [NSMutableArray array];
        for (NSObject *obj in weakSelf.imageURLs) {
            [imageTypesArr addObject:@(JXCategoryTitleImageType_TopImage)];
        }
        weakSelf.pageListView.pinCategoryView.imageTypes = imageTypesArr;
        weakSelf.pageListView.pinCategoryView.imageSize = CGSizeMake(64, 64);
        
        //界面刷新
        [weakSelf.pageListView.mainTableView.mj_header endRefreshing];
        [weakSelf.pageListView.mainTableView reloadData];
    });
}

-(void)reloadHomeListData{
    //涂鸦平台 家庭列表信息
    [self.homeManager getHomeListWithSuccess:^(NSArray<ThingSmartHomeModel *> *homes) {
        self.homeList = [homes mutableCopy];
        
    } failure:^(NSError *error) {
        
    }];
}

- (void)reloadDeviceData{
    [self.currentHome getHomeDataWithSuccess:^(ThingSmartHomeModel *homeModel) {
        if(self.currentHome){
            self.deviceArr = self.currentHome.deviceList;
            [self.pageListView.mainTableView reloadData];
        }
    } failure:^(NSError *error) {
        
    }];
}

//导航栏右侧按钮
- (IBAction)operationBtnClick:(id)sender {
    WEAKSELF(self);
    if (!self.menu) {
        self.menu = [[JHCustomMenu alloc] initWithDataArr:@[LocalString(@"添加故事机") , LocalString(@"切换家庭")] origin:CGPointMake( kScreenWidth  - 144, StatusBar_Height + 50) width:134 rowHeight:45];
        _menu.delegate = self;
        _menu.dismiss = ^() {
            weakself.menu = nil;
        };
//        _menu.arrImgName = @[@"share_pop.png", @"complain_pop.png"];
        [self.view addSubview:_menu];
    } else {
        [_menu dismissWithCompletion:^(JHCustomMenu *object) {
            weakself.menu = nil;
        }];
    }
}

- (void)jhCustomMenu:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.row == 0) {
        if(self.homeList.count == 0){
            [SVProgressHUD showErrorWithStatus:@"请先创建家庭"];
            return;
        }
        FindDeviceViewController *VC = [FindDeviceViewController new];
        VC.homeId = self.currentHome.homeId;
        [self.navigationController pushViewController:VC animated:YES];
    }else
    {
        WEAK_SELF
        SwitchFamailyVC *VC = [SwitchFamailyVC new];
        VC.homeList = self.homeList;
        VC.currentHome = self.currentHome;
        VC.sureBlock = ^(ThingSmartHomeModel * _Nonnull model) {
            weakSelf.currentHome = [ThingSmartHome homeWithHomeId:model.homeId];
            weakSelf.currentHome.delegate = self;
            [weakSelf reloadDeviceData];
        };
        VC.managerBlock = ^{
            FamailyManageVC *VC = [FamailyManageVC new];
            [weakSelf.navigationController pushViewController:VC animated:YES];
        };
        VC.modalPresentationStyle = UIModalPresentationOverFullScreen;
        [self presentViewController:VC animated:NO completion:nil];
        
    }
    
}

#pragma mark - JXPageViewDelegate
//Tips:实现代理方法
- (NSArray<UIView<JXPageListViewListDelegate> *> *)listViewsInPageListView:(JXPageListView *)pageListView {
    return self.listViewArray;
}

- (void)pinCategoryView:(JXCategoryBaseView *)pinCategoryView didSelectedItemAtIndex:(NSInteger)index {
    self.navigationController.interactivePopGestureRecognizer.enabled = (index == 0);
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    //Tips:需要传入mainTableView的scrollViewDidScroll事件
    [self.pageListView mainTableViewDidScroll:scrollView];
}


#pragma mark -- UITableViewDataSource
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 2 + 1; //底部的分类滚动视图需要作为最后一个section
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return 1;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    WEAK_SELF
    if (indexPath.section == 0) {
        if(self.deviceArr.count>0){
            HomeDeviceCell *cell = [tableView dequeueReusableCellWithIdentifier:@"HomeDeviceCell" forIndexPath:indexPath];
            cell.deviceList = self.deviceArr;
            return cell;
        }else{
            HomeNoDeviceCell *cell = [tableView dequeueReusableCellWithIdentifier:@"HomeNoDeviceCell" forIndexPath:indexPath];
            cell.type = indexPath.section;
            cell.addBtnClickBlock = ^{
                FindDeviceViewController *VC = [FindDeviceViewController new];
                VC.homeId = weakSelf.currentHome.homeId;
                [weakSelf.navigationController pushViewController:VC animated:YES];
            };
            return cell;
        }
        
    }else if (indexPath.section == 1) {
        if(self.diyDollList.count == 0){
            HomeNoDeviceCell *cell = [tableView dequeueReusableCellWithIdentifier:@"HomeNoDeviceCell" forIndexPath:indexPath];
            cell.type = indexPath.section;
            cell.addBtnClickBlock = ^{
                
            };
            return cell;
        }else{
            HomeToysCell *cell = [tableView dequeueReusableCellWithIdentifier:@"HomeToysCell" forIndexPath:indexPath];
            cell.dataArr = self.diyDollList;
            cell.itemClickBlock = ^(NSInteger index) {
                // 跳转到RN页面
                HomeDollModel *selectedDoll = weakSelf.diyDollList[index];
                [weakSelf navigateToRNPageWithDoll:selectedDoll];
            };
            cell.itemClickBlock = ^(NSInteger index) {
                // 跳转到RN页面
                HomeDollModel *selectedDoll = weakSelf.diyDollList[index];
                [weakSelf navigateToRNPageWithDoll:selectedDoll];
            };
            return cell;
        }
        
    }else{
        return [self.pageListView listContainerCellForRowAtIndexPath:indexPath];
    }
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    if (indexPath.section == 0) {
        return self.deviceArr.count > 0 ? 150 :270;
    }else if (indexPath.section == 1){
        return self.diyDollList.count > 0 ? 150 :270;
    }else{
        //Tips:最后一个section（即listContainerCell所在的section）返回listContainerCell的高度
        return [self.pageListView listContainerCellHeight];
    }
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    
}

- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section {
    UIView *headView = [[UIView alloc]initWithFrame:CGRectMake(0, 0, kScreenWidth, 50)];
    headView.backgroundColor = tableBgColor;
    UILabel *titleLab = [UILabel new];
    titleLab.textColor = UIColorHex(131516);
    titleLab.font = [UIFont boldSystemFontOfSize:20];
    [headView addSubview:titleLab];
    [titleLab mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(headView).offset(15);
        make.centerY.equalTo(headView);
    }];
    if(section == 1){
        UIButton *infoBtn = [UIButton buttonWithType:UIButtonTypeCustom];
        [infoBtn setImage:QD_IMG(@"home_info") forState:UIControlStateNormal];
        [infoBtn addTarget:self action:@selector(toysGuide:) forControlEvents:UIControlEventTouchUpInside];
        [headView addSubview:infoBtn];
        [infoBtn mas_makeConstraints:^(MASConstraintMaker *make) {
            make.left.equalTo(titleLab.mas_right).offset(0);
            make.top.bottom.equalTo(headView);
            make.width.mas_equalTo(40);
        }];
    }
    if(section ==0 || section ==1){
        UIButton *moreBtn = [UIButton buttonWithType:UIButtonTypeCustom];
        [moreBtn setTitle:NSLocalizedString(@"更多", @"")  forState:UIControlStateNormal];
        [moreBtn setImage:QD_IMG(@"home_section_more") forState:UIControlStateNormal];
        [moreBtn setTitleColor:UIColorHex(1DA9FF) forState:UIControlStateNormal];
        moreBtn.titleLabel.font = [UIFont systemFontOfSize:14];
        moreBtn.tag = section + 100;
        [moreBtn addTarget:self action:@selector(viewMore:) forControlEvents:UIControlEventTouchUpInside];
        [moreBtn layoutWithStyle:HKBtnImagePosition_Right space:15];
        [headView addSubview:moreBtn];
        [moreBtn mas_makeConstraints:^(MASConstraintMaker *make) {
            make.right.equalTo(headView.mas_right).offset(-15);
            make.top.bottom.equalTo(headView);
            make.width.mas_equalTo(50);
        }];
        if(section ==0){
            moreBtn.hidden = self.deviceArr.count == 0;
        }else{
            moreBtn.hidden = self.diyDollList.count == 0;
        }
    }
    
    switch (section) {
        case 0:
            titleLab.text = NSLocalizedString(@"我的设备", @"");
            break;
        case 1:
            titleLab.text = NSLocalizedString(@"我的公仔", @"") ;
            break;
        case 2:
            titleLab.text = NSLocalizedString(@"探索公仔", @"") ;
            break;
        default:
            break;
    }
    
    return headView;
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section {
    return 50;
}

//查看更多
-(void)viewMore:(UIButton *)btn{
    switch (btn.tag-100) {
        case 0:
        {
            HomeDeviceListVC *VC = [HomeDeviceListVC new];
            VC.home = self.currentHome;
            VC.deviceArr = self.deviceArr;
            [self.navigationController pushViewController:VC animated:YES];
        }
           
            break;
        case 1:
        {
            HomeToysListVC *VC = [HomeToysListVC new];
            [self.navigationController pushViewController:VC animated:YES];
        }
            
            break;
        default:
            break;
    }
}

//Toys引导
-(void)toysGuide:(UIButton *)btn{
    AddToysGuideVC *VC = [[AddToysGuideVC alloc] init];
//    ToysGuideFindVC *VC = [[ToysGuideFindVC alloc] init];
    VC.sureBlock = ^{
        
    };
    VC.modalPresentationStyle = UIModalPresentationOverFullScreen;
    [self presentViewController:VC animated:NO completion:nil];
    
}

#pragma mark - ThingSmartHomeManagerDelegate

// 添加一个家庭
- (void)homeManager:(ThingSmartHomeManager *)manager didAddHome:(ThingSmartHomeModel *)homeModel {
    if (homeModel.dealStatus <= ThingHomeStatusPending && homeModel.name.length > 0) {
        [UIAlertController cs_alertControllerWithTitle:@"加入家庭邀请" message:[NSString stringWithFormat:@"您有一个加入%@家庭的邀请，是否同意加入？",homeModel.name] preferredStyle:UIAlertControllerStyleAlert cancleButtonTitle:@"暂不加入" otherTitle:@[@"加入家庭"] controller:self actionBlock:^(UIAlertAction * _Nonnull action, NSInteger idx) {
            ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeModel.homeId];
            if(idx == 1){
                [self showHud];
                ///接受邀请
                ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeModel.homeId];
                [home joinFamilyWithAccept:YES success:^(BOOL result) {
                    [self hiddenHud];
                    [SVProgressHUD showInfoWithStatus:@"已加入家庭"];
                } failure:^(NSError *error) {
                    [self hiddenHud];
                    [SVProgressHUD showErrorWithStatus:error.localizedDescription];
                }];
            }else{
                [home joinFamilyWithAccept:NO success:^(BOOL result) {
                    
                } failure:^(NSError *error) {
                    
                }];
            }
        }];
    }
}

// 删除一个家庭
- (void)homeManager:(ThingSmartHomeManager *)manager didRemoveHome:(long long)homeId {

}

// MQTT 连接成功
- (void)serviceConnectedSuccess {
    // 去云端查询当前家庭的详情，然后去刷新 UI
}

- (void)deviceConnectStateChanged:(NSNotification *)notification {
    NSInteger status = [notification.object intValue];
    if(status == AddStatusType_success){
        [self getData];
    }
    NSLog(@"设备状态变更：%ld", status);
}

#pragma mark - ThingSmartHomeDelegate

// 家庭的信息更新，例如家庭 name 变化
- (void)homeDidUpdateInfo:(ThingSmartHome *)home {
    [self reloadHomeListData];
}



// 添加设备
- (void)home:(ThingSmartHome *)home didAddDeivice:(ThingSmartDeviceModel *)device {
    [self reloadDeviceData];
}

// 删除设备
- (void)home:(ThingSmartHome *)home didRemoveDeivice:(NSString *)devId {
    [self reloadDeviceData];
}

// 设备信息更新，例如设备 name 变化，在线状态变化
- (void)home:(ThingSmartHome *)home deviceInfoUpdate:(ThingSmartDeviceModel *)device {
    [self reloadDeviceData];
}

// 家庭下设备的 dps 变化代理回调
- (void)home:(ThingSmartHome *)home device:(ThingSmartDeviceModel *)device dpsUpdate:(NSDictionary *)dps {
    [self reloadDeviceData];
}


- (ThingSmartHomeManager *)homeManager {
    if (!_homeManager) {
        _homeManager = [[ThingSmartHomeManager alloc] init];
        _homeManager.delegate = self;
    }
    return _homeManager;
}

- (NSMutableArray<ThingSmartHomeModel *> *)homeList {
    if (!_homeList) {
        _homeList = [[NSMutableArray alloc] init];
    }
    return _homeList;
}
/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

- (void)navigateToRNPageWithDoll:(NSString *)doll {
    // 创建RN视图控制器，导航到DollPanel页面
    NSDictionary *params = @{
        @"dollId": doll ?: @"",
        @"source": @"home-page",
        @"timestamp": @([[NSDate date] timeIntervalSince1970])
    };

    ReactViewController *rnVC = [ReactViewController viewControllerWithInitialRoute:@"DollPanel" params:params];

    // 跳转到RN页面
    [self.navigationController pushViewController:rnVC animated:YES];
}

@end

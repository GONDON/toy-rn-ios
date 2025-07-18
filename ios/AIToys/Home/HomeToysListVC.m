//
//  HomeToysListVC.m
//  AIToys
//
//  Created by 乔不赖 on 2025/6/25.
//

#import "HomeToysListVC.h"
#import "HomeToysItem.h"

@interface HomeToysListVC ()
@property (weak, nonatomic) IBOutlet UICollectionView *collectionView;
@property (weak, nonatomic) IBOutlet UIView *btnView;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *colletionBottomH;
@property (weak, nonatomic) IBOutlet UIButton *deleteBtn;
@property (weak, nonatomic) IBOutlet UIButton *makeTopBtn;
@property (nonatomic, assign) BOOL isEdit;//是否是编辑状态
@property (nonatomic, strong) UIButton *editBtn;
@property (nonatomic, strong) UIButton *cancelBtn;
@property (nonatomic,strong)NSMutableArray *dataArr;

//拖拉排序相关
@property (nonatomic, strong)UILongPressGestureRecognizer *longPress;//长按手势
@property (nonatomic,strong) HomeToysItem *cell ;
@property (nonatomic,strong)UIView *tempMoveCell;
@property (nonatomic,strong)NSIndexPath *indexPath;
@property (nonatomic,strong)NSIndexPath *moveIndexPath;
@property (nonatomic,assign)CGPoint lastPoint;

//选择相关
@property (nonatomic,strong)NSMutableArray *selectArr;
@end

@implementation HomeToysListVC

-(NSMutableArray *)selectArr{
    if(!_selectArr){
        _selectArr = [[NSMutableArray alloc] init];
    }
    return _selectArr;
}

- (NSMutableArray *)dataArr {
    if (!_dataArr) {
        _dataArr = [[NSMutableArray alloc] init];
    }
    return _dataArr;
}


- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = LocalString(@"我的公仔");
    self.dataArr = [[NSMutableArray alloc] initWithArray:@[@"勇士",@"马刺",@"火箭",@"快船",@"爵士",@"开拓",@"灰熊",@"骑士",@"凯尔",@"老鹰",@"奇才",@"步行",@"魔术",@"公牛",@"热火"]];
    [self setupUI];
}

-(void)setupUI{
    [self setRightBtn];
    UICollectionViewFlowLayout *layout = [UICollectionViewFlowLayout.alloc init];
    layout.itemSize = CGSizeMake(kScreenWidth - 30, 144);;
    layout.minimumLineSpacing = 12;
    layout.minimumInteritemSpacing = 12;
    layout.sectionInset = UIEdgeInsetsMake(12, 15, 12, 15);
    self.collectionView.collectionViewLayout = layout;
    _collectionView.backgroundColor = [UIColor clearColor];
    [_collectionView registerNib:[UINib nibWithNibName:@"HomeToysItem" bundle:nil] forCellWithReuseIdentifier:@"cell"];
    self.longPress = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(pan:)];
    [self.deleteBtn setTitle:LocalString(@"删除设备") forState:0];
    [self.makeTopBtn setTitle:LocalString(@"置顶") forState:0];
}

//设置左侧按钮
-(void)setLeftBtn{
    self.cancelBtn = [[UIButton alloc] initWithFrame:CGRectMake(0,0, 40, 44)];
    [self.cancelBtn setTitle:LocalString(@"取消") forState:UIControlStateNormal];
    [self.cancelBtn setTitleColor:mainColor forState:UIControlStateNormal];
    self.cancelBtn.titleLabel.font = [UIFont systemFontOfSize:15];
    self.cancelBtn.titleLabel.textAlignment = NSTextAlignmentCenter;
    [self.cancelBtn addTarget:self action:@selector(cancelBtnClick:) forControlEvents:UIControlEventTouchUpInside];
    UIBarButtonItem* leftItem = [[UIBarButtonItem alloc]initWithCustomView:self.cancelBtn];
    self.navigationItem.leftBarButtonItem = leftItem;
}

//设置右侧按钮
-(void)setRightBtn{
    self.editBtn = [[UIButton alloc] initWithFrame:CGRectMake(0,0, 40, 44)];
    [self.editBtn setTitle:LocalString(@"管理") forState:UIControlStateNormal];
    [self.editBtn setTitleColor:mainColor forState:UIControlStateNormal];
    self.editBtn.titleLabel.font = [UIFont systemFontOfSize:15];
    self.editBtn.titleLabel.textAlignment = NSTextAlignmentCenter;
    [self.editBtn addTarget:self action:@selector(editBtnClick:) forControlEvents:UIControlEventTouchUpInside];
    UIBarButtonItem* rightItem = [[UIBarButtonItem alloc]initWithCustomView:self.editBtn];
    self.navigationItem.rightBarButtonItem = rightItem;
}

//管理按钮
-(void)editBtnClick:(UIButton *)btn{
    [self dealViewEditStatus];
    [self hiddenHud];
}

//取消按钮
-(void)cancelBtnClick:(UIButton *)btn{
    [self dealViewEditStatus];
}

//处理页面编辑页状态
- (void)dealViewEditStatus{
    self.isEdit = !self.isEdit;
    [self.editBtn setTitle: self.isEdit ?  LocalString(@"完成"): LocalString(@"管理") forState:UIControlStateNormal];
    self.btnView.hidden = !self.isEdit;
    if(self.isEdit){
        [self setLeftBtn];
        self.colletionBottomH.constant = 68;
        [self.collectionView addGestureRecognizer:self.longPress];
    }else{
        [self setupNavBackBtn];
        self.colletionBottomH.constant = 0;
        [self.collectionView removeGestureRecognizer:self.longPress];
    }
    [self.collectionView reloadData];
}

#pragma mark - <UICollectionViewDataSource, UICollectionViewDelegateFlowLayout>
- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return self.dataArr.count;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    HomeToysItem *cell = [collectionView dequeueReusableCellWithReuseIdentifier:@"cell" forIndexPath:indexPath];
    cell.nameLabel.text =  self.dataArr[indexPath.row];
    cell.index = indexPath.row;
    cell.isEdit = self.isEdit;
    cell.isSel = [self.selectArr containsObject:self.dataArr[indexPath.row]];
    return cell;
}

-(void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath
{
    if(_isEdit){
        if([self.selectArr containsObject:self.dataArr[indexPath.row]]){
            [self.selectArr removeObject:self.dataArr[indexPath.row]];
        }else{
            [self.selectArr addObject:self.dataArr[indexPath.row]];
        }
        [self.collectionView reloadData];
    }
}

//拖动排序手势
-(void)pan:(UILongPressGestureRecognizer *)pan
{
    WEAK_SELF
    //判断手势状态
    switch (pan.state) {
        case UIGestureRecognizerStateBegan:{

//            self.isEdit = YES;
//            [self.collectionView reloadData];
            [self.collectionView performBatchUpdates:^{
                
            } completion:^(BOOL finished) {
                //判断手势落点位置是否在路径上
                weakSelf.indexPath = [weakSelf.collectionView indexPathForItemAtPoint:[pan locationOfTouch:0 inView:pan.view]];
                //得到该路径上的cell
                weakSelf.cell = (HomeToysItem *)[weakSelf.collectionView cellForItemAtIndexPath:weakSelf.indexPath];
                //截图cell，得到一个view
                weakSelf.tempMoveCell = [weakSelf.cell snapshotViewAfterScreenUpdates:NO];
                weakSelf.tempMoveCell.frame = weakSelf.cell.frame;
                
                 [weakSelf.collectionView addSubview:weakSelf.tempMoveCell];
                weakSelf.cell.hidden = YES;
                //记录当前手指位置
                weakSelf.lastPoint = [pan locationOfTouch:0 inView:pan.view];
                }];
            }
            break;
        case UIGestureRecognizerStateChanged:
        {
            //偏移量
            CGFloat tranX = [pan locationOfTouch:0 inView:pan.view].x - _lastPoint.x;
            CGFloat tranY = [pan locationOfTouch:0 inView:pan.view].y - _lastPoint.y;
            
            //更新cell位置
            _tempMoveCell.center = CGPointApplyAffineTransform(_tempMoveCell.center, CGAffineTransformMakeTranslation(tranX, tranY));
             //记录当前手指位置
            _lastPoint = [pan locationOfTouch:0 inView:pan.view];
            
            for (UICollectionViewCell *cell in [self.collectionView visibleCells]) {
                //剔除隐藏的cell
                if ([self.collectionView indexPathForCell:cell] == self.indexPath) {
                    continue;
                }
                //计算中心，如果相交一半就移动
                CGFloat spacingX = fabs(_tempMoveCell.center.x - cell.center.x);
                CGFloat spacingY = fabs(_tempMoveCell.center.y - cell.center.y);
                if (spacingX <= _tempMoveCell.bounds.size.width / 2.0f && spacingY <= _tempMoveCell.bounds.size.height / 2.0f){
                    self.moveIndexPath = [self.collectionView indexPathForCell:cell];
                    //更新数据源（移动前必须更新数据源）
                    [self updateDataSource];
                    //移动cell
                    [self.collectionView moveItemAtIndexPath:self.indexPath toIndexPath:self.moveIndexPath];
                   //设置移动后的起始indexPath
                    self.indexPath = self.moveIndexPath;
                    break;
                }
            }
        }
            break;
        case UIGestureRecognizerStateEnded:
        {
            [self.collectionView performBatchUpdates:^{
                
            } completion:^(BOOL finished) {
                weakSelf.cell  = (HomeToysItem *)[weakSelf.collectionView cellForItemAtIndexPath:weakSelf.indexPath];
                [UIView animateWithDuration:0.1 animations:^{
                    weakSelf.tempMoveCell.center = weakSelf.cell.center;
                } completion:^(BOOL finished) {
                    [weakSelf.tempMoveCell removeFromSuperview];
                    weakSelf.cell.hidden = NO;
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        [weakSelf.collectionView reloadData];
                    });
                }];

            }];
        }
            break;
        default:
            break;
    }
}

-(void)updateDataSource
{
    //取出源item数据
    id objc =  [self.dataArr objectAtIndex:self.indexPath.row];
    //从资源数组中移除该数据,不能直接删除某个数据，因为有可能有相同的数据，一下子删除了多个数据源，造成clash
    //    [[self.numArray objectAtIndex:self.indexPath.section] removeObject:objc];
    
    //删除指定位置的数据，这样就只删除一个，不会重复删除
    
    [self.dataArr removeObjectAtIndex:self.indexPath.row];
    //将数据插入到资源数组中的目标位置上
    [self.dataArr insertObject:objc atIndex:self.moveIndexPath.row];
}

//删除设备
- (IBAction)deleteDeviceBtnClick:(id)sender {
    [UIAlertController cs_alertControllerWithTitle:nil message:LocalString(@"确定要删除设备吗？")  preferredStyle:UIAlertControllerStyleAlert cancleButtonTitle:LocalString(@"取消") otherTitle:@[LocalString(@"确定")] controller:self actionBlock:^(UIAlertAction * _Nonnull action, NSInteger idx) {
        if(idx == 1){
//            ThingSmartDevice *device = [ThingSmartDevice deviceWithDeviceId:self.selectDeviceId];
//           WEAK_SELF
//            [device remove:^{
//                NSLog(@"remove success");
//                [SVProgressHUD showSuccessWithStatus:@"remove success"];
//                NSInteger temp = 0;
//                for (int i = 0; i<self.dataArr.count; i++) {
//                    if([weakSelf.selectDeviceId isEqualToString:self.dataArr[i].devId]){
//                        temp = i;
//                        break;
//                    }
//                }
//                [weakSelf.dataArr removeObjectAtIndex:temp];
//                [weakSelf dealViewEditStatus];
//            } failure:^(NSError *error) {
//                NSLog(@"remove failure: %@", error);
//            }];
        }
    }];
}

//置顶设备
- (IBAction)setDeviceTop:(id)sender {
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

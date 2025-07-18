//
//  UserPermmitVC.m
//  AIToys
//
//  Created by qdkj on 2025/7/9.
//

#import "UserPermmitVC.h"
#import "UserPermmitCell.h"
#import "MyTabBarController.h"

@interface UserPermmitVC ()
@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property (weak, nonatomic) IBOutlet UIButton *enterBtn;
@property (strong, nonatomic) IBOutlet UIView *headerView;
@property (nonatomic, strong) NSMutableArray *selcArr;
@end

@implementation UserPermmitVC

- (void)viewDidLoad {
    [super viewDidLoad];
    self.fd_prefersNavigationBarHidden = YES;
    self.tableView.tableHeaderView = self.headerView;
    self.tableView.backgroundColor = tableBgColor;
    [self.tableView registerNib:[UINib nibWithNibName:@"UserPermmitCell" bundle:nil] forCellReuseIdentifier:@"UserPermmitCell"];
    self.selcArr = [NSMutableArray arrayWithArray:@[@(1),@(1)]];
}

//进入APP
- (IBAction)enterBtnClick:(id)sender {
    MyTabBarController *tabbar = [MyTabBarController new];
    [UIApplication sharedApplication].keyWindow.rootViewController = tabbar;
}

#pragma mark -- UITableViewDataSource
-(NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.selcArr.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UserPermmitCell *cell = [tableView dequeueReusableCellWithIdentifier:@"UserPermmitCell" forIndexPath:indexPath];
    cell.isSelct = [self.selcArr[indexPath.row] intValue];
    return cell;
}

#pragma mark UITableViewDelegate

-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    if([self.selcArr[indexPath.row] intValue] == 1){
        self.selcArr[indexPath.row] = @(0);
    }else{
        self.selcArr[indexPath.row] = @(1);
    }
    [self.tableView reloadData];
    BOOL isAllSel = YES;
    for (NSNumber *obj in self.selcArr) {
        if([obj intValue] == 0){
            isAllSel = NO;
        }
    }
    if(isAllSel){
        [PublicObj makeButtonEnable:self.enterBtn];
    }else{
        [PublicObj makeButtonUnEnable:self.enterBtn];
    }
    
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

//
//  AddFamailyMemeberVC.m
//  AIToys
//
//  Created by qdkj on 2025/6/23.
//

#import "AddFamailyMemeberVC.h"

@interface AddFamailyMemeberVC ()
@property (weak, nonatomic) IBOutlet UILabel *nameLabel;
@property (weak, nonatomic) IBOutlet UITextField *nameTextField;
@property (weak, nonatomic) IBOutlet UILabel *accountLabel;
@property (weak, nonatomic) IBOutlet UITextField *accountTextField;
@property (weak, nonatomic) IBOutlet UILabel *roleTitleLabel;
@property (weak, nonatomic) IBOutlet UILabel *roleNameLabel;
@property (weak, nonatomic) IBOutlet UILabel *alertLabel;
@property(strong, nonatomic) ThingSmartHome *home;
@end

@implementation AddFamailyMemeberVC

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = LocalString(@"添加成员");
    self.nameLabel.text = LocalString(@"名称");
    self.nameTextField.placeholder = LocalString(@"请输入名称");
    self.accountLabel.text = LocalString(@"账号");
    self.accountTextField.placeholder = LocalString(@"请输入账号");
    self.roleTitleLabel.text = LocalString(@"家庭角色");
    self.roleNameLabel.text = LocalString(@"普通成员");
    self.view.backgroundColor = tableBgColor;
    [self setRightBtn];
    [self loadData];
}

//设置右侧按钮
-(void)setRightBtn{
    UIButton *rightButton = [[UIButton alloc] initWithFrame:CGRectMake(0,0, 40, 44)];
    [rightButton setTitle:LocalString(@"确定") forState:UIControlStateNormal];
    [rightButton setTitleColor:mainColor forState:UIControlStateNormal];
    rightButton.titleLabel.font = [UIFont systemFontOfSize:15];
    rightButton.titleLabel.textAlignment = NSTextAlignmentCenter;
    [rightButton addTarget:self action:@selector(done) forControlEvents:UIControlEventTouchUpInside];
    UIBarButtonItem* rightItem = [[UIBarButtonItem alloc]initWithCustomView:rightButton];
    self.navigationItem.rightBarButtonItem = rightItem;
}

-(void)loadData{
    //初始化成员操作类
    ThingSmartHomeModel *model = self.homeModel;
    self.home = [ThingSmartHome homeWithHomeId:model.homeId];
}

//确定
-(void)done{
    WEAK_SELF
    if(self.nameTextField.text.length == 0){
        [SVProgressHUD showErrorWithStatus:LocalString(@"请输入名称")];
        return;
    }
    if(self.accountTextField.text.length == 0){
        [SVProgressHUD showErrorWithStatus:LocalString(@"请输入帐号")];
        return;
    }
    ThingSmartHomeAddMemberRequestModel *requestModel = [[ThingSmartHomeAddMemberRequestModel alloc] init];
    requestModel.name = self.nameTextField.text;
    requestModel.account = self.accountTextField.text;
    requestModel.countryCode = Country_Code;
    requestModel.role = ThingHomeRoleType_Member;
    requestModel.autoAccept = NO;
    [self showHud];
    [self.home addHomeMemberWithAddMemeberRequestModel:requestModel success:^(NSDictionary *dict) {
        [weakSelf hiddenHud];
        [weakSelf.navigationController popViewControllerAnimated:YES];
        
    } failure:^(NSError *error) {
        [weakSelf hiddenHud];
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    }];
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

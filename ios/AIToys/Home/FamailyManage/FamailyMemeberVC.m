//
//  FamailyMemeberVC.m
//  AIToys
//
//  Created by qdkj on 2025/6/23.
//

#import "FamailyMemeberVC.h"
#import "FamailyMemeberCell.h"
#import "FamailyMemeberAvatarCell.h"
#import "FamailyNameCell.h"

@interface FamailyMemeberVC ()<UITableViewDelegate,UITableViewDataSource,RYFTableViewDelegate>
@property (nonatomic, strong)RYFTableView *tableView;
@property (nonatomic,strong) NSArray *dataArr;
@property(assign, nonatomic) BOOL isOwner;//是否是家庭所有者
@end

@implementation FamailyMemeberVC

- (RYFTableView *)tableView{
    if (!_tableView) {
        _tableView = [[RYFTableView alloc] initWithFrame:CGRectZero style:UITableViewStyleGrouped];
        _tableView.tableViewDelegate = self;
        _tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
        _tableView.estimatedRowHeight = 64;
        _tableView.tableHeaderView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 15)];
        _tableView.sectionHeaderHeight = 0;
        _tableView.sectionFooterHeight = 15;
        _tableView.backgroundColor = tableBgColor;
        [_tableView registerNib:[UINib nibWithNibName:@"FamailyNameCell" bundle:nil] forCellReuseIdentifier:@"FamailyNameCell"];
        [_tableView registerNib:[UINib nibWithNibName:@"FamailyMemeberCell" bundle:nil] forCellReuseIdentifier:@"FamailyMemeberCell"];
        [_tableView registerNib:[UINib nibWithNibName:@"FamailyMemeberAvatarCell" bundle:nil] forCellReuseIdentifier:@"FamailyMemeberAvatarCell"];
    }
    return _tableView;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.isOwner = self.homeModel.role == ThingHomeRoleType_Owner;
    [self setupUI];
}


- (void)loadDataRefreshOrPull:(RYFRefreshType)type {
    if (type == 0) {
//        request.Page = @"1";
    }else{
        
//        request.Page = _tableView.getCurrentPage.stringValue;
    }
    [self.tableView endLoading];
    [self.tableView reloadData];
}

-(void)setupUI{
    self.title = LocalString(@"家庭成员");
    self.tableView.loadState = RYFCanLoadRefresh;
    if(self.inviteModel && self.isOwner){
        self.tableView.tableFooterView = [self setupfooterView];
    }
    [self.view addSubview:self.tableView];
    [self.tableView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.edges.equalTo(self.view);
    }];
    
}

- (UIView *)setupfooterView {
    UIView *footer = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 2*64)];
    
    UIView *btnView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 2*64)];
    btnView.backgroundColor = UIColor.whiteColor;
    [footer addSubview:btnView];
    UIButton *inviteBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    inviteBtn.titleLabel.font = [UIFont systemFontOfSize:16];
    [inviteBtn setTitle:LocalString(@"重新邀请") forState:0];
    [inviteBtn setTitleColor:UIColorHex(F04C4C) forState:0];
    [inviteBtn addTarget:self action:@selector(inviteAgain) forControlEvents:UIControlEventTouchUpInside];
    [btnView addSubview:inviteBtn];
    [inviteBtn mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.left.right.equalTo(btnView);
        make.height.mas_equalTo(64);
    }];
    
    UIButton *revokeBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    revokeBtn.titleLabel.font = [UIFont systemFontOfSize:16];
    [revokeBtn setTitle:LocalString(@"撤销") forState:0];
    [revokeBtn setTitleColor:UIColorHex(F04C4C) forState:0];
    [revokeBtn addTarget:self action:@selector(revoke) forControlEvents:UIControlEventTouchUpInside];
    [btnView addSubview:revokeBtn];
    [revokeBtn mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(inviteBtn.mas_bottom).offset(0);
        make.bottom.left.right.equalTo(btnView);
        make.height.mas_equalTo(64);
    }];
    
    return footer;
}

//修改成员名称
- (void)showAlertWithTextField {
    WEAK_SELF
    // 创建UIAlertController
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:LocalString(@"名称") message:@"" preferredStyle:UIAlertControllerStyleAlert];
    
    // 添加文本字段
    [alert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        // 配置文本字段
        textField.placeholder = LocalString(@"请输入名称");
        textField.text = self.memberModel ? self.memberModel.name : self.inviteModel.name;
        textField.keyboardType = UIKeyboardTypeDefault; // 设置键盘类型
    }];
    
    // 添加“确定”按钮及其处理程序
    [alert addAction:[UIAlertAction actionWithTitle:LocalString(@"确定") style:UIAlertActionStyleDefault handler:^(UIAlertAction *action) {
        // 获取文本字段的值并处理
        UITextField *textField = alert.textFields.firstObject;
        NSString *inputText = textField.text;
        NSLog(@"输入的内容是: %@", inputText);
        // 在这里你可以根据需要处理输入的文本
        if(inputText.length == 0){
            [SVProgressHUD showErrorWithStatus:LocalString(@"请输入名称")];
            return;
        }
        if(self.memberModel){
//            if(self.memberModel.role == ThingHomeRoleType_Owner){
//                [[ThingSmartUser sharedInstance] updateNickname:inputText success:^{
//                    weakSelf.memberModel.name = inputText;
//                    [weakSelf.tableView reloadData];
//                } failure:^(NSError *error) {
//                    [SVProgressHUD showErrorWithStatus:error.description];
//                    NSLog(@"updateNickname failure: %@", error);
//                }];
//            }
            ThingSmartHomeMember *homeMember = [[ThingSmartHomeMember alloc] init];
        
            ThingSmartHomeMemberRequestModel *requestModel = [[ThingSmartHomeMemberRequestModel alloc] init];
            requestModel.memberId = self.memberModel.memberId;
            requestModel.name = inputText;
            requestModel.role = self.memberModel.role;
            [homeMember updateHomeMemberInfoWithMemberRequestModel:requestModel success:^{
                [self hiddenHud];
                weakSelf.memberModel.name = inputText;
                [weakSelf.tableView reloadSection:0 withRowAnimation:UITableViewRowAnimationNone];
                } failure:^(NSError *error) {
                    [self hiddenHud];
                    [SVProgressHUD showErrorWithStatus:error.localizedDescription];
                }];
        }else{
            ThingSmartHomeInvitationInfoRequestModel *requestModel = [[ThingSmartHomeInvitationInfoRequestModel alloc] init];
            requestModel.invitationID = self.inviteModel.invitationID;
            requestModel.name = inputText;
            requestModel.role = self.inviteModel.role;
            [self showHud];
            [weakSelf.smartHomeInvitation updateInvitationInfoWithInvitationInfoRequestModel:requestModel success:^(BOOL result) {
                [weakSelf hiddenHud];
                weakSelf.inviteModel.name = inputText;
                [weakSelf.tableView reloadSection:0 withRowAnimation:UITableViewRowAnimationNone];
            } failure:^(NSError *error) {
                [weakSelf hiddenHud];
                [SVProgressHUD showErrorWithStatus:error.localizedDescription];
            }];
        }
        
        
    }]];
    
    // 添加“取消”按钮及其处理程序（可选）
    [alert addAction:[UIAlertAction actionWithTitle:LocalString(@"取消") style:UIAlertActionStyleCancel handler:^(UIAlertAction *action) {
        // 处理取消操作（如果有需要）
        
    }]];
    
    // 显示对话框
    [self presentViewController:alert animated:YES completion:nil];
}

//重新邀请
-(void)inviteAgain{
    WEAK_SELF
    [self.smartHomeInvitation cancelInvitationWithInvitationID:self.inviteModel.invitationID success:^(BOOL result) {
        if(result){
            [weakSelf createInvitCode];
        }
    } failure:^(NSError *error) {
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    }];
}

//生成邀请码
- (void)createInvitCode{
    WEAK_SELF
    ThingSmartHomeInvitationCreateRequestModel *requestModel = [[ThingSmartHomeInvitationCreateRequestModel alloc] init];
    requestModel.homeID = self.homeModel.homeId;
    requestModel.needMsgContent = YES;
    [self.smartHomeInvitation createInvitationWithCreateRequestModel:requestModel success:^(ThingSmartHomeInvitationResultModel * _Nonnull invitationResultModel) {
        [UIAlertController cs_alertControllerWithTitle:LocalString(@"邀请成员") message:invitationResultModel.invitationMsgContent preferredStyle:UIAlertControllerStyleAlert cancleButtonTitle:LocalString(@"复制") otherTitle:@[] controller:self actionBlock:^(UIAlertAction * _Nonnull action, NSInteger idx) {
            UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
            pasteboard.string = invitationResultModel.invitationMsgContent;
            [SVProgressHUD showSuccessWithStatus:LocalString(@"已复制到剪切板")];
        }];
    } failure:^(NSError *error) {
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    }];
}

//撤销
-(void)revoke{
    WEAK_SELF
    [self.smartHomeInvitation cancelInvitationWithInvitationID:self.inviteModel.invitationID success:^(BOOL result) {
        if(result){
            [SVProgressHUD showSuccessWithStatus:LocalString(@"撤销成功")];
            [weakSelf.navigationController popViewControllerAnimated:YES];
        }
    } failure:^(NSError *error) {
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    }];
}
#pragma mark -- UITableViewDataSource
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    return 2;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    if (section == 0) {
        return self.memberModel ? 2 : 1;
    }
    return 2;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    if(indexPath.section == 0){
        if(indexPath.row == 0){
            FamailyNameCell *cell = [tableView dequeueReusableCellWithIdentifier:@"FamailyNameCell" forIndexPath:indexPath];
            cell.titleLabel.text = LocalString(@"名称");
            cell.nameLabel.text = self.memberModel? self.memberModel.name: self.inviteModel.name;
            cell.rightImg.hidden = !self.isOwner;
            cell.rightImgW.constant = self.isOwner ? 24 : 0;
            return cell;
        }else{
            FamailyMemeberAvatarCell *cell = [tableView dequeueReusableCellWithIdentifier:@"FamailyMemeberAvatarCell" forIndexPath:indexPath];
            return cell;
        }
    }else{
        FamailyMemeberCell *cell = [tableView dequeueReusableCellWithIdentifier:@"FamailyMemeberCell" forIndexPath:indexPath];
        switch (indexPath.row) {
            case 0:
                cell.titleLabel.text = LocalString(@"关联账号");
                cell.nameLabel.text = self.memberModel? self.memberModel.userName: self.inviteModel.dealStatus == ThingHomeStatusPending ?LocalString(@"待加入") : LocalString(@"已拒绝");
                break;
            case 1:
                cell.titleLabel.text = LocalString(@"家庭角色");
                cell.nameLabel.text = LocalString(@"普通成员");
                break;
    
            default:
                break;
        }
        return cell;
    }
    
}

#pragma mark -- UITableViewDelegate
- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    if(indexPath.section == 0 && self.isOwner && indexPath.row == 0){
        [self showAlertWithTextField];
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

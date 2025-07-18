//
//  FamailySettingVC.m
//  AIToys
//
//  Created by qdkj on 2025/6/23.
//

#import "FamailySettingVC.h"
#import "FamailyNameCell.h"
#import "FamailyMemberCell.h"
#import "AddFamailyMemeberVC.h"
#import "FamailyMemeberVC.h"

@interface FamailySettingVC ()<UITableViewDelegate,UITableViewDataSource,RYFTableViewDelegate,ThingSmartHomeManagerDelegate>
@property (nonatomic, strong)RYFTableView *tableView;
@property (nonatomic,strong) UIButton *deleteBtn;
@property(strong, nonatomic) ThingSmartHome *home;
@property(strong, nonatomic) ThingSmartHomeInvitation *smartHomeInvitation;
@property(strong, nonatomic) NSMutableArray<ThingSmartHomeMemberModel *> *dataArr;
@property(strong, nonatomic) NSMutableArray<ThingSmartHomeInvitationRecordModel *> *inviteArr;
@property(assign, nonatomic) BOOL isMember;//是否是家庭成员
@property(strong, nonatomic) ThingSmartHomeManager *homeManager;
@end

@implementation FamailySettingVC

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self loadDataRefreshOrPull:0];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    [self loadData];
    [self setupUI];
}

-(void)loadData{
    //初始化成员操作类
    ThingSmartHomeModel *model = self.homeModel;
    self.home = [ThingSmartHome homeWithHomeId:model.homeId];
    //初始化邀请成员操作类
    self.smartHomeInvitation = [[ThingSmartHomeInvitation alloc] init];
    self.isMember = self.homeModel.role == ThingHomeRoleType_Member;
    self.homeManager = [[ThingSmartHomeManager alloc] init];
    self.homeManager.delegate = self;
    [self.home getHomeDataWithSuccess:^(ThingSmartHomeModel *homeModel) {
    } failure:^(NSError *error) {
        
    }];
}


- (void)loadDataRefreshOrPull:(RYFRefreshType)type {
    [self.dataArr removeAllObjects];
    [self.inviteArr removeAllObjects];
    WEAK_SELF
    [self.home getHomeMemberListWithSuccess:^(NSArray<ThingSmartHomeMemberModel *> *memberList) {
        weakSelf.dataArr = [memberList mutableCopy];
        [weakSelf.tableView endLoading];
        [weakSelf.tableView reloadData];
    } failure:^(NSError *error) {
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    }];
    [self.smartHomeInvitation fetchInvitationRecordListWithHomeID:self.homeModel.homeId success:^(NSArray<ThingSmartHomeInvitationRecordModel *> * _Nonnull invitationRecordList) {
        for (ThingSmartHomeInvitationRecordModel *item in invitationRecordList) {
            if(item.dealStatus != ThingHomeStatusAccept){
                [weakSelf.inviteArr addObject:item];
            }
        }
        [weakSelf.tableView reloadData];
    } failure:^(NSError *error) {
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    }];
}

-(void)setupUI{
    self.title = @"家庭设置";
    self.tableView.loadState = RYFCanLoadRefresh;
    self.tableView.tableFooterView = [self setupfooterView];
    [self.view addSubview:self.tableView];
    [self.tableView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.edges.equalTo(self.view);
    }];
    
}

- (UIView *)setupfooterView {
    CGFloat btnViewH = self.isMember ? 64 : 64*2;
    UIView *footer = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 15 + btnViewH)];
    
    UIView *btnView = [[UIView alloc] initWithFrame:CGRectMake(0, 15, kScreenWidth,  btnViewH)];
    btnView.backgroundColor = UIColor.whiteColor;
    [footer addSubview:btnView];
    CGFloat deleteBtnTop = 0;
    if(!self.isMember){
        UIButton *inviteBtn = [UIButton buttonWithType:UIButtonTypeCustom];
        inviteBtn.titleLabel.font = [UIFont systemFontOfSize:16];
        [inviteBtn setTitle:@"邀请成员" forState:0];
        [inviteBtn setTitleColor:mainColor forState:0];
        [inviteBtn addTarget:self action:@selector(inviteMember) forControlEvents:UIControlEventTouchUpInside];
        [btnView addSubview:inviteBtn];
        [inviteBtn mas_makeConstraints:^(MASConstraintMaker *make) {
            make.top.left.right.equalTo(btnView);
            make.height.mas_equalTo(64);
        }];
        deleteBtnTop = 64;
    }
    self.deleteBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    self.deleteBtn.titleLabel.font = [UIFont systemFontOfSize:16];
    self.deleteBtn.frame = CGRectMake(0, deleteBtnTop, kScreenWidth, 64);
    [self.deleteBtn setTitle: self.isMember ? @"离开家庭" : @"删除家庭" forState:0];
    [self.deleteBtn setTitleColor:UIColorHex(F04C4C) forState:0];
    [self.deleteBtn addTarget:self action:@selector(deleteFamaily) forControlEvents:UIControlEventTouchUpInside];
    [btnView addSubview:self.deleteBtn];
    return footer;
}

//修改家庭名称
- (void)showAlertWithTextField {
    // 创建UIAlertController
    WEAK_SELF
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"家庭名称" message:@"" preferredStyle:UIAlertControllerStyleAlert];
    
    // 添加文本字段
    [alert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        // 配置文本字段
        textField.placeholder = @"请输入名称";
        textField.text = self.homeModel.name;
        textField.keyboardType = UIKeyboardTypeDefault; // 设置键盘类型
    }];
    
    // 添加“确定”按钮及其处理程序
    [alert addAction:[UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action) {
        // 获取文本字段的值并处理
        UITextField *textField = alert.textFields.firstObject;
        NSString *inputText = textField.text;
        NSLog(@"输入的内容是: %@", inputText);
        // 在这里你可以根据需要处理输入的文本
        if(inputText.length == 0){
            [SVProgressHUD showErrorWithStatus:@"请输入家庭名称"];
            return;
        }
        [weakSelf.home updateHomeInfoWithName:inputText geoName:self.homeModel.geoName latitude:self.homeModel.latitude longitude:self.homeModel.longitude success:^{
            weakSelf.homeModel.name = inputText;
            [weakSelf.tableView reloadData];
        } failure:^(NSError *error) {
            [SVProgressHUD showErrorWithStatus:error.localizedDescription];
        }];
    }]];
    
    // 添加“取消”按钮及其处理程序（可选）
    [alert addAction:[UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel handler:^(UIAlertAction *action) {
        // 处理取消操作（如果有需要）
        NSLog(@"用户取消了输入");
    }]];
    
    // 显示对话框
    [self presentViewController:alert animated:YES completion:nil];
}

//删除/离开家庭
-(void)deleteFamaily{
    WEAK_SELF
    if(self.home.deviceList.count > 0){
        [UIAlertController cs_alertControllerWithTitle:@"无法删除" message:@"您家庭下有故事机，请解绑后再删除家庭" preferredStyle:UIAlertControllerStyleAlert cancleButtonTitle:@"确定" otherTitle:@[] controller:self actionBlock:^(UIAlertAction * _Nonnull action, NSInteger idx) {
            
        }];
    }else if (self.isSignalHome){
        [UIAlertController cs_alertControllerWithTitle:@"无法删除" message:@"请至少保留一个家庭" preferredStyle:UIAlertControllerStyleAlert cancleButtonTitle:@"确定" otherTitle:@[] controller:self actionBlock:^(UIAlertAction * _Nonnull action, NSInteger idx) {
            
        }];
    }else{
        [UIAlertController cs_alertControllerWithTitle:self.isMember?@"离开家庭": @"删除家庭" message:self.isMember ? @"确定要离开家庭吗？": @"删除家庭不可恢复，您的家庭成员将会被清退，是否继续？" preferredStyle:UIAlertControllerStyleAlert cancleButtonTitle:@"取消" otherTitle:@[self.isMember?@"离开": @"删除"] controller:self actionBlock:^(UIAlertAction * _Nonnull action, NSInteger idx) {
            if(idx == 1){
                [self showHud];
                ThingSmartHomeMember *homeMember = [[ThingSmartHomeMember alloc] init];
                [homeMember removeHomeMemberWithMemberId:weakSelf.dataArr[0].memberId success:^{
                    [weakSelf hiddenHud];
                    [weakSelf.navigationController popViewControllerAnimated:YES];
                } failure:^(NSError *error) {
                    [weakSelf hiddenHud];
                    [SVProgressHUD showErrorWithStatus:error.localizedDescription];
                }];
    //            [weakSelf.home dismissHomeWithSuccess:^{
    //                [SVProgressHUD dismiss];
    //                [weakSelf.navigationController popViewControllerAnimated:YES];
    //            } failure:^(NSError *error) {
    //                [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    //            }];
            }
        }];
    }
    
}

//添加成员
-(void)addMember{
    AddFamailyMemeberVC *VC = [AddFamailyMemeberVC new];
    VC.homeModel = self.homeModel;
    [self.navigationController pushViewController:VC animated:YES];
    
}

//邀请成员
-(void)inviteMember{
    WEAK_SELF
    ThingSmartHomeInvitationCreateRequestModel *requestModel = [[ThingSmartHomeInvitationCreateRequestModel alloc] init];
    requestModel.homeID = self.homeModel.homeId;
    requestModel.needMsgContent = YES;
    [self.smartHomeInvitation createInvitationWithCreateRequestModel:requestModel success:^(ThingSmartHomeInvitationResultModel * _Nonnull invitationResultModel) {
        [UIAlertController cs_alertControllerWithTitle:@"邀请成员" message:invitationResultModel.invitationMsgContent preferredStyle:UIAlertControllerStyleAlert cancleButtonTitle:@"复制" otherTitle:@[] controller:self actionBlock:^(UIAlertAction * _Nonnull action, NSInteger idx) {
            UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
            pasteboard.string = invitationResultModel.invitationMsgContent;
            [SVProgressHUD showSuccessWithStatus:@"已复制到剪切板"];
            [weakSelf loadDataRefreshOrPull:1];
        }];
    } failure:^(NSError *error) {
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    }];
}
#pragma mark -- UITableViewDataSource
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    return 3;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    if (section == 1) {
        return self.dataArr.count;
    }else if (section == 2){
        return self.inviteArr.count;
    }
    return 1;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    if(indexPath.section == 0){
        FamailyNameCell *cell = [tableView dequeueReusableCellWithIdentifier:@"FamailyNameCell" forIndexPath:indexPath];
        cell.model = self.homeModel;
        return cell;
    }else if(indexPath.section == 1){
        FamailyMemberCell *cell = [tableView dequeueReusableCellWithIdentifier:@"FamailyMemberCell" forIndexPath:indexPath];
        cell.isExpire = NO;
        cell.nameLabel.text = self.dataArr[indexPath.row].name;
        NSString *phoneStr = @"";
        switch (self.dataArr[indexPath.row].dealStatus) {
            case ThingHomeStatusPending:
                phoneStr = @"待加入";
                break;
            case ThingHomeStatusReject:
                phoneStr = @"已拒绝";
                break;
                
            default:
                phoneStr = self.dataArr[indexPath.row].userName;
                break;
        }
        cell.phoneLabel.text = phoneStr;
        cell.roleLabel.text = [self getMemeberRoleName:self.dataArr[indexPath.row].role];
        return cell;
    }else{
        FamailyMemberCell *cell = [tableView dequeueReusableCellWithIdentifier:@"FamailyMemberCell" forIndexPath:indexPath];
        cell.nameLabel.text = self.inviteArr[indexPath.row].name;
        cell.isExpire = YES;
        cell.phoneLabel.text = self.inviteArr[indexPath.row].dealStatus == ThingHomeStatusPending ?@"待加入" : @"已拒绝";
        NSInteger time = self.inviteArr[indexPath.row].validTime;
        NSInteger day = time / 24;
        NSInteger hours = 0;
        NSInteger minutes = 0;
        if(day == 0){
            hours = time % 24;
            cell.roleLabel.text = [NSString stringWithFormat:@"有效期剩余%li小时",hours];
        }else{
            cell.roleLabel.text = [NSString stringWithFormat:@"有效期剩余%li天",(long)day];
        }
        return cell;
    }
    
}

-(UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section{
    if(section == 1){
        UIView *headView = [[UIView alloc]initWithFrame:CGRectMake(0, 0, kScreenWidth, 45)];
        UILabel *nameLabel = [[UILabel alloc] initWithFrame:CGRectMake(15, 15, kScreenWidth-30, 30)];
        nameLabel.textColor = UIColorFromRGBA(000000, 0.5);
        nameLabel.font = [UIFont systemFontOfSize:13];
        nameLabel.text = @"家庭成员";
        [headView addSubview:nameLabel];
        return headView;
    }
    return nil;
}

-(UIView *)tableView:(UITableView *)tableView viewForFooterInSection:(NSInteger)section{
    if(section == 2 && !self.isMember){
        UIView *footerView = [[UIView alloc]initWithFrame:CGRectMake(0, 0, kScreenWidth, 64)];
        footerView.backgroundColor = UIColor.whiteColor;
        UILabel *nameLabel = [[UILabel alloc] init];
        nameLabel.textColor = mainColor;
        nameLabel.font = [UIFont systemFontOfSize:16];
        nameLabel.text = @"添加成员";
        [footerView addSubview:nameLabel];
        [nameLabel mas_makeConstraints:^(MASConstraintMaker *make) {
            make.left.equalTo(footerView).offset(15);
            make.top.bottom.equalTo(footerView);
        }];
        UIButton *addBtn = [UIButton buttonWithType:UIButtonTypeCustom];
        [addBtn addTarget:self action:@selector(addMember) forControlEvents:UIControlEventTouchUpInside];
        [footerView addSubview:addBtn];
        [addBtn mas_makeConstraints:^(MASConstraintMaker *make) {
            make.edges.equalTo(footerView);
        }];
    return footerView;
    }
    return nil;
}

-(CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section{
    return section==1 ? 45 : 0;
}

-(CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section{
    if(section == 2 && !self.isMember){
        return 64;;
    }
    return 0;
}

#pragma mark -- UITableViewDelegate
- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    if(indexPath.section == 0){
        if(!self.isMember){
            [self showAlertWithTextField];
        }
    }else{
        FamailyMemeberVC *VC = [FamailyMemeberVC new];
        VC.homeModel = self.homeModel;
        if(indexPath.section == 1){
            VC.memberModel = self.dataArr[indexPath.row];
        }else{
            VC.inviteModel = self.inviteArr[indexPath.row];
        }
        VC.smartHomeInvitation = self.smartHomeInvitation;
        [self.navigationController pushViewController:VC animated:YES];
    }
    
}

- (NSMutableArray *)dataArr {
    if (!_dataArr) {
        _dataArr = [[NSMutableArray alloc] init];
    }
    return _dataArr;
}

- (NSMutableArray *)inviteArr {
    if (!_inviteArr) {
        _inviteArr = [[NSMutableArray alloc] init];
    }
    return _inviteArr;
}

- (RYFTableView *)tableView{
    if (!_tableView) {
        _tableView = [[RYFTableView alloc] initWithFrame:CGRectZero style:UITableViewStyleGrouped];
        _tableView.tableViewDelegate = self;
        _tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
        _tableView.estimatedRowHeight = 64;
        _tableView.tableHeaderView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 15)];
        _tableView.backgroundColor = tableBgColor;
        [_tableView registerNib:[UINib nibWithNibName:@"FamailyNameCell" bundle:nil] forCellReuseIdentifier:@"FamailyNameCell"];
        [_tableView registerNib:[UINib nibWithNibName:@"FamailyMemberCell" bundle:nil] forCellReuseIdentifier:@"FamailyMemberCell"];
    }
    return _tableView;
}

#pragma mark - ThingSmartHomeManagerDelegate

// 添加一个家庭
- (void)homeManager:(ThingSmartHomeManager *)manager didAddHome:(ThingSmartHomeModel *)home {
    [self loadDataRefreshOrPull:1];
}

// 删除一个家庭
- (void)homeManager:(ThingSmartHomeManager *)manager didRemoveHome:(long long)homeId {
    [self loadDataRefreshOrPull:1];
}

// MQTT 连接成功
- (void)serviceConnectedSuccess {
    // 去云端查询当前家庭的详情，然后去刷新 UI
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

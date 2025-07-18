//
//  DeviceAddVC.m
//  AIToys
//
//  Created by qdkj on 2025/6/30.
//

#import "DeviceAddVC.h"
#import "ExitView.h"
#import "SelectWifiVC.h"

@interface DeviceAddVC ()<UITableViewDataSource,UITableViewDelegate,ThingSmartHomeDelegate,ThingSmartBLEWifiActivatorDelegate>
@property (weak, nonatomic) IBOutlet UILabel *titleLab;
@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property (weak, nonatomic) IBOutlet UIButton *doneBtn;
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (nonatomic, strong)NSTimer *timer;
@property (nonatomic, assign)CGFloat progress;
@property(strong, nonatomic) ThingSmartHome *home;
@property(copy, nonatomic) NSString *deviceId;
@property (nonatomic, strong) NSString *token;
@property (nonatomic, assign) BOOL ispwdError;//是否是wifi密码错误
@end

@implementation DeviceAddVC

- (void)viewDidLoad {
    [super viewDidLoad];
    self.fd_prefersNavigationBarHidden = YES;
    self.titleLab.text = LocalString(@"添加设备");
    [self.doneBtn setTitle:LocalString(@"完成") forState:0];
    self.tableView.tableHeaderView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 15)];
    self.tableView.sectionHeaderHeight = 0;
    self.tableView.sectionFooterHeight = 0;
    self.tableView.backgroundColor = UIColor.clearColor;
    [self.tableView registerNib:[UINib nibWithNibName:@"DeviceAddCell" bundle:nil] forCellReuseIdentifier:@"DeviceAddCell"];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(deviceConnectStart:) name:@"DeviceConnectStart" object:nil];
    [PublicObj makeButtonUnEnable:self.doneBtn];
    [self initHome];
    [self getToken];
    [ThingSmartBLEWifiActivator sharedInstance].bleWifiDelegate = self;
}

//初始化家庭
- (void)initHome {
    self.home = [ThingSmartHome homeWithHomeId:self.homeId];
    self.home.delegate = self;
}

//获取配网token
- (void)getToken {
    WEAK_SELF
    ThingSmartActivator *ezActivator = [[ThingSmartActivator alloc] init];
    [ezActivator getTokenWithHomeId:self.homeId success:^(NSString *token) {
        NSLog(@"getToken success: %@", token);
        weakSelf.token = token;
    } failure:^(NSError *error) {
        NSLog(@"getToken failure: %@", error.localizedDescription);
    }];
}

//开始配网
- (void)deviceConnectStart:(NSNotification *)noti {
    NSDictionary *dic = noti.object;
    NSString *uuid = dic[@"uuid"];
    NSString *ssid = dic[@"ssid"];
    NSString *pwd = dic[@"pwd"];
    [[ThingSmartBLEWifiActivator sharedInstance] pairDeviceWithUUID:uuid token:self.token ssid:ssid pwd:pwd timeout:120];
    [self setupTimer];
}

-(void)setupTimer{
    self.timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(updateProgress) userInfo:nil repeats:YES];
    self.status = AddStatusType_progress;
}

//更新进度条
- (void)updateProgress {
    if (self.progress < 0.9) {
        self.progress += 0.05;
    } else {
        self.progress = 0.9;
        [self.timer invalidate];
    }
    [self.tableView reloadData];
}


//完成
- (IBAction)doneBtnClick:(id)sender {
    [self exit:1];
}

//关闭
- (IBAction)closeBtnClick:(id)sender {
    [self exit:0];
}

//退出配网 1.完成配网
-(void)exit:(NSInteger)type{
    WEAK_SELF
    if(self.status == AddStatusType_success){
        //在配网结束后调用
        [[ThingSmartBLEWifiActivator sharedInstance] stopDiscover];
        [self.navigationController popToRootViewControllerAnimated:YES];
    }else{
        ExitView *view = [[ExitView alloc] initWithFrame:[UIScreen mainScreen].bounds];
        view.sureBlock = ^{
            //在配网结束后调用
            [[ThingSmartBLEWifiActivator sharedInstance] stopDiscover];
            [weakSelf.navigationController popToRootViewControllerAnimated:YES];
//            if(type == 1){
//                [weakSelf.navigationController popToRootViewControllerAnimated:YES];
//            }else{
//                [weakSelf.navigationController popViewControllerAnimated:YES];
//            }
        };
        [view show];
    }
    
}


#pragma mark -- UITableViewDataSource
-(NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    return 2;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return 1;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    WEAK_SELF
    if(indexPath.section == 0){
        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"Cell"];
           if (!cell) {
               cell = [[UITableViewCell alloc]initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"Cell"];
               UILabel *label = [[UILabel alloc]initWithFrame:CGRectMake(15, 0, kScreenWidth-30, 24)];
               label.textAlignment = NSTextAlignmentLeft;
               label.font = [UIFont systemFontOfSize:14];
               label.textColor = UIColorFromRGBA(000000, 0.7);
               label.tag = 100;
               [cell.contentView addSubview:label];
           }
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
        UILabel *titleLabel = (UILabel *)[cell.contentView viewWithTag:100];
        titleLabel.text = [NSString stringWithFormat:@"%d %@",self.status == AddStatusType_fail || self.status == AddStatusType_success ? 0 : 1, LocalString(@"个设备正在添加")];
        cell.backgroundColor = UIColor.clearColor;
        return cell;
    }else{
        DeviceAddCell *cell = [tableView dequeueReusableCellWithIdentifier:@"DeviceAddCell" forIndexPath:indexPath];
        cell.type = self.status;
        cell.progress = self.progress;
        [cell.imgView sd_setImageWithURL:[NSURL URLWithString:self.deviceDic[@"icon"]] placeholderImage:[UIImage imageNamed:@"icon_find_device.png"]];
        cell.nameLabel.text = self.deviceDic[@"name"];
        cell.addBlock = ^{
            SelectWifiVC *VC = [SelectWifiVC new];
            VC.UUID = weakSelf.deviceInfo.uuid;
            VC.homeId = weakSelf.homeId;
            MyNavigationController *nav = [[MyNavigationController alloc] initWithRootViewController:VC];
//            nav.modalPresentationStyle = UIModalPresentationFullScreen;
            [weakSelf presentViewController:nav animated:NO completion:nil];
//            [weakSelf setupTimer];
        };
        cell.editBlock = ^{
            [weakSelf showAlertWithTextField];
        };
        return cell;
    }
}

//修改设备名称
- (void)showAlertWithTextField {
    WEAK_SELF
    // 创建UIAlertController
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:LocalString(@"设备名称") message:@"" preferredStyle:UIAlertControllerStyleAlert];
    
    // 添加文本字段
    [alert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        // 配置文本字段
        textField.placeholder = LocalString(@"请输入名称");
        textField.text = self.deviceDic[@"name"];
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
        ThingSmartDevice *device = [ThingSmartDevice deviceWithDeviceId:self.deviceId];
       WEAK_SELF
        [device updateName:inputText success:^{
                NSLog(@"updateName success");
            [SVProgressHUD showSuccessWithStatus:@"updateName success"];
            NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:weakSelf.deviceDic];
            [dic setObject:inputText forKey:@"name"];
            weakSelf.deviceDic = dic;
            [weakSelf.tableView reloadData];
            } failure:^(NSError *error) {
                NSLog(@"updateName failure: %@", error);
            }];
        
    }]];
    
    // 添加“取消”按钮及其处理程序（可选）
    [alert addAction:[UIAlertAction actionWithTitle:LocalString(@"取消") style:UIAlertActionStyleCancel handler:^(UIAlertAction *action) {
        // 处理取消操作（如果有需要）
        NSLog(@"用户取消了输入");
    }]];
    
    // 显示对话框
    [self presentViewController:alert animated:YES completion:nil];
}

-(CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath{
    return indexPath.section == 0 ? 24 : 136;
}


#pragma mark -- UITableViewDelegate
- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {

}
#pragma mark - ThingSmartHomeDelegate
// 添加设备
- (void)home:(ThingSmartHome *)home didAddDeivice:(ThingSmartDeviceModel *)device {
    self.deviceId = device.devId;
}

#pragma mark -- ThingSmartBLEWifiActivatorDelegate
- (void)bleWifiActivator:(ThingSmartBLEWifiActivator *)activator didReceiveBLEWifiConfigDevice:(nullable ThingSmartDeviceModel *)deviceModel error:(nullable NSError *)error{
    if(!error){
        //配网成功
        self.status = AddStatusType_success;
        [PublicObj makeButtonEnable:self.doneBtn];
        //在配网结束后调用
        [[ThingSmartBLEWifiActivator sharedInstance] stopDiscover];
        
    }else{
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
        self.status = AddStatusType_fail;
//        if(error.code == 3 || error.code == 4){
//            //Wi-Fi 密码错误
//            [SVProgressHUD showErrorWithStatus:@"wifi密码错误，请重新输入"];
//            self.ispwdError = YES;
//        }else{
//            [[NSNotificationCenter defaultCenter] postNotificationName:@"DeviceConnectStatusChanged" object:@(AddStatusType_fail)];
//        }
        NSLog(@"配网失败");
    }
    [self.tableView reloadData];
    
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

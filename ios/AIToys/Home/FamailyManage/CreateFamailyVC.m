//
//  CreateFamailyVC.m
//  AIToys
//
//  Created by qdkj on 2025/6/23.
//

#import "CreateFamailyVC.h"
#import "Alert.h"

@interface CreateFamailyVC ()<CLLocationManagerDelegate>
@property (weak, nonatomic) IBOutlet UILabel *leftnameLabel;

@property (weak, nonatomic) IBOutlet UILabel *nameLabel;
@property (weak, nonatomic) IBOutlet UITextField *textField;
@property(strong, nonatomic) ThingSmartHomeManager *homeManager;
//@property(strong, nonatomic) CLLocationManager *locationManager;
//@property(assign, nonatomic) double longitude;
//@property(assign, nonatomic) double latitude;
//@property(copy, nonatomic) NSString *provinceName;
//@property(copy, nonatomic) NSString *cityName;
//@property(copy, nonatomic) NSString *currentCity;//当前城市
@end

@implementation CreateFamailyVC

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = LocalString(@"创建家庭");
    self.leftnameLabel.text = LocalString(@"家庭名称");
    self.textField.placeholder = LocalString(@"请输入名称");
    self.view.backgroundColor = tableBgColor;
    [self setRightBtn];
//    [self.locationManager requestWhenInUseAuthorization];
//    if ([CLLocationManager locationServicesEnabled]) {
//        self.locationManager.delegate = self;
//        self.locationManager.desiredAccuracy = kCLLocationAccuracyBest;
//        [self.locationManager startUpdatingHeading];
//    } else {
//        [Alert showBasicAlertOnVC:self withTitle:@"Cannot Access Location" message:@"Please make sure if the location access is enabled for the app."];
//    }
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

//确定
-(void)done{
    NSString *homeName = self.textField.text;
    if(homeName.length == 0){
        [SVProgressHUD showErrorWithStatus:LocalString(@"请输入名称")];
        return;
    }
    WEAK_SELF
    [self showHud];
    [self.homeManager addHomeWithName:homeName geoName:nil rooms:@[@"客厅"] latitude:0 longitude:0 success:^(long long result) {
        [weakSelf hiddenHud];
        [UIAlertController cs_alertControllerWithTitle:LocalString(@"创建家庭成功") message:@"" preferredStyle:UIAlertControllerStyleAlert cancleButtonTitle:LocalString(@"查看家庭") otherTitle:@[LocalString(@"确定")] controller:weakSelf actionBlock:^(UIAlertAction * _Nonnull action, NSInteger idx) {
            [weakSelf.navigationController popViewControllerAnimated:YES];
        }];
    } failure:^(NSError *error) {
        [weakSelf hiddenHud];
        [SVProgressHUD showErrorWithStatus:error.localizedDescription];
    }];
    
    
}
//-(void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations {
//    CLLocation *location = manager.location;
//    if (!location) {
//        return;
//    }
//    
//    self.longitude = location.coordinate.longitude;
//    self.latitude = location.coordinate.latitude;
//    self.cityName = location.description;
//    
//    CLLocation *currentLocation = [locations lastObject];
//    CLGeocoder *geoCoder = [[CLGeocoder alloc]init];
//    self.latitude = currentLocation.coordinate.latitude;
//    self.longitude = currentLocation.coordinate.longitude;
//    //打印当前的经度与纬度
//    
//    //反地理编码
//    [geoCoder reverseGeocodeLocation:currentLocation completionHandler:^(NSArray<CLPlacemark *> * _Nullable placemarks, NSError * _Nullable error) {
//        
//        if (placemarks.count > 0) {
//            CLPlacemark *placeMark = placemarks[0];
//            self.currentCity = placeMark.locality;
////            if (!self.currentCity) {
////                self.provinceName = placeMark.locality;
////                self.cityName = placeMark.administrativeArea;
////            }
////            
////            self.cityName = placeMark.locality;
////            self.provinceName = placeMark.administrativeArea;
////            [CoreArchive setStr:self.provinceName key:PROVINCENAME];
////            [CoreArchive setStr:self.cityName key:CITYNAME];
//        }
//    }];
//}


- (ThingSmartHomeManager *)homeManager {
    if (!_homeManager) {
        _homeManager = [[ThingSmartHomeManager alloc] init];
    }
    return _homeManager;
}

//- (CLLocationManager *)locationManager {
//    if (!_locationManager) {
//        _locationManager = [[CLLocationManager alloc] init];
//    }
//    return _locationManager;
//}
/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end

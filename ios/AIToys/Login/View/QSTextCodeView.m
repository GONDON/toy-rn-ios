//
//  QSTextCodeView.m
//  AIToys
//
//  Created by qdkj on 2025/6/19.
//

#import "QSTextCodeView.h"

@interface QSTextCodeView()<TextFieldDelegate>
@property (nonatomic, strong) NSMutableDictionary *dic;
@property (nonatomic, strong) NSMutableArray *textFieldArr;
@property (nonatomic, strong) NSString *text;
@property (nonatomic, assign) NSInteger fildTextLength;
@end

@implementation QSTextCodeView

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self)
    {
       
    }
    return self;
}
 
-(void)setFieldCount:(NSInteger)fieldCount
{
    _fieldCount = fieldCount;
    [self initUI];
}
 
-(void)initUI
{
    for (UIView *view in self.subviews)
    {
        [view removeFromSuperview];
    }
    _fildTextLength = 1;
    self.textFieldArr = [self addMenuButton:_fieldCount];
}
 
 
-(NSMutableArray *)addMenuButton:(NSInteger)count
{
    NSMutableArray *arrReturn = [NSMutableArray array];
    CGFloat screenW =  CGRectGetWidth(self.bounds);
    CGFloat space = 0;
    CGFloat x = 10;
    CGFloat y = 0;
    CGFloat w =  ( screenW - space * 2 - x * ( count + 1 ) ) /  count;
    CGFloat h = self.frame.size.height;
    //    CGFloat bigW = w * 2 + x ;
    CGFloat temp = 0;
    CGFloat newI = 0;
    CGFloat newW = 0;
    
    for (int i = 0;  i < count ; i++)
    {
        space += newW + x;
        newW = w;
        newI = i - temp;
        
        if (newI == 0)
        {
            space = x;
        }
        UITextFieldAddDel *textField = [[UITextFieldAddDel alloc]init];
        textField.backgroundColor = [UIColor colorWithRed:246/255.0 green:246/255.0 blue:246/255.0 alpha:1.0];
        textField.layer.cornerRadius = 8.0;
        textField.keyboardType = UIKeyboardTypeNumberPad;
//        textField.borderStyle = UITextBorderStyleLine;
        [textField addTarget:self action:@selector(valueChange:) forControlEvents:(UIControlEventEditingChanged)];
        textField.delDelegate = self;
        textField.frame = CGRectMake(space, y, newW, h);
        [textField setTextAlignment:(NSTextAlignmentCenter)];
        [self addSubview:textField];
        [arrReturn addObject:textField];
    }
    return arrReturn;
}
 
 
-(void)valueChange:(UITextField *)textfield
{
    // 当前输入框的下标
    NSInteger currentIndex = 0;
    for (NSInteger i = 0; i< self.textFieldArr.count; i++)
    {
        UITextField *fild = self.textFieldArr[i];
        if (fild == textfield)
        {
            currentIndex = i;
        }else{
            
        }
        
        // 以下标未key 输入框内容为value 做键对存储
        NSString *key = [NSString stringWithFormat:@"%zd",i];
        NSString *value ;
        
        if (fild.text.length > 0)
        {
            value = fild.text;
        }
        else
        {
            value = @" ";
        }
        
        [self.dic setValue:value forKey:key];
    }
    
    
    // 判断输入内容 如果当前输入框内容为空用空格代替 更新对应的字典
    NSString *key = [NSString stringWithFormat:@"%zd",currentIndex];
    
    if (textfield.text.length > 0)
    {
        if (textfield.text.length > _fildTextLength)
        {
            NSRange range = NSMakeRange(textfield.text.length - _fildTextLength, _fildTextLength);
            textfield.text = [textfield.text substringWithRange:range];
        }
        [self.dic setObject:textfield.text forKey:key];
    }
    else
    {
        [self.dic setObject:@" " forKey:key];
    }
    
    // 从字典中取数所有的输入框内容
    NSString *strAll = [NSString string];
    for (NSInteger i = 0; i< self.textFieldArr.count; i++)
    {
        NSString *key = [NSString stringWithFormat:@"%zd",i];
        NSString *value = [_dic valueForKey:key];
        strAll = [strAll stringByAppendingString:value];
    }
    
    self.text = strAll;
    // 更新当前需要编辑的输入框
    UITextField *fild;
    if ( currentIndex + 1 > self.textFieldArr.count -1 )
    {
        fild = self.textFieldArr.lastObject;
    }
    else
    {
        if (self.text.length > strAll.length)
        {
            if (currentIndex >= self.textFieldArr.count-1)
            {
                fild  = self.textFieldArr[currentIndex];
            }
            else
            {
                fild  = self.textFieldArr[currentIndex+1];
            }
        }
        else
        {
            if (currentIndex < 0)
            {
                fild  = self.textFieldArr[0];
            }
            else
            {
                fild  = self.textFieldArr[currentIndex+1];
            }
        }
    }
    fild.userInteractionEnabled = YES;
    [fild becomeFirstResponder];
    
    for (UITextField *obj in self.textFieldArr) {
        if(![obj isEqual:fild]){
            obj.userInteractionEnabled = NO;
        }
        
    }
    
    if (self.resultBlock)
    {
        NSArray *arr = [_dic allValues];
        BOOL isOK = [arr containsObject:@" "];
        
        isOK = !isOK;
        
        self.resultBlock(self.text,self.dic,isOK);
    }
}
 
- (void)textFieldDelete:(UITextFieldAddDel *)textField
{
    NSLog(@"删除 = %@",textField.text);
    // 找到当前编辑的输入框的下标
    NSInteger currentIndex = 0;
    for (int i = 0;  i < self.textFieldArr.count; i++)
    {
        UITextFieldAddDel *fild = self.textFieldArr[i];
        NSLog(@"第%d个输入框文字 = %@",i,fild.text);
        if (fild == textField)
        {
            currentIndex = i;
            break;
        }
    }
    if (textField.text.length == 0)
    {
        if (currentIndex <= 0)
        {
            UITextFieldAddDel *fild = self.textFieldArr.firstObject;
            fild.userInteractionEnabled = YES;
            [fild becomeFirstResponder];
            currentIndex = 0;
        }else{
            if(currentIndex != self.text.length-1){
                UITextFieldAddDel *fild = self.textFieldArr[currentIndex-1];
                fild.text = @"";
                fild.userInteractionEnabled = YES;
                [fild becomeFirstResponder];
                currentIndex --;
            }
        }
    }
   
    for (NSInteger i = 0; i< self.textFieldArr.count; i++)
    {
        UITextField *fild = self.textFieldArr[i];
       
        
        fild.userInteractionEnabled = i==currentIndex;
        // 以下标未key 输入框内容为value 做键对存储
        NSString *key = [NSString stringWithFormat:@"%zd",i];
        NSString *value ;
        
        if (fild.text.length > 0)
        {
            value = fild.text;
        }
        else
        {
            value = @" ";
        }
        
        [self.dic setValue:value forKey:key];
    }
    
    // 判断输入内容 如果当前输入框内容为空用空格代替 更新对应的字典
    NSString *key = [NSString stringWithFormat:@"%zd",currentIndex];
    
    if (textField.text.length > 0)
    {
        if (textField.text.length > _fildTextLength)
        {
            NSRange range = NSMakeRange(textField.text.length - _fildTextLength, _fildTextLength);
            textField.text = [textField.text substringWithRange:range];
        }
        [self.dic setObject:textField.text forKey:key];
        textField.userInteractionEnabled = NO;
    }
    else
    {
        [self.dic setObject:@" " forKey:key];
        
    }
    
    // 从字典中取数所有的输入框内容
    NSString *strAll = [NSString string];
    for (NSInteger i = 0; i< self.textFieldArr.count; i++)
    {
        NSString *key = [NSString stringWithFormat:@"%zd",i];
        NSString *value = [_dic valueForKey:key];
        if(![value isEqualToString:@" "]){
            strAll = [strAll stringByAppendingString:value];
        }
        
    }
    self.text = strAll;
    if (self.resultBlock)
    {
        NSArray *arr = [_dic allValues];
        BOOL isOK = [arr containsObject:@" "];
        isOK = !isOK;
        self.resultBlock(self.text,self.dic,isOK);
 
    }
}
 
-(NSMutableDictionary *)dic{
    if (!_dic)
    {
        _dic = [NSMutableDictionary dictionary];
    }
    return _dic;
}
 
-(NSString *)text{
    if (!_text) {
        _text = [NSString string];
    }
    return _text;
}
 
 
@end
 
 
@implementation UITextFieldAddDel
 
/*
 // Only override drawRect: if you perform custom drawing.
 // An empty implementation adversely affects performance during animation.
 - (void)drawRect:(CGRect)rect {
 // Drawing code
 }
 */
- (void)deleteBackward {
    [super deleteBackward];
    
    //    ！！！这里要调用super方法，要不然删不了东西
    if ([self.delDelegate respondsToSelector:@selector(textFieldDelete:)])
    {
        [self.delDelegate textFieldDelete:self];
    }
    
}

@end

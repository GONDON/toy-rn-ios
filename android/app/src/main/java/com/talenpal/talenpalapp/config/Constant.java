package com.talenpal.talenpalapp.config;

import android.os.Environment;

import java.io.File;

/**
 * 路径配置文件
 */
public class Constant {

    // 网络请求code码
    public static final int CODE_SUCCESS = 0;// 成功
    public static final int CODE_EXPIRE = 401;//过期

    public static final String THING_SMART_APPKEY = "x3guaxmgxdumwnxawaja";//涂鸦appkey
    public static final String THING_SMART_SECRET = "4c99g5fgva3xgwhvnt8ekgx9kpnmuf8v";// 涂鸦appsecret

    public static final String CountryCode = "1";

    public static final Long COUNT_DOWN_INTERVAL = 1000L;//倒计时间隔 1s
    public static final Long VERIFICATION_TIME_OUT = 60L * 1000;//验证码超时时间 60s

    public static final Integer SEND_TYPE_REGISTER = 1;//注册
    public static final Integer SEND_TYPE_LOGIN = 2;//登录
    public static final Integer SEND_TYPE_FORGET = 3;//忘记密码

}
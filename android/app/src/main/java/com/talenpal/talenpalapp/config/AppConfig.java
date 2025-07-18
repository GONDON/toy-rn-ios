package com.talenpal.talenpalapp.config;

import android.text.TextUtils;

import com.alibaba.fastjson.JSON;
import com.talenpal.talenpalapp.util.SharedPreferencesUtil;
import com.thingclips.smart.android.user.bean.User;

public class AppConfig {
    public static void setFirstInstall(boolean isFirst){
        SharedPreferencesUtil.setBoolean("isFirstInstall",isFirst);
    }
    public static boolean isFirstInstall(){
        return SharedPreferencesUtil.getBoolean("isFirstInstall");
    }
    public static void setToken(String token){
        SharedPreferencesUtil.setString("sass_token",token);
    }
    public static String getToken(){
        return SharedPreferencesUtil.getString("sass_token");
    }

    public static void setUserNameTemp(String userName){
        SharedPreferencesUtil.setString("userName_temp",userName);
    }
    public static String getUserNameTemp(){
        return SharedPreferencesUtil.getString("userName_temp");
    }
    public static void setPasswordTemp(String password){
        SharedPreferencesUtil.setString("password_temp",password);
    }

    public static String getPasswordTemp(){
        return SharedPreferencesUtil.getString("password_temp");
    }

    public static User getUser(){
        return JSON.parseObject(SharedPreferencesUtil.getString("user"),User.class);
    }
    public static void saveUser(User user){
        SharedPreferencesUtil.setString("user", JSON.toJSONString(user));
        if(user == null){
            //退出操作
            setCurrentHomeId( 0L);
        }
    }

    public static boolean isLogin(){
        User user = getUser();
        return user != null && user.getUid() != null && !TextUtils.isEmpty(getToken());
    }

    public static void setIsFirstPermissionDenied(int permission,boolean isFirst){
        SharedPreferencesUtil.setBoolean(permission+"Permission",isFirst);
    }
    public static boolean isFirstPermissionDenied(int permission){
        return !SharedPreferencesUtil.getBoolean(permission+"Permission");
    }

    public static void setCurrentHomeId(Long homeId){
        SharedPreferencesUtil.setLong("currentHomeId",homeId);
    }
    public static Long getCurrentHomeId(){
        return SharedPreferencesUtil.getLong("currentHomeId");
    }
}

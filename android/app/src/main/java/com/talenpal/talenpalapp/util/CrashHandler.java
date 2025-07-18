package com.talenpal.talenpalapp.util;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Build;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;
import android.widget.Toast;

import java.lang.Thread.UncaughtExceptionHandler;
import java.util.HashMap;
import java.util.Map;

/**
 * 异常信息收集，报错crash日志
 */
public class CrashHandler implements UncaughtExceptionHandler {

    public static String TAG = "CrashHandler";
    private UncaughtExceptionHandler mDefaultHandler;// 系统默认的UncaughtException处理类
    private static CrashHandler instance = null;
    private Context mContext;
    private Map<String, String> infos = new HashMap<>();// 用来存储设备信息和异常信息

    public static CrashHandler getInstance() {
        if (instance == null) {
            synchronized (CrashHandler.class) {
                if (instance == null) {
                    instance = new CrashHandler();
                }
            }
        }
        return instance;
    }

    //初始化
    public void init(Context context) {
        mContext = context;
        // 获取系统默认的UncaughtException处理器
        mDefaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        // 设置该CrashHandler为程序的默认处理器
        Thread.setDefaultUncaughtExceptionHandler(this);
    }

    @Override
    public void uncaughtException(Thread thread, Throwable ex) {
        Log.e(TAG, "ex:" + ex.toString());
        if (!handleException(ex) && mDefaultHandler != null) {
            // 如果用户没有处理则让系统默认的异常处理器来处理
            mDefaultHandler.uncaughtException(thread, ex);
        } else {
            Log.e(TAG,"程序出现了异常,即将重启");
            SystemClock.sleep( 1000);
//            SystemUtil.pullingUpApp();//app重启
        }
    }

    //自定义异常处理，收集 崩溃日志，如果处理了异常崩溃信息放回true，否则返回false；
    private boolean handleException(final Throwable ex) {
        if (ex == null)
            return false;
        try {
            // 使用Toast来显示异常信息
            new Thread() {
                @Override
                public void run() {
                    Looper.prepare();
                    Toast.makeText(mContext, "很抱歉,程序出现异常,即将重启.",
                            Toast.LENGTH_LONG).show();
                    Looper.loop();
                }
            }.start();
            // 收集设备参数信息
            collectDeviceInfo(mContext);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return true;
    }

    //收集设备参数信息
    public void collectDeviceInfo(Context ctx) {
        try {
            PackageManager pm = ctx.getPackageManager();
            PackageInfo pi = pm.getPackageInfo(ctx.getPackageName(),
                    PackageManager.GET_ACTIVITIES);
            if (pi != null) {
                String versionName = pi.versionName + "";
                infos.put("versionName", versionName);
//                infos.put("deviceCode", TalenpalApplication.DEVICE_ID);
            }
            String version_sdk = Build.VERSION.SDK;
            infos.put("sdk_version", version_sdk);
            String version_release = Build.VERSION.RELEASE;
            infos.put("release_version", version_release);
        } catch (NameNotFoundException e) {
            Log.e(TAG, "an ErrorHandler occured when collect package info", e);
        }
    }

}
package com.talenpal.talenpalapp.broadcast;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.talenpal.talenpalapp.util.SystemUtil;

/**
 * Created by Administrator on 2018/12/30.
 */
public class UpdateReceiver extends BroadcastReceiver {

    private static final String TAG = UpdateReceiver.class.getSimpleName();

    @Override
    public void onReceive(Context context, Intent intent) {
        String packageName = intent.getDataString();
        if (intent.getAction().equals(Intent.ACTION_PACKAGE_REPLACED)) {//接收升级广播
            Log.e(TAG, "onReceive:升级了一个安装包，重新启动此程序");
            if (packageName.equals("package:" + SystemUtil.getPackageName())) {
                //SystemUtil.reBootDevice();//升级完自身app,重启自身
            }
        } else if (intent.getAction().equals(Intent.ACTION_PACKAGE_ADDED)) {//接收安装广播
            Log.e(TAG, "onReceive:安装了" + packageName);
            if (packageName.equals("package:" + SystemUtil.getPackageName())) {
                //SystemUtil.reBootDevice();
            }
        } else if (intent.getAction().equals(Intent.ACTION_PACKAGE_REMOVED)) { //接收卸载广播
            Log.e(TAG, "onReceive:卸载了" + packageName);
        }
    }
}
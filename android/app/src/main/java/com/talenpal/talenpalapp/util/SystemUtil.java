package com.talenpal.talenpalapp.util;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.telephony.TelephonyManager;

import com.talenpal.talenpalapp.app.TalenpalApplication;
import com.talenpal.talenpalapp.manager.ActManager;

import java.io.DataOutputStream;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.UUID;

public class SystemUtil {

    /**
     * 获取当前手机系统语言。
     *
     * @return 返回当前系统语言。例如：当前设置的是“中文-中国”，则返回“zh-CN”
     */
    public static String getSystemLanguage() {
        return Locale.getDefault().getLanguage();
    }

    /**
     * 获取当前系统上的语言列表(Locale列表)
     *
     * @return 语言列表
     */
    public static Locale[] getSystemLanguageList() {
        return Locale.getAvailableLocales();
    }

    /**
     * 获取当前手机系统版本号
     *
     * @return 系统版本号
     */
    public static String getSystemVersion() {
        return Build.VERSION.RELEASE;
    }

    /**
     * 获取手机型号
     *
     * @return 手机型号
     */
    public static String getSystemModel() {
        return Build.MODEL;
    }

    /**
     * 获取手机厂商
     *
     * @return 手机厂商
     */
    public static String getDeviceBrand() {
        return Build.BRAND;
    }

    /**
     * 获取手机序列号
     *
     * @return 手机序列号
     */
    public static String getSerialNumber() {
        String serial = null;
        try {
            Class<?> c = Class.forName("android.os.SystemProperties");
            Method get = c.getMethod("get", String.class);
            serial = (String) get.invoke(c, "ro.serialno");
        } catch (Exception e) {
            e.printStackTrace();
        }
        return serial;
    }

    /**
     * 获取手机IMEI(需要“android.permission.READ_PHONE_STATE”权限)
     *
     * @return 手机IMEI
     */
    @SuppressLint("MissingPermission")
    public static String getIMEI(Context ctx) {
        TelephonyManager tm = (TelephonyManager) ctx.getSystemService(Activity.TELEPHONY_SERVICE);
        if (tm != null) {
            return tm.getDeviceId();
        }
        return null;
    }

    /**
     * 版本名
     */
    public static String getVersionName() {
        return getPackageInfo().versionName;
    }

    /**
     * 版本号
     */
    public static int getVersionCode() {
        return getPackageInfo().versionCode;
    }

    /**
     * 获取应用程序名称
     */
    public static String getPackageName() {
        return getPackageInfo().packageName;
    }

    /**
     * 获取应用程序名称
     */
    public static String getAppName() {
        return TalenpalApplication.context.getResources()
                .getString(getPackageInfo().applicationInfo.labelRes);
    }

    /**
     * 获取包名
     */
    private static PackageInfo getPackageInfo() {
        PackageInfo pi = null;
        try {
            PackageManager pm = TalenpalApplication.context.getPackageManager();
            pi = pm.getPackageInfo(TalenpalApplication.context.getPackageName(),
                    PackageManager.GET_CONFIGURATIONS);
            return pi;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return pi;
    }

    /**
     * 系统重启
     */
    public static void reBootDevice() {
        try {
            createSuProcess("reboot").waitFor();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 设备关机
     */
    public static void shountDown() {
        try {
            createSuProcess("reboot -p").waitFor();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 重启设备只需要 createSuProcess("reboot").waitFor();
     */
    public static Process createSuProcess(String cmd) throws IOException {
        DataOutputStream os = null;
        Process process = createSuProcess();
        try {
            os = new DataOutputStream(process.getOutputStream());
            os.writeBytes(cmd + "\n");
            os.writeBytes("exit $?\n");
        } finally {
            if (os != null) {
                try {
                    os.close();
                } catch (IOException e) {
                }
            }
        }
        return process;
    }

    public static Process createSuProcess() throws IOException {
        File rootUser = new File("/system/xbin/ru");
        if (rootUser.exists()) {
            return Runtime.getRuntime().exec(rootUser.getAbsolutePath());
        } else {
            return Runtime.getRuntime().exec("su");
        }
    }

    /**
     * App自动重新启动
     */
    public static void restartApp() {
        /**
         * App退出
         */
        ActManager.getAppManager().finishAllActivity();
        ActManager.getAppManager().AppExit(TalenpalApplication.context);

        ActivityManager am = (ActivityManager) TalenpalApplication.context.getSystemService(TalenpalApplication.context.ACTIVITY_SERVICE);
        am.restartPackage("com.talenpal.talenpalapp");
    }

    /**
     * 拉起App
     */
    public static void pullingUpApp(){
        Intent intent = TalenpalApplication.context.getPackageManager().getLaunchIntentForPackage(getPackageName());
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        TalenpalApplication.context.startActivity(intent);
        System.exit(0);
    }

    /**
     * 获取设备唯一id
     *
     * @return
     */
    public static String getDeviceOnlyId() {
        return makeMD5(getUniquePsuedoID());
    }

    //获取设备识别号
    public static String getUniquePsuedoID() {
        String serial = null;  // 35是IMEI开头的号
        String m_szDevIDShort = "35" + Build.BOARD.length() % 10 + Build.BRAND.length() % 10 +
                Build.CPU_ABI.length() % 10 + Build.DEVICE.length() % 10 +
                Build.DISPLAY.length() % 10 + Build.HOST.length() % 10 + Build.ID.length() % 10 + Build.MANUFACTURER.length() % 10 +
                Build.MODEL.length() % 10 + Build.PRODUCT.length() % 10 + Build.TAGS.length() % 10 + Build.TYPE.length() % 10 +
                Build.USER.length() % 10; //13 位
        try {
            serial = Build.class.getField("SERIAL").get(null).toString();
            // API>=9 使用serial号

            return new UUID(m_szDevIDShort.hashCode(), serial.hashCode()).toString();

        } catch (Exception exception) {
            // serial需要一个初始化       serial = "serial"; // 随便一个初始化
        }
        // 使用硬件信息拼凑出来的15位号码
        return new UUID(m_szDevIDShort.hashCode(), serial.hashCode()).toString();

    }

    // MD5加密
    public static String makeMD5(String password) {
        try {
            // 生成一个MD5加密计算摘要
            MessageDigest md = MessageDigest.getInstance("MD5");
            // 计算md5函数
            md.update(password.getBytes());
            // digest()最后确定返回md5 hash值，返回值为8为字符串。因为md5 hash值是16位的hex值，实际上就是8位的字符
            // BigInteger函数则将8位的字符串转换成16位hex值，用字符串来表示；得到字符串形式的hash值
            return new BigInteger(1, md.digest()).toString(16);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return password;
    }

    /**
     * 判断是否有网络
     * @param context
     * @return
     */
    public static boolean isNetworkAvailable(Context context) {
        ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (connectivityManager != null) {
            NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
            return activeNetworkInfo != null && activeNetworkInfo.isConnected();
        }
        return false;
    }

}
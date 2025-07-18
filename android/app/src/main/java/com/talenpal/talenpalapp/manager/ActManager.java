package com.talenpal.talenpalapp.manager;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;


import com.talenpal.talenpalapp.http.util.HttpUtils;

import java.util.Iterator;
import java.util.Stack;

/**
 * author cowards
 * created on 2018\10\17 0017
 **/
public class ActManager {
    private static Stack<Activity> activityStack;
    private static ActManager instance = null;

    private ActManager() {
    }

    /**
     * 单一实例
     */
    public static ActManager getAppManager() {
        if (instance == null) {
            synchronized (ActManager.class) {
                if (instance == null) {
                    instance = new ActManager();
                }
            }
        }
        return instance;
    }

    /**
     * 添加Activity到堆栈
     */
    public void addActivity(Activity activity) {
        if (activityStack == null) {
            activityStack = new Stack<Activity>();
        }
        activityStack.add(activity);
    }

    /**
     * 获取当前Activity（堆栈中最后一个压入的）
     */
    public Activity currentActivity() {
        Activity activity = activityStack.lastElement();
        return activity;
    }

    /**
     * 结束当前Activity（堆栈中最后一个压入的）
     */
    public void finishActivity() {
        Activity activity = activityStack.lastElement();
        if (activity != null) {
            activity.finish();
            activity = null;
        }
    }

    /**
     * 结束指定的Activity
     */
    public void finishActivity(Activity activity) {
        if (activity != null) {
            activityStack.remove(activity);
            activity.finish();
            activity = null;
        }
    }

    /**
     * 结束指定类名的Activity
     */
    public void finishActivity(Class<?> cls) {
        for (Activity activity : activityStack) {
            if (activity.getClass().equals(cls)) {
                finishActivity(activity);
            }
        }
    }

    /**
     * 结束所有Activity
     */
    public void finishAllActivity() {
        if (activityStack == null) {
            return;
        }
        if (activityStack.size() < 1) {
            return;
        }
        for (int i = 0, size = activityStack.size(); i < size; i++) {
            if (null != activityStack.get(i)) {
                activityStack.get(i).finish();
            }
        }
        HttpUtils.getInstance().onDestory();
        activityStack.clear();
    }


    /**
     * 关闭除了指定activity以外的全部activity 如果cls不存在于栈中，则栈全部清空
     *
     * @param cls
     */
    public void finishOthersActivity(Class<?> cls) {
        while (activityStack != null && activityStack.size() > 0) {
            Activity activity = activityStack.lastElement();
            if (!(activity.getClass().equals(cls))) {
                finishActivity(activity);
            }
        }
    }

    /**
     * 结束指定的某些activity
     *
     * @param clss
     */
    public void finishActivtys(Class<?>... clss) {
        if (clss == null) return;
        for (Class<?> clz : clss) {
            finishActivity(clz);
        }
    }

    /**
     * 清除 activityStack 中除了指定 Class 以外的所有 Activity
     * @param targetClass
     */

    public void clearAllExcept(Class<?>... targetClass) {
        if (targetClass == null) return;
        Iterator<Activity> iterator = activityStack.iterator();
        while (iterator.hasNext()) {
            Activity activity = iterator.next();
            if(!isActivityOfType(activity, targetClass)){
                iterator.remove(); // 移除不匹配的 Activity
                activity.finish(); // 结束被移除的 Activity
            }
        }
    }

    // 判断某个 Activity 是否属于指定的 Class 类型之一
    private static boolean isActivityOfType(Activity activity, Class<?>... targetClasses) {
        for (Class<?> targetClass : targetClasses) {
            if (targetClass.isInstance(activity)) {
                return true; // 如果匹配返回 true
            }
        }
        return false; // 没有匹配返回 false
    }

    // 判断 activityStack 中是否包含某个 Activity
    public boolean containsActivity(Class<?> cls) {
        if (cls == null) return false;

        for (Activity activity : activityStack) {
            if(activity.getClass().equals(cls)){
                return true; // 找到匹配的 Activity
            }
        }
        return false;
    }

    /**
     * 退出应用程序
     */
    public void AppExit(Context context) {
        try {
            finishAllActivity();
            ActivityManager activityMgr = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
            activityMgr.restartPackage(context.getPackageName());
            System.exit(0);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
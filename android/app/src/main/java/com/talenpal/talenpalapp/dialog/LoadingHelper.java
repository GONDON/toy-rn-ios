package com.talenpal.talenpalapp.dialog;

import android.app.Activity;
import android.app.Dialog;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageView;

import com.bumptech.glide.Glide;
import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.manager.ActManager;


public class LoadingHelper {
    // 静态实例（volatile 保证可见性）
    private static volatile LoadingHelper instance;
    private Dialog progressDialog;

    // 私有构造方法
    private LoadingHelper() {}

    // 双重检查锁定实现单例
    public static LoadingHelper getInstance() {
        if (instance == null) {
            synchronized (LoadingHelper.class) {
                if (instance == null) {
                    instance = new LoadingHelper();
                }
            }
        }
        return instance;
    }

    // 显示加载动画
    public void showLoading() {
        if (progressDialog != null && progressDialog.isShowing()) {
            return;
        }
        Activity currentActivity = ActManager.getAppManager().currentActivity();
        if(currentActivity == null || currentActivity.isFinishing())return;
        // 创建对话框
        progressDialog = new Dialog(currentActivity,R.style.dialog);
        View view = LayoutInflater.from(currentActivity).inflate(R.layout.dialog_loading, null,false);
        ImageView ivGif = view.findViewById(R.id.iv_gif);
        Glide.with(currentActivity).asGif().load(R.mipmap.gif_lodding).into(ivGif);
        progressDialog.setContentView(view);

        progressDialog.setCanceledOnTouchOutside(false);
        Window window = progressDialog.getWindow();
        // 移除背后的遮罩效果
        window.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        window.setGravity(Gravity.CENTER);

        WindowManager.LayoutParams params = window.getAttributes();
        params.width = WindowManager.LayoutParams.WRAP_CONTENT;
        params.height = WindowManager.LayoutParams.WRAP_CONTENT;
        window.setBackgroundDrawableResource(android.R.color.transparent);
        window.setAttributes(params);

        progressDialog.show();
    }

    // 隐藏加载动画
    public void hideLoading() {
        if (progressDialog != null && progressDialog.isShowing()) {
            progressDialog.dismiss();
            progressDialog = null;
        }
    }
}

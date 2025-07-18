package com.talenpal.talenpalapp.util;

import android.content.Context;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.app.TalenpalApplication;

/**
 * author cowards
 * created on 2019\1\24 0024
 **/
public class ToastUtil {
    public static void showToast(String showStr){
        showCenterToast(showStr);
    }

    public static void showCenterToast(String showStr){
        if(TextUtils.isEmpty(showStr))return;

        Toast toast = new Toast(TalenpalApplication.context);
        toast.setGravity(Gravity.CENTER,0,0);
        toast.setDuration(Toast.LENGTH_SHORT);
        View view = LayoutInflater.from(TalenpalApplication.context).inflate( R.layout.custom_toast, null);
//        view.setBackgroundColor(Color.parseColor("#4D000000"));
        TextView tvToast = view.findViewById(R.id.tv_toast);
        tvToast.setText(showStr);
        toast.setView(view);
        toast.show();
    }

    public static void showBottomToast(String showStr){
        if(TextUtils.isEmpty(showStr))return;
        Toast toast = Toast.makeText(TalenpalApplication.context, showStr, Toast.LENGTH_SHORT);
        toast.show();
    }

}
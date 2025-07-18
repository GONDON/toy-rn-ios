package com.talenpal.talenpalapp.dialog;

import android.content.Context;
import android.view.View;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;

import com.lxj.xpopup.core.BottomPopupView;
import com.talenpal.talenpalapp.R;

public class WifiPermissionPopup extends BottomPopupView {
    private boolean isOpen = false;
    private boolean isPermission;
    private LinearLayout llSetOpen;
    private OnWifiPermissionListener listener;
    private boolean isInitView = false;
    private LinearLayout llPermissionYes;
    private LinearLayout llPermissionNo;
    private LinearLayout llSetYes;
    public void setWifiOpenAndPermission(boolean open,boolean isPermission) {
        isOpen = open;
        this.isPermission = isPermission;
        showView();
    }

    public void setOnWifiPermissionListener(OnWifiPermissionListener listener) {
        this.listener = listener;
    }

    public WifiPermissionPopup(@NonNull Context context) {
        super(context);
    }

    @Override
    protected int getImplLayoutId() {
        return R.layout.popup_wifi_permission;
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        this.isInitView = true;
        llSetOpen = findViewById(R.id.ll_set_open);
        llSetYes = findViewById(R.id.ll_set_yes);
        llPermissionYes = findViewById(R.id.ll_permission_yes);
        llPermissionNo = findViewById(R.id.ll_permission_no);
        findViewById(R.id.iv_close).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
            }
        });
        llPermissionNo.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                if (listener != null) {
                    listener.requestPermission();
                }
            }
        });
        llSetOpen.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                if(listener != null){
                    listener.goToSetting();
                }
            }
        });

        showView();
    }

    private void showView(){
        if(!isInitView)return;

        if (isPermission) {
            llPermissionYes.setVisibility(View.VISIBLE);
            llPermissionNo.setVisibility(View.GONE);
        } else {
            llPermissionYes.setVisibility(View.GONE);
            llPermissionNo.setVisibility(View.VISIBLE);
        }

        if(isOpen){
            llSetOpen.setVisibility(View.GONE);
            llSetYes.setVisibility(View.VISIBLE);
        }else{
            llSetOpen.setVisibility(View.VISIBLE);
            llSetYes.setVisibility(View.GONE);
        }
        if(isOpen && isPermission){
            dismiss();
        }
    }
    public interface OnWifiPermissionListener{
        void requestPermission();
        void goToSetting();
    }
}

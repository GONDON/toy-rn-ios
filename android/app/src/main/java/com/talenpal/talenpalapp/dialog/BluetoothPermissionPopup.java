package com.talenpal.talenpalapp.dialog;

import android.content.Context;
import android.util.Log;
import android.view.View;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;

import com.lxj.xpopup.core.BottomPopupView;
import com.talenpal.talenpalapp.R;

public class BluetoothPermissionPopup extends BottomPopupView {
    private boolean isOpen;
    private boolean isPermission;
    private LinearLayout llPermissionYes;
    private LinearLayout llPermissionNo;
    private LinearLayout llSetYes;
    private LinearLayout llSetNo;
    private OnBluetoothPermissionListener listener;
    private boolean isInitView = false;

    public BluetoothPermissionPopup(@NonNull Context context) {
        super(context);
    }

    public void setBluetoothOpenAndPermission(boolean isOpen, boolean isPermission) {
        this.isPermission = isPermission;
        this.isOpen = isOpen;
        showView();
    }

    public void setBluetoothPermissionListener(OnBluetoothPermissionListener listener) {
        this.listener = listener;
    }

    @Override
    protected int getImplLayoutId() {
        return R.layout.popup_bluetooth_permission;
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        isInitView = true;
        llPermissionYes = findViewById(R.id.ll_permission_yes);
        llPermissionNo = findViewById(R.id.ll_permission_no);
        llSetYes = findViewById(R.id.ll_set_yes);
        llSetNo = findViewById(R.id.ll_set_no);
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

        llSetNo.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                if (listener != null) {
                    listener.goToSetting();
                }
            }
        });

        showView();
    }

    public void showView() {
        if (!isInitView) return;
        if (isPermission) {
            llPermissionYes.setVisibility(View.VISIBLE);
            llPermissionNo.setVisibility(View.GONE);
        } else {
            llPermissionYes.setVisibility(View.GONE);
            llPermissionNo.setVisibility(View.VISIBLE);
        }

        if (isOpen) {
            llSetYes.setVisibility(View.VISIBLE);
            llSetNo.setVisibility(View.GONE);
        } else {
            if(isPermission) {
                llSetYes.setVisibility(View.GONE);
                llSetNo.setVisibility(View.VISIBLE);
            }else{
                llSetYes.setVisibility(View.GONE);
                llSetNo.setVisibility(View.GONE);
            }
        }
        if(isOpen && isPermission){
            dismiss();
        }
    }

    public interface OnBluetoothPermissionListener {
        void requestPermission();

        void goToSetting();
    }
}

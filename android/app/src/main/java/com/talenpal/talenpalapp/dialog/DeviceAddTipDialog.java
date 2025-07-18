package com.talenpal.talenpalapp.dialog;

import android.content.Context;
import android.view.View;

import androidx.annotation.NonNull;

import com.lxj.xpopup.core.CenterPopupView;
import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.listener.OnSingleClickListener;

public class DeviceAddTipDialog extends CenterPopupView {
    private OnDeviceAddTipDialogListener onListener;
    public DeviceAddTipDialog(@NonNull Context context,OnDeviceAddTipDialogListener  listener) {
        super(context);
        this.onListener = listener;
    }

    @Override
    protected int getImplLayoutId() {
        return R.layout.dialog_device_add_tip;
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        findViewById(R.id.rl_close).setOnClickListener(new OnSingleClickListener() {
            @Override
            public void onSingleClick(View v) {
                dismiss();
            }
        });
        findViewById(R.id.btn_continue_add).setOnClickListener(new OnSingleClickListener() {
            @Override
            public void onSingleClick(View v) {
                dismiss();
                if(onListener != null){
                    onListener.onContinueAdd();
                }
            }
        });
        findViewById(R.id.btn_back).setOnClickListener(new OnSingleClickListener() {
            @Override
            public void onSingleClick(View v) {
                dismiss();
                if(onListener != null){
                    onListener.onBack();
                }
            }
        });
    }

    public interface OnDeviceAddTipDialogListener{
        void onContinueAdd();
        void onBack();
    }
}

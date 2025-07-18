package com.talenpal.talenpalapp.dialog;

import android.content.Context;
import android.content.Intent;

import androidx.annotation.NonNull;

import com.lxj.xpopup.core.BubbleAttachPopupView;
import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.config.AppConfig;
import com.talenpal.talenpalapp.ui.device.DeviceDistributionNetworkActivity;
import com.talenpal.talenpalapp.util.ToastUtil;


public class HomeAttachPopup extends BubbleAttachPopupView {
    private HomeAttachPopupListener mListener;

    public HomeAttachPopup(@NonNull Context context) {
        super(context);
        setBubbleBgColor(0x00000000);
    }

    public void setmListener(HomeAttachPopupListener mListener) {
        this.mListener = mListener;
    }

    @Override
    protected int getImplLayoutId() {
        return R.layout.home_attach_popup;
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        findViewById(R.id.tv_add_story_machine).setOnClickListener(v -> {
            dismiss();
            if (AppConfig.getCurrentHomeId() <= 0) {
                ToastUtil.showToast("请先创建家庭");
                return;
            }
            getContext().startActivity(new Intent(getContext(), DeviceDistributionNetworkActivity.class));

        });
        findViewById(R.id.tv_family_management).setOnClickListener(v -> {
            dismiss();
            if(mListener != null){
                mListener.onFamilyManagement();
            }
        });
    }

    public interface HomeAttachPopupListener {
        void onFamilyManagement();
    }
}

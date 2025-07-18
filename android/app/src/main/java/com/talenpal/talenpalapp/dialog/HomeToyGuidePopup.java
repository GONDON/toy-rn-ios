package com.talenpal.talenpalapp.dialog;

import android.content.Context;
import android.view.View;

import androidx.annotation.NonNull;

import com.lxj.xpopup.XPopup;
import com.lxj.xpopup.core.BottomPopupView;
import com.lxj.xpopup.enums.PopupAnimation;
import com.talenpal.talenpalapp.R;

import org.xutils.common.util.DensityUtil;

public class HomeToyGuidePopup extends BottomPopupView {
    private HomeFindToyPopup homeFindToyPopup = new HomeFindToyPopup(getContext());
    public HomeToyGuidePopup(@NonNull Context context) {
        super(context);
    }

    @Override
    protected int getImplLayoutId() {
        return R.layout.home_toy_guide_popup;
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        findViewById(R.id.iv_close).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
            }
        });
        findViewById(R.id.btn_confirm).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
                new XPopup.Builder(getContext())
                        .popupAnimation(PopupAnimation.ScrollAlphaFromBottom)
                        .offsetY(DensityUtil.dip2px(-10F))
                        .asCustom(homeFindToyPopup)
                        .show();
            }
        });

    }
}

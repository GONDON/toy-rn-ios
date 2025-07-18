package com.talenpal.talenpalapp.dialog;

import android.content.Context;
import android.view.View;

import androidx.annotation.NonNull;

import com.lxj.xpopup.core.BottomPopupView;
import com.talenpal.talenpalapp.R;

public class HomeFindToyPopup extends BottomPopupView {
    public HomeFindToyPopup(@NonNull Context context) {
        super(context);
    }

    @Override
    protected int getImplLayoutId() {
        return R.layout.home_find_toy_popup;
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

        findViewById(R.id.btn_know).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
            }
        });
    }
}

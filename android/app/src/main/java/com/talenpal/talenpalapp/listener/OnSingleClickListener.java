package com.talenpal.talenpalapp.listener;

import android.os.SystemClock;
import android.view.View;

public abstract class OnSingleClickListener implements View.OnClickListener {
    private static final long MIN_CLICK_INTERVAL = 600; // 最小点击间隔（毫秒）
    private long lastClickTime = 0;

    @Override
    public void onClick(View v) {
        long currentTime = SystemClock.elapsedRealtime();
        if (currentTime - lastClickTime > MIN_CLICK_INTERVAL) {
            lastClickTime = currentTime;
            onSingleClick(v);
        }
    }

    public abstract void onSingleClick(View v);
}

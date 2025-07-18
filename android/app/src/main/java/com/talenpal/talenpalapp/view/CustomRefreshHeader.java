package com.talenpal.talenpalapp.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;

import androidx.annotation.NonNull;

import com.bumptech.glide.Glide;
import com.scwang.smart.refresh.layout.api.RefreshFooter;
import com.scwang.smart.refresh.layout.api.RefreshHeader;
import com.scwang.smart.refresh.layout.api.RefreshLayout;
import com.scwang.smart.refresh.layout.constant.RefreshState;
import com.scwang.smart.refresh.layout.simple.SimpleComponent;
import com.talenpal.talenpalapp.R;

import java.util.Date;

public class CustomRefreshHeader extends SimpleComponent implements RefreshHeader {

    public CustomRefreshHeader(Context context) {
        this(context, null);
    }

    public CustomRefreshHeader(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public CustomRefreshHeader(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        View.inflate(context, R.layout.custom_header_layout, this);
        final View thisView = this;
        ImageView ivGif = thisView.findViewById(R.id.iv_gif);
        Glide.with(context).asGif().load(R.mipmap.gif_lodding).into(ivGif);

    }

    @Override
    public int onFinish(@NonNull RefreshLayout layout, boolean success) {
        return super.onFinish(layout, success);//延迟500毫秒之后再弹回
    }

    @Override
    public void onStateChanged(@NonNull RefreshLayout refreshLayout, @NonNull RefreshState oldState, @NonNull RefreshState newState) {
        switch (newState) {
            case None:
            case PullDownToRefresh://下拉过程
                break;
            case Refreshing:
            case RefreshReleased://正在刷新
                break;
            case ReleaseToRefresh://松开刷新
                break;
            case ReleaseToTwoLevel://释放进入二楼
                break;
            case Loading://正在加载
                break;
        }
    }
}
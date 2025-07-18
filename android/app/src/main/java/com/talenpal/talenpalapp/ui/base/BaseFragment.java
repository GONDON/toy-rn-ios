package com.talenpal.talenpalapp.ui.base;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.viewbinding.ViewBinding;

import com.talenpal.talenpalapp.http.util.HttpUtils;
import com.talenpal.talenpalapp.util.EventBusUtil;

import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;

public abstract class BaseFragment<B extends ViewBinding> extends Fragment {
    protected B binding;
    protected boolean isViewInitiated = false;
    protected boolean isVisibleToUser = false;
    protected boolean isDataLoaded = false;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EventBusUtil.register(this);
    }

    @Override
    public void setUserVisibleHint(boolean isVisibleToUser) {
        super.setUserVisibleHint(isVisibleToUser);
        this.isVisibleToUser = isVisibleToUser;
//        if (isVisibleToUser) {
//            isViewInitiated = false; // 允许重新 initView
//        }
        prepareFetchData();
    }

    public void prepareFetchData() {
        if (isVisibleToUser && isViewInitiated && !isDataLoaded) {
            initData();
            isDataLoaded = true;
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        // 直接通过 ViewBinding 创建根视图
        if (binding == null) {
            initViewBinding(inflater, container);
        }
        return binding.getRoot(); // 返回 binding 的根视图
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        if (!isViewInitiated) {
            initView(view);
            isViewInitiated = true;
        }
        prepareFetchData();
    }

    private void initViewBinding(LayoutInflater inflater, ViewGroup container) {
        try {
            ParameterizedType type = (ParameterizedType) getClass().getGenericSuperclass();
            Class<B> bindingClass = (Class<B>) type.getActualTypeArguments()[0];
            Method inflateMethod = bindingClass.getMethod("inflate",
                    LayoutInflater.class,
                    ViewGroup.class,
                    boolean.class);
            binding = (B) inflateMethod.invoke(null, inflater, container, false);
        } catch (Exception e) {
            throw new RuntimeException("ViewBinding初始化失败", e);
        }
    }

    protected abstract void initView(View view);

    protected abstract void initData();

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onEventBusCome(EventBusUtil.MessageEvent event) {
        if (event != null) {
            receiveEvent(event);
        }
    }

    /**
     * 接收到分发到事件 * * @param event 事件
     */
    protected void receiveEvent(EventBusUtil.MessageEvent event) {
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        binding = null; // 防止内存泄漏
        EventBusUtil.unregister(this);
    }
}

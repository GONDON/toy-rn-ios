package com.talenpal.talenpalapp.dialog;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.gyf.immersionbar.ImmersionBar;
import com.lxj.xpopup.core.PositionPopupView;
import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.adapter.HomeSwitchAdapter;
import com.talenpal.talenpalapp.config.AppConfig;
import com.talenpal.talenpalapp.ui.family.HomeManagementActivity;
import com.talenpal.talenpalapp.util.StatusBarUtil;
import com.thingclips.smart.home.sdk.anntation.HomeStatus;
import com.thingclips.smart.home.sdk.bean.HomeBean;

import java.util.ArrayList;
import java.util.List;

public class HomeSwitchPopup extends PositionPopupView {
    private HomeSwitchAdapter adapter;
    private List<HomeBean> homeList = new ArrayList<>();
    private HomeSwitchAdapter.OnHomeSelectedListener listener;
    private Long selectedHomeId;//选中的家庭id
    public HomeSwitchPopup(@NonNull Context context) {
        super(context);
    }

    public void setHomeChangeListener(HomeSwitchAdapter.OnHomeSelectedListener listener) {
        this.listener = listener;
    }

    @Override
    protected int getImplLayoutId() {
        return R.layout.popup_home_switch;
    }

    public void refreshData(List<HomeBean> list){
        this.selectedHomeId = AppConfig.getCurrentHomeId();

        //处理数据  还未加入的排除
        List<HomeBean> newList = new ArrayList<>();
        for (HomeBean homeBean : list) {
            if(homeBean.getHomeStatus() == HomeStatus.ACCEPT){
                newList.add(homeBean);
            }
        }
        this.homeList.clear();
        this.homeList.addAll(newList);

        if(adapter != null) {
            adapter.setSelectedHomeId(selectedHomeId);
            adapter.setList(homeList);
        }
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        View viewStatus = findViewById(R.id.view_status);
        StatusBarUtil.setHeight(getContext(), viewStatus);

        findViewById(R.id.ll_switch_family).setOnClickListener(v -> {
            getContext().startActivity(new Intent(getContext(), HomeManagementActivity.class));
            dismiss();
        });
        RecyclerView recyclerView = findViewById(R.id.recyclerview);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new HomeSwitchAdapter();
        recyclerView.setAdapter(adapter);
        adapter.setSelectedHomeId(selectedHomeId);
        adapter.setOnHomeChangeListener(listener);
        adapter.setList(homeList);
    }
}

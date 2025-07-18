package com.talenpal.talenpalapp.dialog;

import android.content.Context;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.lxj.xpopup.XPopup;
import com.lxj.xpopup.core.BottomPopupView;
import com.lxj.xpopup.enums.PopupAnimation;
import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.adapter.WifiConnectAdapter;
import com.talenpal.talenpalapp.app.TalenpalApplication;
import com.talenpal.talenpalapp.bean.CustomScanDeviceBean;
import com.talenpal.talenpalapp.config.AppConfig;
import com.talenpal.talenpalapp.listener.ConnectDeviceWorkListener;
import com.talenpal.talenpalapp.listener.WorkListener;
import com.thingclips.smart.android.ble.api.ScanDeviceBean;
import com.thingclips.smart.android.ble.api.WiFiInfo;
import com.thingclips.smart.home.sdk.ThingHomeSdk;
import com.thingclips.smart.home.sdk.callback.IThingResultCallback;
import com.thingclips.smart.sdk.bean.MultiModeQueryBuilder;

import org.xutils.common.util.DensityUtil;

import java.util.List;

public class WifiConnectPopup extends BottomPopupView {
    private WifiConnectAdapter wifiConnectAdapter;

    public WifiConnectPopup(@NonNull Context context) {
        super(context);
    }

    private WifiInformationPopup wifiInformationPopup;
    private XPopup.Builder xpBuilder;
    private ImageView ivRefresh;
    private CustomScanDeviceBean scandeviceBean;
    private boolean isIninView = false;
    private ConnectDeviceWorkListener workListener;
    public void setWorkListener(ConnectDeviceWorkListener workListener){
        this.workListener = workListener;
    }

    @Override
    protected int getImplLayoutId() {
        return R.layout.popup_wifi_connect;
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        isIninView = true;
        ivRefresh = findViewById(R.id.iv_wifi_refresh);
        xpBuilder = new XPopup.Builder(getContext())
                .popupAnimation(PopupAnimation.TranslateAlphaFromBottom)
                .maxHeight(TalenpalApplication.heightPixels - DensityUtil.dip2px(50f));

        wifiConnectAdapter = new WifiConnectAdapter();
        wifiInformationPopup = new WifiInformationPopup(getContext());
        wifiInformationPopup.setWorkListener(workListener);
        wifiConnectAdapter.setListener(wiFiInfoBean -> {
            wifiInformationPopup.setWiFiInfoBean(wiFiInfoBean);
            wifiInformationPopup.setCustomScanDeviceBean(scandeviceBean);
            xpBuilder.asCustom(wifiInformationPopup)
                    .show();
        });
        findViewById(R.id.ll_enter_manually).setOnClickListener(v -> {
            wifiInformationPopup.setWiFiInfoBean(null);
            wifiInformationPopup.setCustomScanDeviceBean(scandeviceBean);
            xpBuilder.asCustom(wifiInformationPopup)
                    .show();
        });
        findViewById(R.id.rl_wifi_refresh).setOnClickListener(v -> {
            getWifiList();
        });
        RecyclerView recyclerView = findViewById(R.id.recyclerview_wifi);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(wifiConnectAdapter);
        findViewById(R.id.iv_close).setOnClickListener(v -> dismiss());
        getWifiList();
    }

    public void resetConfig(CustomScanDeviceBean productInfoBean){
        this.scandeviceBean = productInfoBean;
        if(!isIninView)return;
        getWifiList();
    }

    private void getWifiList(){
        if(scandeviceBean == null)return;
        startAnimation();

        MultiModeQueryBuilder queryBuilder = new MultiModeQueryBuilder.Builder()
                .setHomeId(AppConfig.getCurrentHomeId())
                .setTimeout(10 * 1000)
                .setScanDeviceBean(scandeviceBean.getScanDeviceBean())//scandeviceBean 扫描到的广播包，内部会根据 uuid 匹配到蓝牙设备去进行本地蓝牙连接
                .build();
        ThingHomeSdk.getActivator().newMultiModeActivator().queryDeviceConfigState(queryBuilder, new IThingResultCallback<List<WiFiInfo>>() {
            @Override
            public void onSuccess(List<WiFiInfo>result) {
                //获取 Wi-Fi 列表成功
                wifiConnectAdapter.setList(result);
                stopAnimation();
            }
            @Override
            public void onError(String errorCode, String errorMessage) {
                //获取 Wi-Fi 列表失败
                stopAnimation();
            }
        });
    }

    private void startAnimation() {
        Animation rotateAnim = AnimationUtils.loadAnimation(
                getContext(),
                R.anim.rotate_360_animation
        );
        ivRefresh.startAnimation(rotateAnim);
    }
    private void stopAnimation() {
        ivRefresh.clearAnimation();
    }
}

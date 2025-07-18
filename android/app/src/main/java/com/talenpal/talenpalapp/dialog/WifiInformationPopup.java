package com.talenpal.talenpalapp.dialog;

import android.content.Context;
import android.content.Intent;
import android.text.TextUtils;
import android.util.Log;
import android.widget.EditText;

import androidx.annotation.NonNull;

import com.lxj.xpopup.core.BottomPopupView;
import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.bean.CustomScanDeviceBean;
import com.talenpal.talenpalapp.config.AppConfig;
import com.talenpal.talenpalapp.listener.ConnectDeviceWorkListener;
import com.talenpal.talenpalapp.manager.TuyaTokenManager;
import com.talenpal.talenpalapp.ui.other.WebActivity;
import com.talenpal.talenpalapp.util.ToastUtil;
import com.talenpal.talenpalapp.view.ClickableTextView;
import com.talenpal.talenpalapp.view.ClickableTextView.ClickableText;
import com.thingclips.smart.android.ble.api.ScanDeviceBean;
import com.thingclips.smart.android.ble.api.WiFiInfo;
import com.thingclips.smart.home.sdk.ThingHomeSdk;
import com.thingclips.smart.sdk.api.IMultiModeActivatorListener;
import com.thingclips.smart.sdk.api.IThingActivatorGetToken;
import com.thingclips.smart.sdk.bean.DeviceBean;
import com.thingclips.smart.sdk.bean.MultiModeActivatorBean;
import com.thingclips.smart.sdk.bean.MultiModeActivatorBuilder;
import com.thingclips.smart.sdk.bean.PauseStateData;

public class WifiInformationPopup extends BottomPopupView {
    private WiFiInfo wiFiInfoBean;
    private CustomScanDeviceBean customScanDeviceBean;
    private EditText etWifiName;

    private ConnectDeviceWorkListener workListener;

    public void setWiFiInfoBean(WiFiInfo wiFiInfoBean) {
        this.wiFiInfoBean = wiFiInfoBean;
        showWifiName();
    }

    public void setCustomScanDeviceBean(CustomScanDeviceBean customScanDeviceBean) {
        this.customScanDeviceBean = customScanDeviceBean;
    }

    public void setWorkListener(ConnectDeviceWorkListener workListener) {
        this.workListener = workListener;
    }

    public WifiInformationPopup(@NonNull Context context) {
        super(context);
    }

    @Override
    protected int getImplLayoutId() {
        return R.layout.popup_wifi_information;
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        etWifiName = findViewById(R.id.et_wifi_name);
        EditText etWifiPwd = findViewById(R.id.et_wifi_pwd);
        ClickableTextView tvClickable = findViewById(R.id.tv_clickable);
        tvClickable.setMixedParts(getContext().getString(R.string.wifi_list_tip),
                new ClickableText(getContext().getString(R.string.common_router_setting_method), () -> {
                    Intent intent = new Intent(getContext(), WebActivity.class);
                    intent.putExtra("title",getContext().getString(R.string.common_router_setting_method));
                    intent.putExtra("url", "");
                    getContext().startActivity(intent);
                    return null;
                }));

        showWifiName();

        findViewById(R.id.iv_close).setOnClickListener(v -> dismiss());
        findViewById(R.id.iv_wifi_change).setOnClickListener(v -> dismiss());

        //2 ≦ sec ≦ 5，密码长度都是不小于 8 位
        findViewById(R.id.btn_next).setOnClickListener(v -> {
            String wifiName = etWifiName.getText().toString();
            String wifiPwd = etWifiPwd.getText().toString();

            if (TextUtils.isEmpty(wifiName)) {
                return;
            }

            if (TextUtils.isEmpty(wifiPwd)) {
                return;
            }
            if (wiFiInfoBean != null) {
                if (wiFiInfoBean.getSec() >= 2 && wiFiInfoBean.getSec() <= 5) {
                    if (wifiPwd.length() < 8) {
                        ToastUtil.showToast(getContext().getString(R.string.password_length_less_8));
                        return;
                    }
                }
            }
            //开始配网
//            LoadingHelper.getInstance().showLoading();
            dismiss();
            if (workListener != null) {
                workListener.onStart(customScanDeviceBean.getProductId());
            }
            TuyaTokenManager.getInstance().getToken(new IThingActivatorGetToken() {

                @Override
                public void onSuccess(String token) {
                    TuyaTokenManager.getInstance().invalidateToken();
                    if (wiFiInfoBean != null) {
                        wifiConfigNetWork(token, wifiName, wifiPwd);
                    } else {
                        manuallyConfigNetWork(token, wifiName, wifiPwd);
                    }
                }

                @Override
                public void onFailure(String errorCode, String errorMsg) {
                    LoadingHelper.getInstance().hideLoading();
                    if (workListener != null) {
                        workListener.failed(customScanDeviceBean.getProductId(), errorCode, errorMsg);
                    }
                }
            });
        });
    }

    private void showWifiName() {
        if (etWifiName == null) return;
        if (wiFiInfoBean != null) {
            etWifiName.setText(this.wiFiInfoBean.getSsid());
            etWifiName.setEnabled(false);
        } else {
            etWifiName.setText("");
            etWifiName.setEnabled(true);
        }
    }

    //wifi直连配网
    private void wifiConfigNetWork(String token, String ssid, String pwd) {
        ScanDeviceBean scanDeviceBean = customScanDeviceBean.getScanDeviceBean();
        MultiModeActivatorBuilder builder = new MultiModeActivatorBuilder.Builder()
                .setUuid(scanDeviceBean.getUuid())
                .setSsid(ssid)
                .setPwd(pwd)
                .setTimeout(120 * 1000)
                .setToken(token)
                .build();
        ThingHomeSdk.getActivator().newMultiModeActivator().startOptimizationActivator(builder, new IMultiModeActivatorListener() {
            @Override
            public void onSuccess(DeviceBean deviceBean) {
                LoadingHelper.getInstance().hideLoading();
                dismiss();
                //配网成功
                if (workListener != null) {
                    workListener.onSuccess(customScanDeviceBean.getProductId(), deviceBean);
                }
            }

            @Override
            public void onFailure(int code, String msg, Object handle) {
                LoadingHelper.getInstance().hideLoading();
                dismiss();
                //配网失败，错误码见文末 207206～207223
                if (workListener != null) {
                    workListener.failed(customScanDeviceBean.getProductId(), String.valueOf(code), msg);
                }
            }
        });


    }

    //手动配网
    private void manuallyConfigNetWork(String token, String ssid, String pwd) {
        ScanDeviceBean scanDeviceBean = customScanDeviceBean.getScanDeviceBean();
        // mScanDeviceBean 来自于扫描回调的 ScanDeviceBean
        MultiModeActivatorBean multiModeActivatorBean = new MultiModeActivatorBean(scanDeviceBean);

        // mScanDeviceBean 来自于扫描回调的 ScanDeviceBean
        multiModeActivatorBean.deviceType = scanDeviceBean.getDeviceType(); // 设备类型
        multiModeActivatorBean.uuid = scanDeviceBean.getUuid(); // 设备 uuid
        multiModeActivatorBean.address = scanDeviceBean.getAddress(); // 设备地址
        multiModeActivatorBean.mac = scanDeviceBean.getMac(); // 设备 mac
        multiModeActivatorBean.flag = scanDeviceBean.getFlag(); // 设备等级标签
        multiModeActivatorBean.ssid = ssid; // Wi-Fi SSID
        multiModeActivatorBean.pwd = pwd; // Wi-Fi 密码
        multiModeActivatorBean.token = token; // 获取的 Token
        multiModeActivatorBean.homeId = AppConfig.getCurrentHomeId(); // 当前家庭 homeId
        multiModeActivatorBean.timeout = 120 * 1000L; // 超时时间

        ThingHomeSdk.getActivator().newMultiModeActivator().startActivator(multiModeActivatorBean, new IMultiModeActivatorListener() {
            @Override
            public void onSuccess(DeviceBean deviceBean) {
                LoadingHelper.getInstance().hideLoading();
                dismiss();
                // 配网成功
                if (workListener != null) {
                    workListener.onSuccess(customScanDeviceBean.getProductId(), deviceBean);
                }
            }

            @Override
            public void onFailure(int code, String msg, Object handle) {
                LoadingHelper.getInstance().hideLoading();
                dismiss();
                // 配网失败
                if (workListener != null) {
                    workListener.failed(customScanDeviceBean.getProductId(), String.valueOf(code), msg);
                }
            }

            public void onActivatorStatePauseCallback(PauseStateData stateData) {
                //设备上报的数据，包含设备是否没有连上路由器等，具体含义见参数说明
                Log.e("===stateData", stateData.status + "--" + stateData.data);
            }
        });
    }
}

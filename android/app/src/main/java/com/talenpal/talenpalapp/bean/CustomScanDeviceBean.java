package com.talenpal.talenpalapp.bean;

import com.thingclips.smart.android.ble.api.ScanDeviceBean;
import com.thingclips.smart.home.sdk.bean.ConfigProductInfoBean;

public class CustomScanDeviceBean {
    private String productId;
    private String name;
    private String icon;

    private int state;//配网状态 0:未配网 1:配网中 2:配网成功 3：配网失败
    private boolean isPConnect;//是否配网连接  （已请求wifi列表，但是未开始配网）  只针对state=0有效
    private String devId;//设备id

    private ConfigProductInfoBean configProductInfoBean;
    private ScanDeviceBean scanDeviceBean;

    public CustomScanDeviceBean() {
    }

    public CustomScanDeviceBean(ScanDeviceBean scanDeviceBean, ConfigProductInfoBean configProductInfoBean) {
        this.scanDeviceBean = scanDeviceBean;
        this.configProductInfoBean = configProductInfoBean;
        this.productId = configProductInfoBean.getProductId();
        this.name = configProductInfoBean.getName();
        this.icon = configProductInfoBean.getIcon();
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public ConfigProductInfoBean getConfigProductInfoBean() {
        return configProductInfoBean;
    }

    public void setConfigProductInfoBean(ConfigProductInfoBean configProductInfoBean) {
        this.configProductInfoBean = configProductInfoBean;
    }

    public ScanDeviceBean getScanDeviceBean() {
        return scanDeviceBean;
    }

    public void setScanDeviceBean(ScanDeviceBean scanDeviceBean) {
        this.scanDeviceBean = scanDeviceBean;
    }

    public int getState() {
        return state;
    }

    public void setState(int state) {
        this.state = state;
    }

    public boolean isPConnect() {
        return isPConnect;
    }

    public void setPConnect(boolean PConnect) {
        isPConnect = PConnect;
    }

    public String getDevId() {
        return devId;
    }

    public void setDevId(String devId) {
        this.devId = devId;
    }
}

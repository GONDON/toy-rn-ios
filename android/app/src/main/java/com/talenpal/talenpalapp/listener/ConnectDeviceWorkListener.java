package com.talenpal.talenpalapp.listener;

public abstract class ConnectDeviceWorkListener {
    public void onStart(String productId){}
    public void onSuccess(String productId,Object object){}
    public void failed(String productId,String code,String message){}
}

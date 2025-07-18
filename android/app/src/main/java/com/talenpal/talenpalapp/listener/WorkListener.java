package com.talenpal.talenpalapp.listener;

public abstract class WorkListener {
    public void onSuccess(Object object){}
    public void after(){}
    public void failed(String code,String message){}
}

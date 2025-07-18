package com.talenpal.talenpalapp.http.call;


public interface HttpCall<T> {
    void onSuccess(T model);
    void onError(String code,String msg);
}

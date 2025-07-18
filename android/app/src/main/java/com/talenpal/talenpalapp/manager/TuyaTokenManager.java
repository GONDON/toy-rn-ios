package com.talenpal.talenpalapp.manager;

import com.talenpal.talenpalapp.config.AppConfig;
import com.thingclips.smart.home.sdk.ThingHomeSdk;
import com.thingclips.smart.sdk.api.IThingActivatorGetToken;

public class TuyaTokenManager {
    // 单例实例
    private static volatile TuyaTokenManager instance;

    private String currentToken;
    private long tokenFetchTime;
    private boolean isTokenValid = false;

    // 私有构造函数防止外部实例化
    private TuyaTokenManager() {}

    // 双重检查锁定获取单例
    public static TuyaTokenManager getInstance() {
        if (instance == null) {
            synchronized (TuyaTokenManager.class) {
                if (instance == null) {
                    instance = new TuyaTokenManager();
                }
            }
        }
        return instance;
    }

    public void getToken(IThingActivatorGetToken callback) {
        if (isTokenValid && System.currentTimeMillis() - tokenFetchTime < 10 * 60 * 1000) {
            callback.onSuccess(currentToken);
            return;
        }

        ThingHomeSdk.getActivatorInstance().getActivatorToken(
                AppConfig.getCurrentHomeId(),
                new IThingActivatorGetToken() {
                    @Override
                    public void onSuccess(String token) {
                        currentToken = token;
                        tokenFetchTime = System.currentTimeMillis();
                        isTokenValid = true;
                        callback.onSuccess(token);
                    }

                    @Override
                    public void onFailure(String errorCode, String errorMsg) {
                        callback.onFailure(errorCode, errorMsg);
                    }
                }
        );
    }

    public void invalidateToken() {
        isTokenValid = false;
    }
}

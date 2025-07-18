package com.talenpal.talenpalapp.http.util;

import android.app.Activity;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.ProgressBar;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleOwner;

import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.config.Constant;
import com.talenpal.talenpalapp.dialog.DialogTip;
import com.talenpal.talenpalapp.http.call.HttpCall;
import com.talenpal.talenpalapp.http.model.CommonResponse;
import com.talenpal.talenpalapp.manager.ActManager;
import com.talenpal.talenpalapp.manager.LoginManager;
import com.talenpal.talenpalapp.ui.account.LoginActivity;
import com.talenpal.talenpalapp.util.ToastUtil;

import org.json.JSONObject;
import org.xutils.common.util.DensityUtil;

import java.util.Map;

import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers;
import io.reactivex.rxjava3.core.Observable;
import io.reactivex.rxjava3.disposables.CompositeDisposable;
import io.reactivex.rxjava3.disposables.Disposable;
import io.reactivex.rxjava3.schedulers.Schedulers;
import okhttp3.MediaType;
import okhttp3.RequestBody;

public class HttpUtils {
    private static final String TAG = "HttpUtils";
    protected CompositeDisposable mCompositeDisposable;
    private Dialog progressDialog;
    private int mRequestCount = 0;//请求计数

    private static HttpUtils instance;
    private boolean isShowLoading = true;//是否显示正在加载中

    public static HttpUtils getInstance() {
        if (instance == null) {
            synchronized (HttpUtils.class) {
                if (instance == null) {
                    instance = new HttpUtils();
                }
            }
        }
        return instance;
    }

    public HttpUtils setShowLoading(boolean showLoading) {
        this.isShowLoading = showLoading;
        return this;
    }

    public <T> void request(Observable<CommonResponse<T>> observable, HttpCall<T> call) {
        makeRequest(observable, new RequestCallback<T>() {
            @Override
            public void onSuccess(CommonResponse<T> response) {
                if (response.getCode() == Constant.CODE_SUCCESS) {
                    call.onSuccess(response.getData());
                }else if(response.getCode() == Constant.CODE_EXPIRE){
                    //token过期处理
                    ToastUtil.showToast("登录已过期,请重新登录");
                    LoginManager.INSTANCE.outLogin();
                    Activity activity = ActManager.getAppManager().currentActivity();
                    Intent intent = new Intent(activity, LoginActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
                    activity.startActivity(intent);
                    ActManager.getAppManager().clearAllExcept(LoginActivity.class);
                } else {
                    call.onError(String.valueOf(response.getCode()), response.getMsg());
                    if(isShowLoading) {
                        ToastUtil.showToast(response.getMsg());
                    }
                }
            }

            @Override
            public void onError(Throwable throwable) {
                throwable.printStackTrace();
                call.onError("1000", throwable.getMessage());
                if(isShowLoading) {
                    ToastUtil.showToast(throwable.getMessage());
                }
            }
        });
    }

    /**
     * 封装请求的方法
     */
    private <T> void makeRequest(Observable<CommonResponse<T>> observable, RequestCallback<T> callback) {
        showLoading();
        Disposable subscribe = observable.subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(response -> {
                    callback.onSuccess(response);
                    hideLoading();
                }, throwable -> {
                    callback.onError(throwable);
                    hideLoading();
                });
        addDisposable(subscribe);
    }

    /**
     * 将map转换成RequestBody
     *
     * @param map
     * @return
     */
    public static RequestBody mapToRequestBody(Map<String, String> map) {
        String json = new JSONObject(map).toString();
        return RequestBody.create(MediaType.parse("application/json"), json);
    }

    /**
     * 添加订阅
     */
    private void addDisposable(Disposable disposable) {
        if (mCompositeDisposable == null) {
            mCompositeDisposable = new CompositeDisposable();
        }
        mCompositeDisposable.add(disposable);
        mRequestCount ++;
    }

    /**
     * 取消所有订阅
     */
    public void clearDisposable() {
        if (mCompositeDisposable != null) {
            mCompositeDisposable.clear();
        }
    }

    public void onDestory() {
        if (instance != null) {
            clearDisposable();
            instance = null;
        }
        if (mCompositeDisposable != null) {
            mCompositeDisposable = null;
        }
        if (progressDialog != null) {
            hideLoading();
            progressDialog = null;
        }
    }

    private void showErrorToast(String msg){
        ToastUtil.showCenterToast(msg);
    }

    // 显示加载状态
    private void showLoading() {
        if(!isShowLoading)return;
        showProgressDialog(ActManager.getAppManager().currentActivity());
    }

    // 隐藏加载状态
    private void hideLoading() {
        mRequestCount --;
        if(!isShowLoading)return;
        //多个请求防止弹窗被关闭
        if(mRequestCount <= 0) {
            dismissProgressDialog();
        }
    }

    /**
     * 显示加载等待对话框
     */
    private void showProgressDialog(Context context) {
        if (progressDialog == null) {
            View view = LayoutInflater.from(context).inflate(R.layout.dialog_loading, null);
            progressDialog = new Dialog(context,R.style.dialog);
            progressDialog.setContentView(view);
            progressDialog.setCanceledOnTouchOutside(false);
            Window window = progressDialog.getWindow();
            // 移除背后的遮罩效果
            window.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
            window.setGravity(Gravity.CENTER);
            progressDialog.setOnCancelListener(new DialogInterface.OnCancelListener() {
                @Override
                public void onCancel(DialogInterface dialogInterface) {
                    clearDisposable();
                }
            });
        }
        if (progressDialog != null && !progressDialog.isShowing()) {
            progressDialog.show();
        }
    }

    /**
     * 隐藏加载等待对话框
     */
    private void dismissProgressDialog() {
        if (progressDialog != null && progressDialog.isShowing()) {
            progressDialog.dismiss();
        }
    }

    /**
     * 请求回调接口
     */
    public interface RequestCallback<T> {
        void onSuccess(CommonResponse<T> response);

        void onError(Throwable throwable);
    }
}

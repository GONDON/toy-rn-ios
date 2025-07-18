package com.talenpal.talenpalapp.ui.base;

import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.viewbinding.ViewBinding;

import com.gyf.immersionbar.ImmersionBar;
import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.config.AppConfig;
import com.talenpal.talenpalapp.http.util.HttpUtils;
import com.talenpal.talenpalapp.listener.OnSingleClickListener;
import com.talenpal.talenpalapp.listener.SoftKeyBoardListener;
import com.talenpal.talenpalapp.manager.ActManager;
import com.talenpal.talenpalapp.util.EventBusUtil;
import com.talenpal.talenpalapp.util.StatusBarUtil;
import com.talenpal.talenpalapp.util.ToastUtil;

import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;

public abstract class BaseActivity<B extends ViewBinding>  extends AppCompatActivity {
    protected B binding;
    public String TAG = getClass().getSimpleName();
    protected boolean isInput = false;
    protected LinearLayout contentContainer;
    private View view_base_status;
    private boolean isShowBack = true;
    private RelativeLayout rl_back;
    private TextView tv_title;
    private RelativeLayout activity_header_layout;
    private TextView tv_right;
    protected RelativeLayout rl_base_right;
    private TextView tv_left;
    private ImageView iv_back;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);//强制竖屏
        ActManager.getAppManager().addActivity(this);
        beforeContentView();
        setContentView(R.layout.activity_base);
        layoutInit();

        initStatusBar();//设置状态栏
        //Eventbus
        EventBusUtil.register(this);
        initViewBinding();
        onKeyBoardListener();
        initView();
        initData();
    }
    public abstract void initView();
    public abstract void initData();
    public void afterPermissions(){}
    private void initViewBinding() {
        try {
            Class<B> bindingClass = (Class<B>) ((ParameterizedType) getClass()
                    .getGenericSuperclass()).getActualTypeArguments()[0];

            Method inflateMethod = bindingClass.getMethod("inflate", LayoutInflater.class);
            binding = (B) inflateMethod.invoke(null, getLayoutInflater());

            contentContainer.addView(binding.getRoot(), new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.MATCH_PARENT));
        } catch (Exception e) {
            throw new RuntimeException("ViewBinding初始化失败", e);
        }
    }
//    @Override
//    protected void onResume() {
//        //设置为竖屏
//        if (getRequestedOrientation() != ActivityInfo.SCREEN_ORIENTATION_PORTRAIT) {//当前如果不是反向竖屏显示,强制反向竖屏
//            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
//        }
//        super.onResume();
//    }

    private void layoutInit() {
        contentContainer = findViewById(R.id.base_view);
        view_base_status = findViewById(R.id.view_base_status);
        rl_back = findViewById(R.id.rl_back);
        tv_title = findViewById(R.id.tv_title);
        activity_header_layout = findViewById(R.id.activity_header_layout);
        tv_right = findViewById(R.id.tv_right);
        rl_base_right = findViewById(R.id.rl_base_right);
        tv_left = findViewById(R.id.tv_left);
        iv_back = findViewById(R.id.image_back);
        rl_back.setOnClickListener(v -> {
            onLeftBtnClickListener();
        });
        rl_base_right.setOnClickListener(new OnSingleClickListener() {
            @Override
            public void onSingleClick(View v) {
                onRightBtnClickListener();
            }
        });
    }

    protected void beforeContentView(){}

    //设置状态栏
    private void initStatusBar() {
        if (isImmersion()) {
            isShowBack = false;
            setStatusBar(false);
        } else {
            StatusBarUtil.setHeight(this, view_base_status);
            setStatusBar(isDarkBar());
        }
    }

    private void setStatusBar(Boolean isDark){
        ImmersionBar.with(this).reset().statusBarDarkFont(isDark).init();
    }

    /**
     * 沉浸式显示 不显示标头
     * 默认false   ture为显示沉浸式
     */
    protected boolean isImmersion(){
        return false;
    }

    /**
     * 沉浸式显示 状态栏文字颜色
     * 默认ture 黑色  false为白色
     */
    protected boolean isDarkBar(){
        return true;
    }

    /**
     * 标题头是否显示返回按钮
     * 默认true显示 false为不显示
     */
    protected boolean isShowBacking(){
        return isShowBack;
    }
    protected void onLeftBtnClickListener(){
        onBackPressed();
    }

    protected void onRightBtnClickListener(){}

    @Override
    protected void onStart() {
        super.onStart();
        if (isShowBacking()) {
            if (rl_back != null) {
                rl_back.setVisibility(View.VISIBLE);
                tv_title.setVisibility(View.VISIBLE);
                activity_header_layout.setVisibility(View.VISIBLE);
            }
        } else {
            if (rl_back != null) {
                rl_back.setVisibility(View.GONE);
            }
        }
    }

    protected void setBackImage(int resId) {
        if (iv_back != null) {
            iv_back.setImageResource(resId);
        }
    }

    /**
     * 设置页面标题
     * @param title 标题
     */
    protected void setTitle(String title) {
        if (!TextUtils.isEmpty(title)) {
            tv_title.setVisibility(View.VISIBLE);
            tv_title.setText(title);
        } else {
            tv_title.setVisibility(View.GONE);
        }
    }

    /**
     * 设置标题头右边文字
     */
    protected void setRightText(String btnText) {
        if (!TextUtils.isEmpty(btnText)) {
            tv_right.setText(btnText);
            tv_right.setVisibility(View.VISIBLE);
            rl_base_right.setVisibility(View.VISIBLE);
        } else {
            rl_base_right.setVisibility(View.GONE);
            tv_right.setVisibility(View.GONE);
        }
    }
    protected void setLeftText(String btnText){
        if (!TextUtils.isEmpty(btnText)) {
            tv_left.setText(btnText);
            tv_left.setVisibility(View.VISIBLE);
            iv_back.setVisibility(View.GONE);
        } else {
            tv_left.setVisibility(View.GONE);
            iv_back.setVisibility(View.VISIBLE);
        }
    }

    //是否退出app
    protected Boolean isExitApp() {
        return false;
    }

    private Long current_time  = 0L;
    protected void onPermissionsPermanentlyDenied(int requestCode){};

    @Override
    public void onBackPressed() {
        if (isExitApp()) {
            if (current_time > 0 && System.currentTimeMillis() - current_time <= 3000) {
                super.onBackPressed();
            } else {
                ToastUtil.showToast(getString(R.string.press_agin_exit));
                current_time = System.currentTimeMillis();
            }
        } else {
            super.onBackPressed();
        }
    }

    public void requestPermissionsFun(String [] needPermissions,int requestCode) {
        if (checkPermissions(needPermissions)) {
            afterPermissions(); // 已有权限
            return;
        }

        // 检查永久拒绝状态
        boolean shouldExplain = false;
        boolean isFirstRequest = AppConfig.isFirstPermissionDenied(requestCode);

        for (String perm : needPermissions) {
            if (ActivityCompat.shouldShowRequestPermissionRationale(this, perm)) {
                shouldExplain = true; // 需向用户解释权限必要性
            }else{
                shouldExplain = false;
            }
        }

        if (shouldExplain) {//二次
            AppConfig.setIsFirstPermissionDenied(requestCode, true);
            // 自定义解释弹窗
            ActivityCompat.requestPermissions(this, needPermissions, requestCode);
        }else if (isFirstRequest) {//首次
            ActivityCompat.requestPermissions(this, needPermissions, requestCode); // 首次请求
        } else {
            onPermissionsPermanentlyDenied(requestCode); // 永久拒绝
        }
    }

    public boolean checkPermissions(String[] neededPermissions) {
        if (neededPermissions == null || neededPermissions.length == 0) {
            return true;
        }
        boolean allGranted = true;
        for (String neededPermission : neededPermissions) {
            allGranted &= ContextCompat.checkSelfPermission(this.getApplicationContext(), neededPermission) == PackageManager.PERMISSION_GRANTED;
        }
        return allGranted;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        boolean allGranted = true;
        for (int results : grantResults) {
            allGranted &= results == PackageManager.PERMISSION_GRANTED;
        }
        if (allGranted) {
            afterPermissions();
        }
    }

    //监听软件盘是否弹起
    private void onKeyBoardListener() {
        SoftKeyBoardListener.setListener(this, new SoftKeyBoardListener.OnSoftKeyBoardChangeListener() {
            @Override
            public void keyBoardShow(int height) {
                isInput = true;
            }

            @Override
            public void keyBoardHide(int height) {
                isInput = false;
            }
        });
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onEventBusCome(EventBusUtil.MessageEvent event) {
        if (event != null) {
            receiveEvent(event);
        }
    }

    /**
     * 接收到分发到事件 * * @param event 事件
     */
    protected void receiveEvent(EventBusUtil.MessageEvent event) {}

    @Override
    protected void onDestroy() {
        super.onDestroy();
        ActManager.getAppManager().finishActivity(this);
        EventBusUtil.unregister(this);
    }

}

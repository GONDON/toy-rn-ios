package com.talenpal.talenpalapp.dialog;


import android.app.Activity;
import android.app.Dialog;
import android.content.DialogInterface;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;


import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.app.TalenpalApplication;
import com.talenpal.talenpalapp.manager.ActManager;

import org.xutils.common.util.DensityUtil;


/**
 * 提示弹窗
 */
public class DialogTip{
    private Dialog dialog;
    private TextView tvTip;
    private ImageView ivTipHeader;
    private Button mBtnConfirm;
    private String msg;
    private boolean isSuccess = true;
    private OnDialogListener listener;
    private final String TAG = getClass().getSimpleName();
    private static DialogTip instance;
    public static DialogTip getInstance(){
        if(instance == null){
            synchronized (DialogTip.class){
                if(instance == null){
                    instance = new DialogTip();
                }
            }
        }
        return instance;
    }

    public void showSuccess(String msg){
        show(msg,true,null);
    }
    public void showFaild(String msg){
        show(msg,false,null);
    }

    public void showFaild(String msg,OnDialogListener listener){
        show(msg,false,listener);
    }

    public void show(String msg,boolean isSuccess,OnDialogListener listener) {
        this.msg = msg;
        this.isSuccess = isSuccess;
        this.listener = listener;
        if(dialog != null && dialog.isShowing()){
           refreshView();
        }else{
            createDialog();
            dialog.show();
        }
    }

    private void createDialog() {
        Activity activity = ActManager.getAppManager().currentActivity();
        activity.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
        dialog = new Dialog(activity, R.style.dialog);
        View view = LayoutInflater.from(activity).inflate(R.layout.dialog_tip, null);
        dialog.setContentView(view);
        dialog.setCancelable(false);//点击外部不可dismiss
        dialog.setCanceledOnTouchOutside(false);
        Window window = dialog.getWindow();
        window.setGravity(Gravity.CENTER);
        WindowManager.LayoutParams params = window.getAttributes();
        params.width = TalenpalApplication.widthPixels - DensityUtil.dip2px(40)*2;
        params.height = WindowManager.LayoutParams.WRAP_CONTENT;
        window.setAttributes(params);
        dialog.setOnDismissListener(onDismissListener);
        initView(view);
    }

    private DialogInterface.OnDismissListener onDismissListener = new DialogInterface.OnDismissListener() {
        @Override
        public void onDismiss(DialogInterface dialogInterface) {
            if(listener != null){
                listener.dismiss();
            }
        }
    };

    private void refreshView() {
        tvTip.setText(msg);
        if(isSuccess){
//            ivTipHeader.setImageResource(R.mipmap.ic_tip_success);
        }else{
//            ivTipHeader.setImageResource(R.mipmap.ic_tip_faild);
        }
    }
    private void initView(View view) {
        tvTip = view.findViewById(R.id.tv_tip);
        ivTipHeader = view.findViewById(R.id.iv_tip_header);
        mBtnConfirm = view.findViewById(R.id.btn_confirm);
        refreshView();
        mBtnConfirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();
            }
        });
    }

    public interface OnDialogListener{
        void dismiss();
    }
}

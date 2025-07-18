package com.talenpal.talenpalapp.dialog;

import android.app.AlertDialog;
import android.content.Context;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.app.TalenpalApplication;
import com.talenpal.talenpalapp.listener.DialogCommitListener;
import com.talenpal.talenpalapp.listener.WorkListener;

import org.xutils.common.util.DensityUtil;

public class DialogHelper {

    public static AlertDialog.Builder getDialog(Context context) {
        return  new AlertDialog.Builder(context);
    }

    /**
     * 自定义布局
     **/
    public static AlertDialog getCustomDialog(Context context, int layoutId) {
        AlertDialog.Builder builder = getDialog(context);
        AlertDialog dialog = builder.setView(layoutId).create();
        dialog.show();
        return dialog;
    }

    /**
     * 圆角dialog
     *
     * @param layoutId
     * @return
     */
    public static AlertDialog getConnerBgDialog(Context mContext, int layoutId) {
        int width = TalenpalApplication.widthPixels - 2 * DensityUtil.dip2px(50);
        return getConnerBgDialog(mContext, layoutId, width, 0);
    }

    public static AlertDialog getConnerBgDialog(Context mContext, int layoutId, int width, int bg_res) {
        AlertDialog dialog = getCustomDialog(mContext, R.layout.dialog_conner_layout);
        Window window = dialog.getWindow();

        // === 新增关键修复代码 ===
        window.clearFlags(WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE);
        window.clearFlags(WindowManager.LayoutParams.FLAG_ALT_FOCUSABLE_IM);

        window.setGravity(Gravity.CENTER);
        WindowManager.LayoutParams params = window.getAttributes();
        params.width = width;
        window.setBackgroundDrawableResource(android.R.color.transparent);
        window.setAttributes(params);

        // === 修改软键盘模式 ===
        window.setSoftInputMode(
                WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE |
                        WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
        );

        View dialogView = dialog.getWindow().getDecorView();
        if (bg_res > 0) {
            dialogView.setBackgroundResource(bg_res);
        }
        LinearLayout contentLayout = dialogView.findViewById(R.id.ll_dialog_content);
        View inflate = LayoutInflater.from(mContext).inflate(layoutId, null, false);
        contentLayout.addView(inflate);
        dialog.setView(contentLayout);
        return dialog;
    }


    public static AlertDialog showContentDialog(Context context, String title, final DialogCommitListener listener) {
        return showContentDialog(context,title,"","",listener);
    }
    public static AlertDialog showContentDialog(Context context, String title, String leftBtnText,String rightBtnText, final DialogCommitListener listenerLeft,final DialogCommitListener listenerRight) {
        return showContentDialog(context,title,"",leftBtnText,rightBtnText,listenerLeft,listenerRight);
    }
    public static AlertDialog showContentDialog(Context context, String title,String content, final DialogCommitListener listener) {
        return showContentDialog(context,title,content,"","",null,listener);
    }
    public static AlertDialog showContentDialog(Context context, String title,String leftBtnText,String rightBtnText, final DialogCommitListener listener) {
        return showContentDialog(context,title,"",leftBtnText,rightBtnText,null,listener);
    }
    public static AlertDialog showContentDialog(Context context, String title, String content,String leftBtnText,String rightBtnText, final DialogCommitListener listenerRight) {
        return showContentDialog(context,title,content,leftBtnText,rightBtnText,null,listenerRight);
    }
    //内容确定弹窗
    public static AlertDialog showContentDialog(Context context, String title, String content,String leftBtnText,String rightBtnText, final DialogCommitListener listenerLeft,final DialogCommitListener listenerRight) {
        final AlertDialog dialog = getConnerBgDialog(context, R.layout.dialog_content_layout);
        dialog.setCancelable(false);
        dialog.setCanceledOnTouchOutside(false);
        View view = dialog.getWindow().getDecorView();
        TextView tvTitle = view.findViewById(R.id.title);
        TextView tvContent = view.findViewById(R.id.content);
        TextView tv_cancal = view.findViewById(R.id.tv_cancal);
        TextView tv_commit = view.findViewById(R.id.tv_commit);

        if (!TextUtils.isEmpty(title)) {
            tvTitle.setText(title);
        }

        if (!TextUtils.isEmpty(content)){
            tvContent.setText(content);
            tvContent.setVisibility(View.VISIBLE);
        }else{
            tvContent.setVisibility(View.GONE);
        }

        if (!TextUtils.isEmpty(leftBtnText)) {
            tv_cancal.setText(leftBtnText);
        }
        if (!TextUtils.isEmpty(rightBtnText)) {
            tv_commit.setText(rightBtnText);
        }

        tv_cancal.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dialog.dismiss();
                if (listenerLeft != null)
                    listenerLeft.commit();
            }
        });
        tv_commit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dialog.dismiss();
                if (listenerRight != null)
                    listenerRight.commit();
            }
        });
        return dialog;
    }

    //提示信息
    public static void showTipDialog(Context context, String title) {
        showTipDialog(context, title, "");
    }
    public static void showTipDialog(Context context, String title, String content) {
        AlertDialog dialog = getConnerBgDialog(context, R.layout.dialog_tip_conner);
        dialog.setCancelable(true);
        dialog.setCanceledOnTouchOutside(true);
        View view = dialog.getWindow().getDecorView();
        TextView tvContent = view.findViewById(R.id.content);
        TextView tvTitle = view.findViewById(R.id.title);
        if (!TextUtils.isEmpty(title)) {
            tvTitle.setText(title);
        }
        if (!TextUtils.isEmpty(content)) {
            tvContent.setText(content);
            tvContent.setVisibility(View.VISIBLE);
        }else{
            tvContent.setVisibility(View.GONE);
        }
    }

    /**
     * 编辑弹窗
     * @param context
     * @param title
     * @param value
     */
    public static void showEditDialog(Context context, String title, String value,final WorkListener listener) {
        AlertDialog dialog = getConnerBgDialog(context, R.layout.dialog_edit_conner);
        dialog.setCancelable(false);
        dialog.setCanceledOnTouchOutside(false);
        View view = dialog.getWindow().getDecorView();
        TextView tvTitle = view.findViewById(R.id.title);
        EditText etContent = view.findViewById(R.id.et_content);
        TextView tv_cancal = view.findViewById(R.id.tv_cancal);
        TextView tv_commit = view.findViewById(R.id.tv_commit);

        if (!TextUtils.isEmpty(title)) {
            tvTitle.setText(title);
            etContent.setHint(context.getString(R.string.thing_activator_please_input)+" "+title);
        }
        if (!TextUtils.isEmpty(value)) {
            etContent.setText(value);
        }
        tv_cancal.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dialog.dismiss();
            }
        });
        tv_commit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dialog.dismiss();
                if(listener != null){
                    listener.onSuccess(etContent.getText().toString().trim());
                }
            }
        });
    }

    //设置弹窗置于底部
    public static void setDialogBottom(Context context, AlertDialog dialog) {
        dialog.getWindow().setGravity(Gravity.BOTTOM);
        DisplayMetrics dm = context.getResources().getDisplayMetrics();
        Window window = dialog.getWindow();
        WindowManager.LayoutParams params = window.getAttributes();
        params.width = dm.widthPixels;
        window.setAttributes(params);
        window.setWindowAnimations(R.style.EnterExitAnimation);
    }


}

package com.talenpal.talenpalapp.util;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;



import org.xutils.common.util.DensityUtil;

public class LayoutInflaterUtils {
    public static View from(Context context, int layoutId){
        return LayoutInflater.from(context).inflate(layoutId, null, false);
    }

    public static View spaceView(Context context, float height){
        LinearLayout layout = new LinearLayout(context);
        LinearLayout.LayoutParams layoutParams =  new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, DensityUtil.dip2px(height));
        layout.setLayoutParams(layoutParams);
        return layout;
    }


}

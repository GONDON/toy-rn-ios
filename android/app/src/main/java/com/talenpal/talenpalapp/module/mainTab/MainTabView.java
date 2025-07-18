package com.talenpal.talenpalapp.module.mainTab;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.util.AttributeSet;
import android.view.View;
import android.widget.RelativeLayout;

import androidx.fragment.app.FragmentManager;
import androidx.viewpager.widget.ViewPager;


import com.flyco.tablayout.CommonTabLayout;
import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.util.LayoutInflaterUtils;
import com.talenpal.talenpalapp.view.NoScrollViewPager;

import java.util.ArrayList;


public class MainTabView extends RelativeLayout {
    public MainTabView(Context context) {
        super(context);
        initView();
    }

    public MainTabView(Context context, AttributeSet attrs) {
        super(context, attrs);
        initView();
    }

    public MainTabView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        initView();
    }

    CommonTabLayout tablayout;
    NoScrollViewPager mViewPager;
    View shadow_line;

    private FragmentManager fragmentManager;
    private int textSelectColor;
    private int textDefaultColor;
    private ArrayList<TabBaseEntity> mTabEntities = new ArrayList<>();
    private void initView(){
        View view = LayoutInflaterUtils.from(getContext(), R.layout.main_tab_layout);
        tablayout = view.findViewById(R.id.tablayout);
        mViewPager = view.findViewById(R.id.viewpager);
        shadow_line = view.findViewById(R.id.shadow_line);
        addView(view);
    }

    public void build() {
        new MainTabHelper(fragmentManager).init(mViewPager,tablayout,
                mTabEntities,
                textSelectColor,textDefaultColor);
    }

    public MainTabView addTab(TabBaseEntity tabEntity){
        mTabEntities.add(tabEntity);
        return this;
    }

    public MainTabView setFragmentManager(FragmentManager fragmentManager) {
        this.fragmentManager = fragmentManager;
        return this;
    }

    public MainTabView setTextColor(int textSelectColor,int textDefaultColor) {
        this.textSelectColor = textSelectColor;
        this.textDefaultColor = textDefaultColor;
        return this;
    }

    public CommonTabLayout getTabLayout(){
        return tablayout;
    }

    public ViewPager getViewPager(){
        return mViewPager;
    }

    private void setShowLineColor(){
        if(textSelectColor != 0) {
            int[] colorsTwo = {textSelectColor,Color.parseColor("#00FFFFFF")};
            GradientDrawable mGradientDrawable = (GradientDrawable) shadow_line.getBackground();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                mGradientDrawable.setColors(colorsTwo);
            }
        }
    }

    /**
     * 设置tab
     * @param position
     */
    public MainTabView setCurrentTab(int position){
        tablayout.setCurrentTab(position);
        mViewPager.setCurrentItem(position);
        return this;
    }
    /**
     * 显示红点数
     */
    public void showMsg(int position,int num){
        if(num > 0) {
            tablayout.showMsg(position, num);
            tablayout.setMsgMargin(position, -12, 3);
        }else{
            tablayout.hideMsg(position);
        }
    }

}

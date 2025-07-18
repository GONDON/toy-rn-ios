package com.talenpal.talenpalapp.module.mainTab;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.viewpager.widget.ViewPager;

import com.flyco.tablayout.CommonTabLayout;
import com.flyco.tablayout.listener.CustomTabEntity;
import com.flyco.tablayout.listener.OnTabSelectListener;
import com.talenpal.talenpalapp.util.DataUtils;

import java.util.ArrayList;
import java.util.List;

public class MainTabHelper {
    private FragmentManager fragmentManager;
    private int oldPosition = 0;

    public MainTabHelper(FragmentManager fragmentManager) {
        this.fragmentManager = fragmentManager;
    }

    public void init(final ViewPager mViewPager, CommonTabLayout tablayout,
                     ArrayList<TabBaseEntity> mTabEntities,
                      int textSelectColor, int textDefaultColor) {
        List<String> mTitles = new ArrayList<>();
        ArrayList<Fragment> fragments = new ArrayList<>();
        ArrayList<CustomTabEntity> entities = new ArrayList<>();
        for(TabBaseEntity tabEntity : mTabEntities){
            TabBaseEntity.TabEntity tabItem = tabEntity.getTabEntity();
            mTitles.add(tabItem.getTabTitle());
            fragments.add(tabItem.getFragment());
            entities.add(tabItem);
        }

        mViewPager.setAdapter(new TabPagerAdapter(fragmentManager, DataUtils.listToArrayString(mTitles), fragments));
        ArrayList<CustomTabEntity> tabData = new ArrayList<>();
        tabData.addAll(entities);
        tablayout.setTabData(tabData);
        if (textSelectColor != 0) {
            tablayout.setTextSelectColor(textSelectColor);
        }
        if (textDefaultColor != 0) {
            tablayout.setTextUnselectColor(textDefaultColor);
        }
        tablayout.setOnTabSelectListener(new OnTabSelectListener() {
            @Override
            public void onTabSelect(int position) {
                //设置其他项不可点击
                if(position == 1 || position == 2){
                    tablayout.setCurrentTab(oldPosition);
                    return;
                }else{
                    oldPosition  = position;
                }
                mViewPager.setCurrentItem(position);

//                if(position != 0){
//                    tablayout.setCurrentTab(0);
//                    return;
//                }
//                mViewPager.setCurrentItem(position);
            }

            @Override
            public void onTabReselect(int position) {
            }
        });

        mViewPager.setCurrentItem(0);
    }
}

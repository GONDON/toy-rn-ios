package com.talenpal.talenpalapp.view;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import androidx.viewpager2.widget.ViewPager2;

import com.bumptech.glide.Glide;
import com.google.android.material.imageview.ShapeableImageView;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.http.model.DollInstanceModel;
import com.talenpal.talenpalapp.http.model.DollItemModel;

import org.xutils.common.util.DensityUtil;

import java.util.ArrayList;
import java.util.List;

public class ToyCustomTabLayout extends TabLayout {
    private TabLayoutMediator mediator;
    private List<DollItemModel> tabList = new ArrayList<>();
    public ToyCustomTabLayout(Context context) {
        super(context);
        init();
    }

    public ToyCustomTabLayout(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public ToyCustomTabLayout(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    public void setData(List<DollItemModel> list){
        this.tabList = list;
    }

    private void init() {
        // 设置 Tab 模式（固定或滚动）
        setTabMode(TabLayout.MODE_SCROLLABLE);
        setElevation(0);
        setTabIndicatorFullWidth(false);

        // 使用圆角Drawable作为指示器
        Drawable indicatorDrawable = ContextCompat.getDrawable(getContext(), R.drawable.tab_indicator_rounded);
        if (indicatorDrawable != null) {
            setSelectedTabIndicator(indicatorDrawable);
        }

        // 添加Tab选择监听
        addOnTabSelectedListener(new OnTabSelectedListener() {
            @Override
            public void onTabSelected(Tab tab) {
                updateTabAppearance(tab, true);
            }

            @Override
            public void onTabUnselected(Tab tab) {
                updateTabAppearance(tab, false);
            }

            @Override
            public void onTabReselected(Tab tab) {
            }
        });
    }

    private void updateTabAppearance(Tab tab, boolean selected) {
        View tabView = tab.getCustomView();
        if (tabView == null) return;

        TextView tabText = tabView.findViewById(R.id.tv_doll_name);
        tabText.setTextColor(selected ? Color.parseColor("#17A7FF") : Color.parseColor("#99000000"));
        tabText.setTextSize(TypedValue.COMPLEX_UNIT_DIP, selected ? 14 : 12);
        tabText.setTypeface(selected ? Typeface.DEFAULT_BOLD : Typeface.DEFAULT);
        ShapeableImageView dollImage = tabView.findViewById(R.id.iv_doll);
        dollImage.setStrokeWidth(selected ? DensityUtil.dip2px(3) : 0);
    }

    // 添加与 ViewPager2 联动的方法
    public void setupWithViewPager(@Nullable ViewPager2 viewPager) {
        if (viewPager == null) return;

        RecyclerView.Adapter<?> adapter = viewPager.getAdapter();
        if (adapter == null) {
            throw new IllegalStateException("ViewPager does not have a adapter");
        }

        // 创建 TabLayoutMediator
        mediator = new TabLayoutMediator(
                this,
                viewPager,
                (tab, position) -> {

                    if (adapter instanceof TabTitleProvider) {
                        TabTitleProvider tabProvider = (TabTitleProvider) adapter;

                        // 提前初始化自定义视图
                        View tabView = LayoutInflater.from(getContext())
                                .inflate(R.layout.item_home_explore_toys, ToyCustomTabLayout.this, false);
                        tab.setCustomView(tabView);

                        TextView tabText = tabView.findViewById(R.id.tv_doll_name);
                        tabText.setText("Toy "+position);
                        ShapeableImageView dollImage = tabView.findViewById(R.id.iv_doll);

                        if(position < tabList.size()){
                            DollItemModel item = tabList.get(position);
                            tabText.setText(item.getDollModel().getName());
                            Glide.with(getContext()).load(item.getDollModel().getCoverImg()).into(dollImage);
                        }

                        // 根据当前位置设置初始状态
                        boolean isSelected = (viewPager.getCurrentItem() == position);
                        updateTabAppearance(tab, isSelected);
                    }
                }
        );
        mediator.attach();
    }

    // 定义标题提供者接口
    public interface TabTitleProvider {
        boolean isRealPosition(int position);
        int getRealIndex(int position);
    }

    public void detach() {
        if (mediator != null) {
            mediator.detach();
        }
    }
}
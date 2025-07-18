package com.talenpal.talenpalapp.module.banner;

import android.content.Context;
import android.graphics.Color;
import android.util.SparseArray;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.RoundedCorners;
import com.bumptech.glide.request.RequestOptions;
import com.talenpal.talenpalapp.R;
import com.talenpal.talenpalapp.http.model.CarouselItem;
import com.talenpal.talenpalapp.module.banner.viewholder.ImageHolder;
import com.talenpal.talenpalapp.module.banner.viewholder.TitleHolder;
import com.talenpal.talenpalapp.module.banner.viewholder.VideoHolder;
import com.youth.banner.adapter.BannerAdapter;
import com.youth.banner.util.BannerUtils;

import java.util.List;


public class BannerMultipleTypesAdapter extends BannerAdapter<CarouselItem, RecyclerView.ViewHolder> {
    private static final int BANNER_IMAGE = 1;
    private static final int BANNER_VIDEO = 2;
    private static final int BANNER_AUDIO = 3;
    private SparseArray<RecyclerView.ViewHolder> mVHMap = new SparseArray<>();

    public BannerMultipleTypesAdapter(Context context, List<CarouselItem> mDatas) {
        super(mDatas);
    }

    @Override
    public RecyclerView.ViewHolder onCreateHolder(ViewGroup parent, int viewType) {
        switch (viewType) {
            case BANNER_IMAGE:
                return new ImageHolder(BannerUtils.getView(parent, R.layout.banner_image));
            case BANNER_VIDEO:
                return new VideoHolder(BannerUtils.getView(parent, R.layout.banner_video));
            case BANNER_AUDIO:
                return new TitleHolder(BannerUtils.getView(parent, R.layout.banner_title));
        }
        return new ImageHolder(BannerUtils.getView(parent, R.layout.banner_image));
    }

    @Override
    public int getItemViewType(int position) {
        if (getRealData(position) instanceof CarouselItem.ImageItem) {
            return BANNER_IMAGE;
        } else if (getRealData(position) instanceof CarouselItem.VideoItem) {
            return BANNER_VIDEO;
        } else if (getRealData(position) instanceof CarouselItem.AudioItem) {
            return BANNER_AUDIO;
        }
        return BANNER_IMAGE;
    }

    @Override
    public void onBindView(RecyclerView.ViewHolder holder, CarouselItem data, int position, int size) {
        int itemViewType = holder.getItemViewType();
        if (itemViewType == BANNER_IMAGE) {
            CarouselItem.ImageItem imageItem = (CarouselItem.ImageItem) data;
            ImageHolder imageHolder = (ImageHolder) holder;
            mVHMap.append(position, imageHolder);
            Glide.with(holder.itemView)
                    .load(imageItem.getUrl())
                    .apply(RequestOptions.bitmapTransform(new RoundedCorners(30)))
                    .into(imageHolder.imageView);
        } else if (itemViewType == BANNER_VIDEO) {
            CarouselItem.VideoItem videoItem = (CarouselItem.VideoItem) data;
            VideoHolder videoHolder = (VideoHolder) holder;
            mVHMap.append(position, videoHolder);
////            videoHolder.player.setUp(data.imageUrl, true, null);
//            videoHolder.player.getBackButton().setVisibility(View.GONE);
//            //增加封面
//            ImageView imageView = new ImageView(context);
//            imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
////            imageView.setImageResource(R.drawable.image4);
//            videoHolder.player.setThumbImageView(imageView);
//                videoHolder.player.startPlayLogic();
            //创建基础视频播放器，一般播放器的功能
        } else if (itemViewType == BANNER_AUDIO) {
            TitleHolder titleHolder = (TitleHolder) holder;
            mVHMap.append(position, titleHolder);
//            titleHolder.title.setText(data.title);
//            titleHolder.title.setBackgroundColor(Color.parseColor(DataBean.getRandColor()));
        }
    }

    public SparseArray<RecyclerView.ViewHolder> getVHMap() {
        return mVHMap;
    }
}

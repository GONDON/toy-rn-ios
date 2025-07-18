package com.talenpal.talenpalapp.adapter

import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.Drawable
import android.os.Build
import android.text.Html
import android.text.Spannable
import android.text.SpannableString
import android.text.SpannableStringBuilder
import android.text.style.AbsoluteSizeSpan
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.bitmap.RoundedCorners
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.adapter.HomeBannerToyAdapter.BannerViewHolder
import com.talenpal.talenpalapp.http.model.DollItemModel
import com.talenpal.talenpalapp.http.model.DollModel
import com.talenpal.talenpalapp.view.ToyCustomTabLayout
import com.youth.banner.adapter.BannerAdapter
import org.xutils.common.util.DensityUtil

class HomeBannerToyAdapter :
    BannerAdapter<DollItemModel, BannerViewHolder>(null), ToyCustomTabLayout.TabTitleProvider {


    class BannerViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        var tvDollName: TextView = itemView.findViewById(R.id.tv_doll_name)
        var tvDollDesc: TextView = itemView.findViewById(R.id.tv_doll_desc)
        var tvStoryNum: TextView = itemView.findViewById(R.id.tv_story_num)
        var tvStoryDuration: TextView = itemView.findViewById(R.id.tv_duration_length)
        var llRootView: LinearLayout = itemView.findViewById(R.id.ll_root_view)
    }

    override fun onCreateHolder(parent: ViewGroup?, viewType: Int): BannerViewHolder {
        val itemView = LayoutInflater.from(parent?.context)
            .inflate(R.layout.item_home_banner_toys, parent, false)
        return BannerViewHolder(itemView)
    }

    override fun onBindView(
        holder: BannerViewHolder?,
        data: DollItemModel?,
        position: Int,
        size: Int
    ) {
        holder?.tvDollName?.text = data?.dollModel?.name
        holder?.tvDollDesc?.text = data?.dollModel?.desc
        holder?.tvStoryNum?.text = "${data?.totalStoryNum}"
        holder?.tvStoryDuration?.text = showDuration(data?.totalStoryDuration ?: 0)

        Glide.with(holder?.llRootView!!)
            .load(data?.dollModel?.backgroundImg)
//            .placeholder(R.mipmap.home_toys_item_bg) // 加载中显示的图片
//            .error(R.mipmap.home_toys_item_bg)        // 加载失败显示的图片
            .transform(RoundedCorners(DensityUtil.dip2px(20f)))
            .into(object : CustomTarget<Drawable>() {
                override fun onResourceReady(
                    resource: Drawable,
                    transition: Transition<in Drawable>?
                ) {
                    holder?.llRootView!!.background = resource
                }

                override fun onLoadCleared(placeholder: Drawable?) {
                }
            })
    }

    override fun isRealPosition(position: Int): Boolean {
        return position > 0 && position < mDatas.size + 1
    }

    override fun getRealIndex(position: Int): Int {
        return position - 1;
    }

    private fun showDuration(duration: Int):SpannableStringBuilder {
        val spannableBuilder = SpannableStringBuilder()
        val durationStr = durationToTimeStr(duration)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            val parts = durationStr.split(" ")
            val spannable1 = SpannableString(parts[0])
            spannable1.setSpan(StyleSpan(Typeface.BOLD), 0, parts[0].length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
            spannable1.setSpan(AbsoluteSizeSpan(16, true), 0, parts[0].length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
            spannable1.setSpan(ForegroundColorSpan(Color.parseColor("#ff181719")), 0, parts[0].length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
            val spannable2 = SpannableString(parts[1])
            spannable2.setSpan(AbsoluteSizeSpan(10, true), 0,parts[1].length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
            spannable2.setSpan(ForegroundColorSpan(Color.parseColor("#99000000")), 0,parts[1].length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
            spannableBuilder.append(spannable1)
            spannableBuilder.append(spannable2)
            if (parts.size > 2) {
                val spannable3 = SpannableString(parts[2])
                spannable3.setSpan(StyleSpan(Typeface.BOLD), 0, parts[2].length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
                spannable3.setSpan(AbsoluteSizeSpan(16, true), 0, parts[2].length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
                spannable3.setSpan(ForegroundColorSpan(Color.parseColor("#ff181719")), 0, parts[2].length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
                val spannable4 = SpannableString(parts[3])
                spannable4.setSpan(AbsoluteSizeSpan(10, true), 0,parts[3].length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
                spannable4.setSpan(ForegroundColorSpan(Color.parseColor("#99000000")), 0,parts[3].length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
                spannableBuilder.append(spannable3)
                spannableBuilder.append(spannable4)
            }
        } else {
            spannableBuilder.append(durationStr)
        }
        return spannableBuilder
    }

    private fun durationToTimeStr(duration: Int): String {
        val hours = duration / 3600
        val minutes = (duration % 3600) / 60

        return when {
            hours > 0 && minutes > 0 -> "$hours h $minutes min"
            hours > 0 -> "$hours h"
            minutes > 0 -> "$minutes min"
            else -> "0 min" // 处理0秒的情况
        }
    }
}
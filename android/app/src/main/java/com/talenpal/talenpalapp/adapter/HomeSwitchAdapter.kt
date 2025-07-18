package com.talenpal.talenpalapp.adapter

import android.graphics.Color
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import com.chad.library.adapter.base.BaseQuickAdapter
import com.chad.library.adapter.base.viewholder.BaseViewHolder
import com.talenpal.talenpalapp.R
import com.thingclips.smart.home.sdk.bean.HomeBean

class HomeSwitchAdapter : BaseQuickAdapter<HomeBean, BaseViewHolder>(R.layout.item_home_switch) {
    var selectedHomeId: Long? = null
    var onHomeChangeListener: OnHomeSelectedListener? = null
    override fun convert(holder: BaseViewHolder, item: HomeBean) {
        holder.getView<TextView>(R.id.tv_family_name).text = item.name

        if(selectedHomeId == item.homeId){
            holder.getView<TextView>(R.id.tv_family_name).setTextColor(Color.parseColor("#ff0EA2FF"))
            holder.getView<ImageView>(R.id.iv_family).setImageResource(R.mipmap.icon_family_blue)
            holder.getView<ImageView>(R.id.iv_check).visibility = View.VISIBLE
        }else{
            holder.getView<TextView>(R.id.tv_family_name).setTextColor(Color.parseColor("#e6000000"))
            holder.getView<ImageView>(R.id.iv_family).setImageResource(R.mipmap.icon_family_grey)
            holder.getView<ImageView>(R.id.iv_check).visibility = View.INVISIBLE
        }

        holder.itemView.setOnClickListener {
            if(selectedHomeId == item.homeId){
                return@setOnClickListener
            }
            selectedHomeId = item.homeId
            if(onHomeChangeListener != null){
                onHomeChangeListener?.onHomeSelected(item.homeId, item)
            }
            notifyDataSetChanged()
        }
    }

    interface OnHomeSelectedListener{
        fun onHomeSelected(homeId: Long, homeBean: HomeBean)
    }
}
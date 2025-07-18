package com.talenpal.talenpalapp.adapter

import android.content.Intent
import android.widget.TextView
import com.chad.library.adapter.base.BaseQuickAdapter
import com.chad.library.adapter.base.viewholder.BaseViewHolder
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.ui.family.HomeSetActivity
import com.thingclips.smart.home.sdk.anntation.HomeStatus
import com.thingclips.smart.home.sdk.bean.HomeBean

class HomeManagementAdapter: BaseQuickAdapter<HomeBean, BaseViewHolder>(R.layout.item_home_management){
    private var mListener: HomeManagementListener? = null
    fun setHomeManagementListener(listener: HomeManagementListener){
        mListener = listener
    }
    override fun convert(holder: BaseViewHolder, item: HomeBean) {
        holder.getView<TextView>(R.id.tv_family_name).text = item.name
        if(item.homeStatus == HomeStatus.WAITING){
            holder.getView<TextView>(R.id.tv_status).text = "待加入"
        } else if(item.homeStatus == HomeStatus.REJECT){
            holder.getView<TextView>(R.id.tv_status).text = "已拒绝"
        }else{
            holder.getView<TextView>(R.id.tv_status).text = ""
        }
        holder.itemView.setOnClickListener {
            if(item.homeStatus == HomeStatus.WAITING){
                if(mListener != null){
                    mListener?.onWaitJoin(item.homeId,item.name)
                }
            }else if(item.homeStatus == HomeStatus.ACCEPT){
                context.startActivity(Intent(context, HomeSetActivity::class.java)
                    .putExtra("homeId",item.homeId)
                    .putExtra("homeCount",data.size)//家庭个数
                )
            }else{
                //nothing
            }
        }
    }

    interface HomeManagementListener{
        fun onWaitJoin(homeId:Long,homeName:String)
    }
}
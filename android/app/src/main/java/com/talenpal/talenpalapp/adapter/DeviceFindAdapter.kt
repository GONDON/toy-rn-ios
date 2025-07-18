package com.talenpal.talenpalapp.adapter

import android.content.Intent
import com.alibaba.fastjson.JSON
import com.bumptech.glide.Glide
import com.chad.library.adapter.base.BaseQuickAdapter
import com.chad.library.adapter.base.viewholder.BaseViewHolder
import com.google.android.material.imageview.ShapeableImageView
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.bean.CustomScanDeviceBean
import com.talenpal.talenpalapp.ui.device.AddDeviceActivity
import com.talenpal.talenpalapp.util.JsonUtils
import org.xutils.common.util.DensityUtil

class DeviceFindAdapter :
    BaseQuickAdapter<CustomScanDeviceBean, BaseViewHolder>(R.layout.item_device_find) {

    var isSingle = true//是否是单设备
    var onDeviceFindListener: OnDeviceFindListener? = null
    override fun convert(holder: BaseViewHolder, item: CustomScanDeviceBean) {
        val image = holder.getView<ShapeableImageView>(R.id.iv_doll)
        Glide.with(context).load(item.icon).into(image)
        val layoutParams = image.layoutParams
        if (isSingle) {
            layoutParams.width = DensityUtil.dip2px(64f)
            layoutParams.height = DensityUtil.dip2px(64f)
        } else {
            layoutParams.width = DensityUtil.dip2px(32f)
            layoutParams.height = DensityUtil.dip2px(32f)
        }
        image.layoutParams = layoutParams

        holder.itemView.setOnClickListener {
            if (isSingle) {
                toAddDevice()
            }
        }

    }

    public fun toAddDevice(isAuto: Boolean = false){
        if(onDeviceFindListener != null){
            onDeviceFindListener?.toAddDevice()
        }
        context.startActivity(Intent(context, AddDeviceActivity::class.java)
            .putExtra("product_data", JsonUtils.toJson(data))
            .putExtra("isAuto",isAuto)
        )
    }

    public interface OnDeviceFindListener {
        fun toAddDevice()
    }
}
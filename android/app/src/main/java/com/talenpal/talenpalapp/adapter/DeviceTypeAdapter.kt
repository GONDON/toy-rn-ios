package com.talenpal.talenpalapp.adapter

import android.content.Intent
import android.widget.TextView
import com.bumptech.glide.Glide
import com.chad.library.adapter.base.BaseQuickAdapter
import com.chad.library.adapter.base.viewholder.BaseViewHolder
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.http.model.DollModel
import com.talenpal.talenpalapp.ui.device.RebootDeviceActivity

class DeviceTypeAdapter:BaseQuickAdapter<DollModel, BaseViewHolder>(R.layout.item_device_type) {
    override fun convert(holder: BaseViewHolder, item: DollModel) {
        Glide.with(context).load(item.coverImg).into(holder.getView(R.id.iv_icon))
        holder.getView<TextView>(R.id.iv_name).text = "${item.name}_${item.model}"
        holder.itemView.setOnClickListener {
            //手动配网
            context.startActivity(Intent(context,RebootDeviceActivity::class.java))
        }
    }
}
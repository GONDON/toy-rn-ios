package com.talenpal.talenpalapp.adapter

import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.view.View
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.chad.library.adapter.base.BaseQuickAdapter
import com.chad.library.adapter.base.listener.OnItemDragListener
import com.chad.library.adapter.base.module.DraggableModule
import com.chad.library.adapter.base.viewholder.BaseViewHolder
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.ui.device.MyDevicesActivity
import com.talenpal.talenpalapp.util.ToastUtil
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.sdk.api.IResultCallback
import com.thingclips.smart.sdk.bean.DeviceBean


class HomeDevicesAdapter : BaseQuickAdapter<DeviceBean, BaseViewHolder>(R.layout.item_home_devices),
    DraggableModule {
//    private var selectedIds = mutableListOf<String>()
    public var selectedId =  ""
    var isManager = false
    private var shakeAnimation: Animation? = null
    public var isHome = false
    init {
        draggableModule.setOnItemDragListener(object : OnItemDragListener {
            override fun onItemDragStart(viewHolder: RecyclerView.ViewHolder?, pos: Int) {
            }

            override fun onItemDragMoving(
                source: RecyclerView.ViewHolder?,
                from: Int,
                target: RecyclerView.ViewHolder?,
                to: Int
            ) {
            }

            override fun onItemDragEnd(viewHolder: RecyclerView.ViewHolder?, pos: Int) {
            }
        })
    }

    fun setIsManager(isManager: Boolean) {
        this.isManager = isManager
        draggableModule.isDragEnabled = isManager
        notifyDataSetChanged()
    }

    override fun convert(holder: BaseViewHolder, item: DeviceBean) {
        val itemPosition = holder.layoutPosition
        if (itemPosition == RecyclerView.NO_POSITION) return

        holder.getView<TextView>(R.id.tv_device_name).text = item.name
        holder.getView<TextView>(R.id.tv_online_state).text = if (item.isOnline) {
            context.getString(R.string.thing_smart_scene_device_online)
        } else {
            context.getString(R.string.thing_smart_scene_device_offline)
        }
        holder.getView<ImageView>(R.id.iv_online_state).setImageResource(if (item.isOnline) R.mipmap.icon_wifi_online else R.mipmap.icon_wifi_offline)

        setShapeBackgroundColor(
            holder.getView(R.id.fl_root),
            Color.parseColor(getItemBgColor(itemPosition))
        )
        holder.setText(R.id.tv_position, "${itemPosition+1}")

        holder.getView<ImageView>(R.id.iv_check).visibility =
            if (isManager) View.VISIBLE else View.GONE
        holder.getView<TextView>(R.id.tv_position).visibility =
            if (isManager) View.GONE else View.VISIBLE

//        if (selectedIds.contains(item.devId)) {
        if(selectedId.equals(item.devId)){
            holder.getView<ImageView>(R.id.iv_check)
                .setImageResource(R.mipmap.icon_check_circle_blue)
        } else {
            holder.getView<ImageView>(R.id.iv_check)
                .setImageResource(R.mipmap.icon_check_circle_grey)
        }
        if (isManager) {
            startShakeAnimation(holder.itemView)
            holder.getView<TextView>(R.id.tv_position).visibility = View.GONE
        } else {
            stopShakeAnimation(holder.itemView)
            if(!isHome && itemPosition < 2){//只有前两个显示排序
                holder.getView<TextView>(R.id.tv_position).visibility = View.VISIBLE
            }else{
                holder.getView<TextView>(R.id.tv_position).visibility = View.GONE
            }
        }
        // 保持原有的点击事件监听器
        holder.getView<ImageView>(R.id.iv_check).setOnClickListener {
            // 选中
//            if (selectedIds.contains(item.devId)) {
//                selectedIds.remove(item.devId)
//            } else {
//                selectedIds.add(item.devId)
//            }
            if(selectedId.equals(item.devId)){
                selectedId = ""
            } else {
                selectedId = item.devId
            }
            notifyItemChanged(holder.layoutPosition)
        }

        if(isHome){
            holder.itemView.setOnLongClickListener {
                context.startActivity(Intent(context,MyDevicesActivity::class.java))
                return@setOnLongClickListener true
            }
        }
    }

    //操作置顶，置顶到第一个
    public fun pinToup(){
        if(data == null || data.size <= 0)return
        var position = -1
        for (i  in 0 until data.size){
            if(data[i].devId.equals(selectedId)){
                position = i
            }
        }
        if(position > 0){
            notifyItemMoved(position,0)
        }
    }

    // 启动抖动动画
    private fun startShakeAnimation(view: View) {
        if (shakeAnimation == null) {
            // 只初始化一次
            shakeAnimation = AnimationUtils.loadAnimation(context, R.anim.shake_animation)
        }
        view.startAnimation(shakeAnimation)
    }

    // 停止抖动动画
    private fun stopShakeAnimation(view: View) {
        view.clearAnimation()
    }

    override fun onViewRecycled(holder: BaseViewHolder) {
        super.onViewRecycled(holder)
        // 确保视图未被销毁
        stopShakeAnimation(holder.itemView)
    }

    /**
     * 动态修改 Shape 背景颜色
     */
    private fun setShapeBackgroundColor(view: View, color: Int) {
        val background = view.background
        if (background is GradientDrawable) {
            background.setColor(color)
        }
    }

    private fun getItemBgColor(position: Int): String {
        val colors = arrayOf(
            "#e4f2fe", "#faf6e4", "#f8e9dd", "#ede7fc", "#daeeec",
            "#fce7f8", "#f9dede", "#daf2f9", "#dce2f7", "#e6f8e9",
        )
        return colors[position % 10]
    }
}
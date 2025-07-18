package com.talenpal.talenpalapp.adapter

import android.graphics.drawable.Drawable
import android.view.View
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.bitmap.RoundedCorners
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition
import com.chad.library.adapter.base.BaseQuickAdapter
import com.chad.library.adapter.base.listener.OnItemDragListener
import com.chad.library.adapter.base.module.DraggableModule
import com.chad.library.adapter.base.viewholder.BaseViewHolder
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.app.TalenpalApplication
import com.talenpal.talenpalapp.http.model.DollItemModel
import com.talenpal.talenpalapp.util.ViewDrawUtils
import org.xutils.common.util.DensityUtil

class HomeToysAdapter : BaseQuickAdapter<DollItemModel, BaseViewHolder>(R.layout.item_home_toys),DraggableModule{
    private var selectedIds = mutableListOf<Int>()
    var isManager = false
    var isHomeDisplay = false

    private var shakeAnimation: Animation? = null
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
    fun setIsManager(isManager:Boolean){
        this.isManager = isManager
        draggableModule.isDragEnabled = isManager
        notifyDataSetChanged()
    }
    override fun convert(holder: BaseViewHolder, item: DollItemModel) {
        if(isHomeDisplay) {
            val layoutParams = holder.itemView.layoutParams
            layoutParams.width =
                DensityUtil.getScreenWidth() - DensityUtil.dip2px(50f) // 像素值，或通过资源获取 dp 值
            holder.itemView.layoutParams = layoutParams
        }
        ViewDrawUtils.viewWidthFindHeight(holder.getView(R.id.rl_content),(335f/120f).toDouble())

        val itemPosition = holder.bindingAdapterPosition
        holder.setText(R.id.tv_position, "${itemPosition+1}")

        holder.setText(R.id.tv_toy_name, item.dollModel.name)
        holder.setText(R.id.tv_stories,"${item.totalStoryNum} ${context.getString(R.string.stories)}")
        holder.setText(R.id.tv_toy_duration, "${durationToTimeStr(item.totalStoryDuration)}")
        holder.getView<TextView>(R.id.tv_diy_mark).visibility = if(item.dollModel.type == "creative") View.VISIBLE else View.GONE
        Glide.with(context).load(item.dollModel.coverImg).into(holder.getView(R.id.iv_doll))
        Glide.with(context)
            .load(item.dollModel.backgroundImg)
            .placeholder(R.mipmap.home_toys_item_bg) // 加载中显示的图片
            .error(R.mipmap.home_toys_item_bg)        // 加载失败显示的图片
            .transform(RoundedCorners(DensityUtil.dip2px(30f)))
            .into(object : CustomTarget<Drawable>() {
                override fun onResourceReady(
                    resource: Drawable,
                    transition: Transition<in Drawable>?
                ) {
                    holder.getView<View>(R.id.rl_content).background = resource
                }

                override fun onLoadCleared(placeholder: Drawable?) {
                }
            })

        holder.getView<ImageView>(R.id.iv_check).visibility = if(isManager) View.VISIBLE else View.GONE
        holder.getView<TextView>(R.id.tv_position).visibility = if(isManager) View.GONE else View.VISIBLE

        if(selectedIds.contains(item.id)){
            holder.getView<ImageView>(R.id.iv_check).setImageResource(R.mipmap.icon_check_circle_blue)
        }else{
            holder.getView<ImageView>(R.id.iv_check).setImageResource(R.mipmap.icon_check_circle_grey)
        }

        if (isManager) {
            startShakeAnimation(holder.itemView)
            holder.getView<TextView>(R.id.tv_position).visibility = View.GONE
        } else {
            stopShakeAnimation(holder.itemView)
            if(!isHomeDisplay && itemPosition < 2){//只有前两个显示排序
                holder.getView<TextView>(R.id.tv_position).visibility = View.VISIBLE
            }else{
                holder.getView<TextView>(R.id.tv_position).visibility = View.GONE
            }
        }
        holder.getView<ImageView>(R.id.iv_check).setOnClickListener{
            // 选中
            if(selectedIds.contains(item.id)){
                selectedIds.remove(item.id)
            }else{
                selectedIds.add(item.id)
            }
            notifyItemChanged(holder.bindingAdapterPosition)
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

    private fun durationToTimeStr(duration: Int): String {
        val hours = duration / 3600
        val minutes = (duration % 3600) / 60

        return when {
            hours > 0 && minutes > 0 -> "$hours hrs $minutes mins"
            hours > 0 -> "$hours hrs"
            minutes > 0 -> "$minutes mins"
            else -> "0 mins" // 处理0秒的情况
        }
    }
}
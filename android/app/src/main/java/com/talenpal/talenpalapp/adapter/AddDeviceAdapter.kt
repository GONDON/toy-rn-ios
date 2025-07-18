package com.talenpal.talenpalapp.adapter

import android.graphics.Color
import android.os.CountDownTimer
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.RelativeLayout
import android.widget.TextView
import com.bumptech.glide.Glide
import com.chad.library.adapter.base.BaseQuickAdapter
import com.chad.library.adapter.base.viewholder.BaseViewHolder
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.bean.CustomScanDeviceBean
import com.talenpal.talenpalapp.config.Constant
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.listener.WorkListener
import com.talenpal.talenpalapp.view.CircleProgress
import `in`.xiandan.countdowntimer.CountDownTimerSupport
import `in`.xiandan.countdowntimer.OnCountDownTimerListener
import kotlin.concurrent.timer


class AddDeviceAdapter :
    BaseQuickAdapter<CustomScanDeviceBean, BaseViewHolder>(R.layout.item_add_device) {
    var onAddListener: onAddDeviceListener? = null

    // 新增：维护productId与定时器的映射
    private val timerMap = mutableMapOf<String, CountDownTimerSupport>()
    override fun convert(holder: BaseViewHolder, item: CustomScanDeviceBean) {
        val position = holder.layoutPosition

        Glide.with(context).load(item.icon).into(holder.getView(R.id.iv_doll))
        holder.getView<TextView>(R.id.tv_device_name).text = item.name

        //配网状态 0:未配网 1:配网中 2:配网成功 3：配网失败
        if (item.state == 1) {
            //连接中 配网中
            holder.getView<TextView>(R.id.tv_device_state).text = context.getString(R.string.devices_adding_in)
            holder.getView<TextView>(R.id.tv_device_state)
                .setTextColor(Color.parseColor("#80000000"))
            holder.getView<Button>(R.id.btn_add).visibility = View.GONE
            holder.getView<RelativeLayout>(R.id.rl_progress).visibility = View.VISIBLE
            holder.getView<ImageView>(R.id.iv_error).visibility = View.GONE
            holder.getView<ImageView>(R.id.iv_edit).visibility = View.GONE
            holder.getView<ImageView>(R.id.iv_checked).visibility = View.GONE
        } else if (item.state == 2) {
            //连接成功 配网成功
            holder.getView<TextView>(R.id.tv_device_state).text = "Added"
            holder.getView<TextView>(R.id.tv_device_state)
                .setTextColor(Color.parseColor("#80000000"))
            holder.getView<Button>(R.id.btn_add).visibility = View.GONE
            holder.getView<RelativeLayout>(R.id.rl_progress).visibility = View.GONE
            holder.getView<ImageView>(R.id.iv_error).visibility = View.GONE
            holder.getView<ImageView>(R.id.iv_edit).visibility = View.VISIBLE
            holder.getView<ImageView>(R.id.iv_checked).visibility = View.VISIBLE
            holder.getView<ImageView>(R.id.iv_edit).setOnClickListener {
                DialogHelper.showEditDialog(
                    context,
                    context.getString(R.string.rename_device),
                    item.name,
                    object : WorkListener() {
                        override fun onSuccess(`object`: Any?) {
                            if (onAddListener != null) {
                                onAddListener?.onEditDevice(position, item, `object` as String)
                            }
                        }
                    })
            }
        } else if (item.state == 3) {
            //连接失败 配网失败
            holder.getView<TextView>(R.id.tv_device_state).text = context.getString(R.string.devices_add_failed)
            holder.getView<TextView>(R.id.tv_device_state)
                .setTextColor(Color.parseColor("#ffFF4400"))
            holder.getView<Button>(R.id.btn_add).visibility = View.GONE
            holder.getView<RelativeLayout>(R.id.rl_progress).visibility = View.GONE
            holder.getView<ImageView>(R.id.iv_error).visibility = View.VISIBLE
            holder.getView<ImageView>(R.id.iv_edit).visibility = View.GONE
            holder.getView<ImageView>(R.id.iv_checked).visibility = View.GONE
        } else {
            //待添加 待配网
            holder.getView<TextView>(R.id.tv_device_state).text = context.getString(R.string.devices_pending)
            holder.getView<TextView>(R.id.tv_device_state)
                .setTextColor(Color.parseColor("#80000000"))
            holder.getView<Button>(R.id.btn_add).visibility = View.VISIBLE
            holder.getView<RelativeLayout>(R.id.rl_progress).visibility = View.GONE
            holder.getView<ImageView>(R.id.iv_error).visibility = View.GONE
            holder.getView<ImageView>(R.id.iv_edit).visibility = View.GONE
            holder.getView<ImageView>(R.id.iv_checked).visibility = View.GONE
        }

        holder.getView<Button>(R.id.btn_add).setOnClickListener {
            if (onAddListener != null) {
                onAddListener?.onAddDevice(position, item)
            }
        }
    }

    public fun getCountByState(state: Int): Int {
        var count = 0
        for (i in data.indices) {
            if (data[i].state == state) {
                count++
            }
        }
        return count
    }

    public fun getPositionByProductId(productId: String): Int {
        for (i in data.indices) {
            if (data[i].productId == productId) {
                return i
            }
        }
        return -1
    }

    public fun updateStateByPId(productId: String, state: Int) {
        if (productId.isEmpty()) return
        var position = getPositionByProductId(productId)
        if (position == -1) return
        var itemData = data[position]
        itemData.state = state

        //重置待入网状态
        if (state != 0) {
            itemData.isPConnect = false
        }

        if (state != 1) { // 非配网中状态
            timerMap[productId]?.stop()
            timerMap.remove(productId)
        }

        notifyItemChanged(position)
    }

    fun updateDevIdByPId(productId: String, devId: String) {
        if (productId.isEmpty()) return
        if (devId.isEmpty()) return
        var position = getPositionByProductId(productId)
        if (position == -1) return
        var itemData = data[position]
        itemData.devId = devId
        notifyItemChanged(position)
    }

    //自动配网
    fun autoConnect() {
        if(data == null || data.size <= 0)return
        val mBtnAdd = getViewByPosition(0,R.id.btn_add) as Button
        mBtnAdd.performClick()
    }

    public interface onAddDeviceListener {
        fun onAddDevice(position: Int, productInfoBean: CustomScanDeviceBean)
        fun onEditDevice(position: Int, productInfoBean: CustomScanDeviceBean, name: String)
    }

    fun startTimer(productId: String) {
        // 清除旧定时器
        timerMap[productId]?.stop()
        timerMap.remove(productId)

        var timer = CountDownTimerSupport(
            60 * 1000,
            Constant.COUNT_DOWN_INTERVAL
        )
        timer.setOnCountDownTimerListener(object : OnCountDownTimerListener {
            override fun onTick(millisUntilFinished: Long) {
                val remainingSeconds = (millisUntilFinished / Constant.COUNT_DOWN_INTERVAL).toInt()
                var progress = (60 - remainingSeconds).toFloat()

                // 通过产品ID找到当前正确的进度条
                val currentPosition = getPositionByProductId(productId)
                if (currentPosition != -1) {
                    val progressBar = getViewByPosition(currentPosition, R.id.progress) as CircleProgress
                    progressBar.value = progress

                    if(progress >= 50){
                        timer.stop()
                    }
                }
            }

            override fun onFinish() {
                timerMap.remove(productId)
            }

            override fun onCancel() {
                timerMap.remove(productId)
            }

        })
        timer.start()
        timerMap[productId] = timer
    }
}
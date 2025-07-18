package com.talenpal.talenpalapp.adapter

import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import com.chad.library.adapter.base.BaseQuickAdapter
import com.chad.library.adapter.base.viewholder.BaseViewHolder
import com.talenpal.talenpalapp.R
import com.thingclips.smart.android.ble.api.WiFiInfo
import com.thingclips.smart.android.common.utils.WiFiUtil

class WifiConnectAdapter :BaseQuickAdapter<WiFiInfo, BaseViewHolder>(R.layout.item_wifi_connect){
    var listener: WifiConnectListener? = null
    override fun convert(holder: BaseViewHolder, item: WiFiInfo) {
        holder.getView<TextView>(R.id.tv_wifi_name).text = item.ssid

//        WAAM_OPEN (0) 开放，不需要密码
//        WAAM_WEP (1) WEP加密方式，需要密码（安全性较低）。
//        WAAM_WPA_PSK (2) WPA-PSK加密方式，需要密码。
//        WAAM_WPA2_PSK (3) WPA2-PSK加密方式，需要密码（当前主流加密）。
//        WAAM_WPA_WPA2_PSK (4) WPA/WPA2混合加密方式，需要密码。
//        WAAM_WPA_WPA3_SAE (5) WPA3-SA加密方式（最新标准），需要密码。
//        WAAM_UNKNOWN (6) 未知加密类型，默认需要密码（安全起见）。
        holder.getView<ImageView>(R.id.iv_wifi_lock).visibility = if(item.sec == WiFiUtil.WIFICIPHER_NOPASS) View.GONE else View.VISIBLE
        holder.getView<ImageView>(R.id.iv_wifi_level).setImageResource(getWifiLevelImg(item.rssi))

        holder.itemView.setOnClickListener {
            if(listener != null){
                listener?.onConnect(item)
            }
        }
    }

    private fun getWifiLevelImg(rssi: Int):Int{
        if(rssi > -50) {//信号极强
            return R.mipmap.ic_wifi4
        }else if(rssi > -65){//信号强
            return R.mipmap.ic_wifi3
        }else if (rssi > -75){//信号中
            return R.mipmap.ic_wifi2
        }else if (rssi > -85){//信号弱
            return R.mipmap.ic_wifi1
        }else {//信号极弱
            return R.mipmap.ic_wifi0
        }
    }

    interface WifiConnectListener{
        fun onConnect(wifiInfo: WiFiInfo)
    }

}
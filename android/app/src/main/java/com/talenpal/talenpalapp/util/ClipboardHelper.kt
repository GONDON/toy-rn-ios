package com.talenpal.talenpalapp.util

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import com.talenpal.talenpalapp.app.TalenpalApplication

class ClipboardHelper {
    companion object {
        fun copyToClipboard(text: String, label: String) {
            // 获取系统剪贴板服务
            val clipboard = TalenpalApplication.context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager

            // 创建包含文本的ClipData对象
            val clip = ClipData.newPlainText(label, text)

            // 将数据设置到剪贴板
            clipboard.setPrimaryClip(clip)
        }
    }

}
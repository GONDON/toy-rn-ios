package com.talenpal.talenpalapp.ui.other

import com.talenpal.talenpalapp.databinding.ActivityWebBinding
import com.talenpal.talenpalapp.ui.base.BaseActivity

class WebActivity : BaseActivity<ActivityWebBinding>() {
    override fun initView() {
        setTitle(intent.getStringExtra("title"))

        binding.webview.apply {
            settings.run {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = false
            }
        }
    }

    override fun initData() {
        var url = intent.getStringExtra("url") ?: "" // 从 Intent 获取 URL
        if (url.isNotEmpty()) {
            binding.webview.loadUrl(url)
        }
    }
}
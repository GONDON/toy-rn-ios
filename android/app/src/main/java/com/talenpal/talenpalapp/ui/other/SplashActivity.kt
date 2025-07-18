package com.talenpal.talenpalapp.ui.other

import android.content.Intent
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.databinding.ActivitySplashBinding
import com.talenpal.talenpalapp.ui.MainActivity
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.StatusBarUtil

class SplashActivity : BaseActivity<ActivitySplashBinding>() {
    override fun isImmersion(): Boolean {
        return true
    }
    override fun isExitApp(): Boolean {
        return true
    }
    override fun initView() {
        StatusBarUtil.setImmersionBar( this,true)
        binding.btnGoTo.setOnClickListener {
            startActivity(
                Intent(this, MainActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
            )
        }
    }

    override fun initData() {
        AppConfig.setFirstInstall(true)
    }
}
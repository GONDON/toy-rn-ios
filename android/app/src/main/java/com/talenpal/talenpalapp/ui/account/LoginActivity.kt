package com.talenpal.talenpalapp.ui.account

import android.content.Intent
import android.view.View
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityLoginBinding
import com.talenpal.talenpalapp.manager.ActManager
import com.talenpal.talenpalapp.ui.MainActivity
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.EventBusUtil

class LoginActivity : BaseActivity<ActivityLoginBinding>() {

    override fun beforeContentView() {
        setTheme(R.style.Theme_Talpanpal);
    }
    override fun isImmersion(): Boolean {
        return true
    }

    override fun isExitApp(): Boolean {
        return true
    }

    override fun initView() {
        binding.btnRegister.setOnClickListener { v -> onClick(v) }
        binding.btnLogin.setOnClickListener { v -> onClick(v) }

        //是否登录过
        if(AppConfig.isLogin()){
            startActivity(Intent(this, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK))
            this.finish()
        }

    }


    fun onClick(v: View?) {
        when (v?.id) {
            R.id.btn_register -> {
                startActivity(Intent(this, RegisterActivity::class.java))
            }

            R.id.btn_login -> {
                startActivity(Intent(this, LoginPwdActivity::class.java))
            }
        }
    }

    override fun initData() {
    }

    override fun receiveEvent(event: EventBusUtil.MessageEvent?) {
        super.receiveEvent(event)
        when (event?.code) {
            EventCode.EVENT_FILL_INPUT -> {
                if (!ActManager.getAppManager().containsActivity(LoginPwdActivity::class.java)) {
                    startActivity(Intent(this, LoginPwdActivity::class.java)
                        .putExtra("password_success", true)
                    )
                }
            }
        }
    }
}
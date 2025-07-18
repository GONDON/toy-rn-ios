package com.talenpal.talenpalapp.ui.account

import android.content.Intent
import android.text.Editable
import android.text.TextWatcher
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.config.Constant
import com.talenpal.talenpalapp.databinding.ActivityForgotPwdBinding
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.ToastUtil
import com.talenpal.talenpalapp.util.Validator
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.sdk.api.IResultCallback


class ForgotPwdActivity : BaseActivity<ActivityForgotPwdBinding>() {
    override fun initView() {
        val formAccount = intent.getStringExtra("account")
        if(!formAccount.isNullOrEmpty()){
            binding.etUserName.setText(formAccount)
        }

        binding.etUserName.addTextChangedListener(textWatcher)
        binding.btnVerificationCode.setOnClickListener {
            forgotPwdFun()
        }

        // 初始状态检查
        updateLoginButtonState();
    }

    override fun initData() {
    }

    private fun forgotPwdFun() {
        binding.btnVerificationCode.isEnabled = false
        val userName: String = binding.etUserName.text.toString().trim()
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getUserInstance().sendVerifyCodeWithUserName(userName,
            "",
            Constant.CountryCode,
            Constant.SEND_TYPE_FORGET,
            object : IResultCallback {
                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    binding.btnVerificationCode.isEnabled = true
                    ToastUtil.showToast(error)
                }

                override fun onSuccess() {
                    LoadingHelper.getInstance().hideLoading()
                    binding.btnVerificationCode.isEnabled = true
                    AppConfig.setUserNameTemp(userName)
                    startActivity(
                        Intent(
                            this@ForgotPwdActivity,
                            VerificationCodeActivity::class.java
                        ).putExtra("sendType", Constant.SEND_TYPE_FORGET)
                    )
                }

            });
    }

    // 文本监听器
    private val textWatcher: TextWatcher = object : TextWatcher {
        override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {
            // 不需要实现
        }

        override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
            // 当文本改变时更新按钮状态
            updateLoginButtonState()
        }

        override fun afterTextChanged(s: Editable) {
            // 不需要实现
        }
    }

    // 更新登录按钮状态
    private fun updateLoginButtonState() {
        val userName: String = binding.etUserName.text.toString().trim()
        if (userName.isNotEmpty() && !Validator.isValidEmail(userName)) {
            binding.tvErrTip.text = getString(R.string.email_check)
        } else {
            binding.tvErrTip.text = ""
        }

        val isInputValid = userName.isNotEmpty() && Validator.isValidEmail(userName)
        binding.btnVerificationCode.isEnabled = isInputValid
    }
}
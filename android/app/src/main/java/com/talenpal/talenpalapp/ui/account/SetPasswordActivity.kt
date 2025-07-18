package com.talenpal.talenpalapp.ui.account

import android.graphics.Color
import android.text.Editable
import android.text.TextWatcher
import android.text.method.PasswordTransformationMethod
import android.util.Log
import android.view.View
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.config.Constant
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivitySetPasswordBinding
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.manager.ActManager
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.talenpal.talenpalapp.util.Validator
import com.thingclips.smart.android.user.api.IRegisterCallback
import com.thingclips.smart.android.user.api.IResetPasswordCallback
import com.thingclips.smart.android.user.bean.User
import com.thingclips.smart.home.sdk.ThingHomeSdk

class SetPasswordActivity : BaseActivity<ActivitySetPasswordBinding>() {
    private var isPasswordVisibleNew = false
    private var isPasswordVisibleAgain = false
    private var mSendType = 1
    private var verificationCode = ""
    override fun initView() {
        mSendType = intent.getIntExtra("sendType", 1)
        verificationCode = intent.getStringExtra("verificationCode").toString()
        binding.tvTitle.text =
            if (mSendType == Constant.SEND_TYPE_REGISTER) getString(R.string.set_password) else getString(
                R.string.new_password
            )
        binding.etPasswordNew.addTextChangedListener(textWatcher)
        binding.etPasswordAgain.addTextChangedListener(textWatcher)

        binding.ivClearTextNew.setOnClickListener { v -> onClick(v) }
        binding.ivVisibilityToggleNew.setOnClickListener { v -> onClick(v) }
        binding.ivClearTextAgain.setOnClickListener { v -> onClick(v) }
        binding.ivVisibilityToggleAgain.setOnClickListener { v -> onClick(v) }
        binding.btnConfirm.setOnClickListener { v -> onClick(v) }

        Log.e("mSendType", mSendType.toString())
        binding.containerPasswordAgain.visibility =
            if (mSendType == Constant.SEND_TYPE_REGISTER) View.VISIBLE else View.GONE

        // 初始状态检查
        updateLoginButtonState()
    }

    override fun initData() {
    }

    fun onClick(v: View?) {
        when (v?.id) {
            R.id.btn_confirm -> {
                commit()
            }

            R.id.iv_clear_text_new -> {
                binding.etPasswordNew.text?.clear()
            }

            R.id.iv_visibility_toggle_new -> {
                toggleVisiblePasswordNew()
            }

            R.id.iv_clear_text_again -> {
                binding.etPasswordAgain.text?.clear()
            }

            R.id.iv_visibility_toggle_again -> {
                toggleVisiblePasswordAgain()
            }
        }
    }

    private fun commit() {
        binding.btnConfirm.isEnabled = false
        var password = binding.etPasswordNew.text.toString()
        if (mSendType == Constant.SEND_TYPE_REGISTER) {
            registerRequestFun(password)
        } else {
            forgotPwdRequestFun(password)
        }
    }

    //注册
    fun registerRequestFun(password: String) {
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getUserInstance().registerAccountWithEmail(
            Constant.CountryCode,
            AppConfig.getUserNameTemp(),
            password,
            verificationCode,
            object : IRegisterCallback {
                override fun onSuccess(user: User?) {
                    LoadingHelper.getInstance().hideLoading()
                    binding.btnConfirm.isEnabled = true
                    AppConfig.setPasswordTemp(password)//保存密码
                    EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_FILL_INPUT))
                    if (mSendType == Constant.SEND_TYPE_REGISTER){
                        ToastUtil.showToast(getString(R.string.register_success))
                    }else{
                        ToastUtil.showToast(getString(R.string.set_success))
                    }
                    this@SetPasswordActivity.finish()
                    ActManager.getAppManager()
                        .clearAllExcept(LoginActivity::class.java, LoginPwdActivity::class.java)
                }

                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    binding.btnConfirm.isEnabled = true
                    ToastUtil.showToast(error)
                }

            }
        );
    }

    //找回密码
    fun forgotPwdRequestFun(password: String) {
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getUserInstance().resetEmailPassword(
            Constant.CountryCode,
            AppConfig.getUserNameTemp(),
            verificationCode,
            password,
            object : IResetPasswordCallback {
                override fun onSuccess() {
                    LoadingHelper.getInstance().hideLoading()
                    binding.btnConfirm.isEnabled = true
                    AppConfig.setPasswordTemp(password)//保存密码
                    EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_FILL_INPUT))
                    this@SetPasswordActivity.finish()
                    ActManager.getAppManager()
                        .clearAllExcept(LoginActivity::class.java, LoginPwdActivity::class.java)
                }

                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    binding.btnConfirm.isEnabled = true
                    ToastUtil.showToast(error)
                }

            }
        )
    }


    // 密码可见性切换功能
    fun toggleVisiblePasswordNew() {
        isPasswordVisibleNew = !isPasswordVisibleNew
        if (isPasswordVisibleNew) {
            binding.etPasswordNew.transformationMethod = null
            binding.ivVisibilityToggleNew.setImageResource(R.mipmap.icon_pwd_visibility_off)
        } else {
            binding.etPasswordNew.transformationMethod = PasswordTransformationMethod.getInstance()
            binding.ivVisibilityToggleNew.setImageResource(R.mipmap.icon_pwd_visibility_open)
        }
    }

    fun toggleVisiblePasswordAgain() {
        isPasswordVisibleAgain = !isPasswordVisibleAgain
        if (isPasswordVisibleAgain) {
            binding.etPasswordAgain.transformationMethod = null
            binding.ivVisibilityToggleAgain.setImageResource(R.mipmap.icon_pwd_visibility_off)
        } else {
            binding.etPasswordAgain.transformationMethod =
                PasswordTransformationMethod.getInstance()
            binding.ivVisibilityToggleAgain.setImageResource(R.mipmap.icon_pwd_visibility_open)
        }
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
            //no thing
        }
    }

    // 更新登录按钮状态
    private fun updateLoginButtonState() {
        val newPwd: String = binding.etPasswordNew.text.toString().trim()
        val againPwd: String = binding.etPasswordAgain.text.toString().trim()

        binding.ivClearTextNew.visibility = if (newPwd.isNotEmpty()) View.VISIBLE else View.GONE
        binding.ivClearTextAgain.visibility = if (againPwd.isNotEmpty()) View.VISIBLE else View.GONE

        if (mSendType == Constant.SEND_TYPE_REGISTER) {
            if (newPwd.isNotEmpty() && !Validator.isValidPassword(newPwd)) {
                binding.tvInfoTip.text = getString(R.string.password_check)
                binding.tvInfoTip.setTextColor(getColor(R.color.errColor))
            } else if (againPwd.isNotEmpty() && !Validator.isValidPassword(againPwd)) {
                binding.tvInfoTip.text = getString(R.string.password_check)
                binding.tvInfoTip.setTextColor(getColor(R.color.errColor))
            } else if (newPwd.isNotEmpty() && againPwd.isNotEmpty() && newPwd != againPwd) {
                binding.tvInfoTip.text = getString(R.string.password_no_match)
                binding.tvInfoTip.setTextColor(getColor(R.color.errColor))
            } else {
                binding.tvInfoTip.text = getString(R.string.password_check)
                binding.tvInfoTip.setTextColor(Color.parseColor("#4d000000"))
            }
        } else {
            if (newPwd.isNotEmpty() && !Validator.isValidPassword(newPwd)) {
                binding.tvInfoTip.text = getString(R.string.password_check)
                binding.tvInfoTip.setTextColor(getColor(R.color.errColor))
            } else {
                binding.tvInfoTip.text = getString(R.string.password_check)
                binding.tvInfoTip.setTextColor(Color.parseColor("#4d000000"))
            }
        }
        var isInputValid = false
        if (mSendType == Constant.SEND_TYPE_REGISTER) {
            isInputValid = newPwd.isNotEmpty() && againPwd.isNotEmpty()
                    && Validator.isValidPassword(newPwd) && Validator.isValidPassword(againPwd)
                    && newPwd == againPwd
        }else{
            isInputValid = newPwd.isNotEmpty() && Validator.isValidPassword(newPwd)
        }
        binding.btnConfirm.isEnabled = isInputValid
    }
}
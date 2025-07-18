package com.talenpal.talenpalapp.ui.account

import android.content.Intent
import android.text.Editable
import android.text.TextWatcher
import android.text.method.PasswordTransformationMethod
import android.view.View
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.config.Constant
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityLoginPwdBinding
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.listener.WorkListener
import com.talenpal.talenpalapp.manager.ActManager
import com.talenpal.talenpalapp.manager.LoginManager
import com.talenpal.talenpalapp.ui.MainActivity
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.ui.other.SplashActivity
import com.talenpal.talenpalapp.ui.other.WebActivity
import com.talenpal.talenpalapp.util.DataUtils
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.talenpal.talenpalapp.util.Validator
import com.talenpal.talenpalapp.view.ClickableTextView
import com.thingclips.smart.android.user.api.ILoginCallback
import com.thingclips.smart.android.user.bean.User
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.bean.HomeBean
import com.thingclips.smart.home.sdk.callback.IThingGetHomeListCallback
import com.thingclips.smart.home.sdk.callback.IThingHomeResultCallback


class LoginPwdActivity : BaseActivity<ActivityLoginPwdBinding>() {
    var isPasswordVisible = false
    override fun initView() {
        setRightText(getString(R.string.btn_register))
        initAgreeText()
        //填充数据
        if (intent.getBooleanExtra("password_success", false)) {
            fillAccoutData()
        }

        binding.btnLogin.setOnClickListener { v -> onClick(v) }
        binding.btnForgotPassword.setOnClickListener { v -> onClick(v) }

        // 添加文本监听器
        binding.etAccount.addTextChangedListener(loginTextWatcher)
        binding.etPassword.addTextChangedListener(loginTextWatcher)

        binding.ivClearText.setOnClickListener { v -> onClick(v) }
        binding.ivVisibilityToggle.setOnClickListener { v -> onClick(v) }

        // 初始状态检查
        updateLoginButtonState();

    }

    override fun onRightBtnClickListener() {
        startActivity(Intent(this, RegisterActivity::class.java))
    }

    fun onClick(v: View?) {
        when (v?.id) {
            R.id.btn_login -> {
                login()
            }

            R.id.btn_forgot_password -> {
                startActivity(Intent(this, ForgotPwdActivity::class.java)
                    .putExtra("account", binding.etAccount.text.toString())
                )
            }

            R.id.iv_clear_text -> {
                binding.etPassword.text?.clear()
            }

            R.id.iv_visibility_toggle -> {
                toggleVisiblePassword()
            }
        }
    }

    override fun initData() {
    }

    // 密码可见性切换功能
    fun toggleVisiblePassword() {
        isPasswordVisible = !isPasswordVisible
        if (isPasswordVisible) {
            binding.etPassword.transformationMethod = null
            binding.ivVisibilityToggle.setImageResource(R.mipmap.icon_pwd_visibility_off)
        } else {
            binding.etPassword.transformationMethod = PasswordTransformationMethod.getInstance()
            binding.ivVisibilityToggle.setImageResource(R.mipmap.icon_pwd_visibility_open)
        }
    }

    fun login() {
        if (!binding.cbAgreen.isChecked) {
            ToastUtil.showToast(getString(R.string.thing_agree_privacy_and_service_attention))
            return
        }
        binding.btnLogin.isEnabled = false
        val account = binding.etAccount.text.toString()
        val password = binding.etPassword.text.toString()

        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getUserInstance().loginWithEmail(
            Constant.CountryCode,
            account,
            password,
            object : ILoginCallback {
                override fun onSuccess(user: User?) {
                    AppConfig.saveUser(user)
                    checkHome()//检查是否有默认家庭
                    val userId = user?.uid
                    //sass登录
                    LoginManager.sassLogin(userId!!, DataUtils.makeMD5(userId),object : WorkListener(){
                        override fun onSuccess(model: Any?) {
                            LoadingHelper.getInstance().hideLoading()
                            binding.btnLogin.isEnabled = true
                            if(!AppConfig.isFirstInstall()){
                                //第一次安装  权限提示页
                                startActivity(Intent(this@LoginPwdActivity, SplashActivity::class.java))
                                ActManager.getAppManager().clearAllExcept(SplashActivity::class.java)
                            }else{
                                startActivity(
                                    Intent(this@LoginPwdActivity, MainActivity::class.java)
                                        .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
                                )
                            }
                        }
                        override fun failed(code: String?, msg: String?) {
                            LoadingHelper.getInstance().hideLoading()
                            binding.btnLogin.isEnabled = true
                            ToastUtil.showToast(msg)
                        }
                    })
                }

                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    binding.btnLogin.isEnabled = true
                    ToastUtil.showToast(error)
                }

            }
        )
    }

    // 文本监听器
    private val loginTextWatcher: TextWatcher = object : TextWatcher {
        override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {
            // 不需要实现
        }

        override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
            // 当文本改变时更新按钮状态
            updateLoginButtonState()
        }

        override fun afterTextChanged(s: Editable) {
            var text = s.toString().trim()
            binding.ivClearText.visibility = if (text.isNotEmpty()) View.VISIBLE else View.GONE
        }
    }

    // 更新登录按钮状态
    private fun updateLoginButtonState() {
        val account: String = binding.etAccount.text.toString().trim()
        val password: String = binding.etPassword.text.toString().trim()

        if (account.isNotEmpty() && !Validator.isValidEmail(account)) {
            binding.tvErrTip.text = getString(R.string.email_check)
        } else if (password.isNotEmpty() && !Validator.isValidPassword(password)) {
            binding.tvErrTip.text = getString(R.string.password_check)
        } else {
            binding.tvErrTip.text = ""
        }

        // 检查账号和密码是否非空
        val isInputValid = account.isNotEmpty() && password.isNotEmpty()
                && Validator.isValidEmail(account) && Validator.isValidPassword(password)
        binding.btnLogin.isEnabled = isInputValid
    }

    fun initAgreeText() {
        val user_agreen_str = getString(R.string.user_agreen)
        val privacy_policy_str = getString(R.string.privacy_policy)
        binding.tvLink.setMixedParts(
            getString(R.string.agree),
            ClickableTextView.ClickableText("<$privacy_policy_str>") {
                startActivity(
                    Intent(this@LoginPwdActivity, WebActivity::class.java)
                        .putExtra("title", privacy_policy_str)
                        .putExtra("url", "")
                )
            },
            getString(R.string.and),
            ClickableTextView.ClickableText("<$user_agreen_str>") {
                startActivity(
                    Intent(this@LoginPwdActivity, WebActivity::class.java)
                        .putExtra("title", user_agreen_str)
                        .putExtra("url", "")
                )
            }
        )
    }

    override fun receiveEvent(event: EventBusUtil.MessageEvent?) {
        super.receiveEvent(event)
        when (event?.code) {
            EventCode.EVENT_FILL_INPUT -> {
                fillAccoutData()
            }
        }
    }

    fun fillAccoutData() {
        var userName = AppConfig.getUserNameTemp()
        if (userName.isNotEmpty()) {
            binding.etAccount.setText(userName)
            binding.etAccount.requestFocus()
        }
        var password = AppConfig.getPasswordTemp()
        if (password.isNotEmpty()) {
            binding.etPassword.setText(password)
        }
    }

    /**
     * 检查是否有家庭，如果没有，创建一个默认家庭
     * 一个账号必须保留一个家庭，不能删除
     */
    fun checkHome(){
        ThingHomeSdk.getHomeManagerInstance().queryHomeList(object : IThingGetHomeListCallback {
            override fun onSuccess(homeBeans: List<HomeBean>) {
                if(homeBeans.isNullOrEmpty()){
                    createDefaultHome()
                }
            }

            override fun onError(errorCode: String, error: String) {
                // do something
            }
        })
    }

    //创建默认家庭
    fun createDefaultHome() {
        ThingHomeSdk.getHomeManagerInstance().createHome("My Home", 0.0, 0.0, "", emptyList(), object :
            IThingHomeResultCallback {
            override fun onSuccess(bean: HomeBean?) {
            }

            override fun onError(errorCode: String?, errorMsg: String?) {
//                ToastUtil.showToast(errorMsg)
            }

        })
    }
}
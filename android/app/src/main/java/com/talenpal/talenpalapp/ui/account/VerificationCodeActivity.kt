package com.talenpal.talenpalapp.ui.account

import android.content.Intent
import android.text.Editable
import android.text.SpannableString
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.TextPaint
import android.text.method.LinkMovementMethod
import android.text.style.ClickableSpan
import android.view.View
import androidx.core.widget.addTextChangedListener
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.config.Constant
import com.talenpal.talenpalapp.databinding.ActivityVerificationCodeBinding
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.ui.MainActivity
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.ToastUtil
import com.thingclips.smart.android.user.api.ILoginCallback
import com.thingclips.smart.android.user.bean.User
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.sdk.api.IResultCallback
import `in`.xiandan.countdowntimer.CountDownTimerSupport
import `in`.xiandan.countdowntimer.OnCountDownTimerListener


class VerificationCodeActivity : BaseActivity<ActivityVerificationCodeBinding>() {
    private var mTimer: CountDownTimerSupport? = null
    private var mSendType: Int = 1
    override fun isDarkBar(): Boolean {
        return true
    }

    override fun initView() {
        mSendType = intent.getIntExtra("sendType", 1)
        binding.pinView.addTextChangedListener { text: Editable? -> verifyText(text.toString()) }
        mTimer = CountDownTimerSupport(
            Constant.VERIFICATION_TIME_OUT,
            Constant.COUNT_DOWN_INTERVAL
        )
    }

    private fun verifyText(text: String) {
        binding.tvErrTip.text = ""
        if (text.length == 6) {
            if (mSendType == Constant.SEND_TYPE_LOGIN) {
                //登录
                loginWithEmailCodeRequest(text)
            } else {
                //校验
                verifyCodeRequest(text)
            }
        }
    }

    override fun initData() {
        //倒计时
        mTimer?.setOnCountDownTimerListener(object : OnCountDownTimerListener {
            override fun onTick(millisUntilFinished: Long) {
                // 倒计时间隔
                binding.tvSendCodeInfo.text =
                    "${getString(R.string.resend_tip)}：${AppConfig.getUserNameTemp()}，${getString(R.string.resend)}（${millisUntilFinished / Constant.COUNT_DOWN_INTERVAL}s）"
            }

            override fun onFinish() {
                // 倒计时结束
                showAgainSendText()
            }

            override fun onCancel() {
                // 倒计时手动停止
            }
        })
        mTimer?.start()
    }

    fun showAgainSendText() {
        val spanMessage1 = SpannableString(getString(R.string.resend))
        spanMessage1.setSpan(object : ClickableSpan() {
            override fun onClick(view: View) {
                sendVerificationCode()
            }

            override fun updateDrawState(ds: TextPaint) {
                ds.color = getColor(R.color.colorBlue) //设置颜色
                ds.isUnderlineText = false //去掉下划线
            }
        }, 0, spanMessage1.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)

        val spannableBuilder = SpannableStringBuilder()
        spannableBuilder.append("${getString(R.string.resend_tip)}：${AppConfig.getUserNameTemp()}，")
        spannableBuilder.append(spanMessage1)
        binding.tvSendCodeInfo.text = spannableBuilder
        binding.tvSendCodeInfo.movementMethod = LinkMovementMethod.getInstance()
    }

    fun loginWithEmailCodeRequest(code: String) {
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getUserInstance().loginWithEmailCode(
            Constant.CountryCode,
            AppConfig.getUserNameTemp(),
            code,
            object : ILoginCallback {
                override fun onSuccess(user: User?) {
                    LoadingHelper.getInstance().hideLoading()
                    AppConfig.saveUser(user)
                    startActivity(
                        Intent(this@VerificationCodeActivity, MainActivity::class.java)
                            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
                    )
                }

                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast(error)
                }

            }
        );
    }

    fun verifyCodeRequest(code: String) {
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getUserInstance().checkCodeWithUserName(
            AppConfig.getUserNameTemp(),
            "",
            Constant.CountryCode,
            code,
            mSendType,
            object : IResultCallback {
                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    binding.tvErrTip.text = getString(R.string.verification_code_err)
                    ToastUtil.showToast(error)
                }

                override fun onSuccess() {
                    LoadingHelper.getInstance().hideLoading()
                    startActivity(
                        Intent(
                            this@VerificationCodeActivity,
                            SetPasswordActivity::class.java
                        ).putExtra("sendType", mSendType)
                            .putExtra("verificationCode",code)
                    )
                    this@VerificationCodeActivity.finish()
                }
            }
        )
    }

    fun sendVerificationCode() {
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getUserInstance().sendVerifyCodeWithUserName(AppConfig.getUserNameTemp(),
            "",
            Constant.CountryCode,
            mSendType,
            object : IResultCallback {
                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast(error)
                }

                override fun onSuccess() {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast(getString(R.string.send_successfully))
                    if (mTimer != null) {
                        mTimer?.reset()
                        mTimer?.start()
                    }
                }

            });
    }

    override fun onDestroy() {
        super.onDestroy()
        if (mTimer != null) {
            mTimer?.stop()
            mTimer = null
        }
    }

}
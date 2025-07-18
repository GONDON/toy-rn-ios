package com.talenpal.talenpalapp.ui.fragment

import android.content.Intent
import android.view.View
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.databinding.FragmentMeBinding
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.manager.LoginManager
import com.talenpal.talenpalapp.ui.account.LoginActivity
import com.talenpal.talenpalapp.ui.base.BaseFragment
import com.talenpal.talenpalapp.ui.other.TestActivity
import com.talenpal.talenpalapp.util.ToastUtil
import com.thingclips.smart.android.user.api.ILogoutCallback
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.sdk.api.IResultCallback


class MeFragment : BaseFragment<FragmentMeBinding>() {

    override fun initView(view: View?) {
        binding.tvAccount.text = "${AppConfig.getUser()?.email}"
        binding.btnLoginOut.setOnClickListener {
            DialogHelper.showContentDialog(activity,"退出登录","您确定要退出登录吗？") {
                ThingHomeSdk.getUserInstance().touristLogOut(object : ILogoutCallback {
                    override fun onSuccess() {
                        ToastUtil.showToast("退出成功")
                        LoginManager.outLogin()
                        activity?.startActivity(
                            Intent(activity, LoginActivity::class.java)
                                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
                        )
                    }

                    override fun onError(code: String, error: String) {
                        ToastUtil.showToast(error)
                    }
                })
            }
        }

        binding.btnCancelAccount.setOnClickListener {
            DialogHelper.showContentDialog(activity,"注销账号","您确定要注销账号吗？") {
                ThingHomeSdk.getUserInstance().cancelAccount(object : IResultCallback {
                    override fun onError(code: String?, error: String?) {
                        ToastUtil.showToast(error)
                    }

                    override fun onSuccess() {
                        ToastUtil.showToast("注销成功")
                        LoginManager.outLogin()
                        activity?.startActivity(
                            Intent(activity, LoginActivity::class.java)
                                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
                        )
                    }
                })

            }
        }
    }

    override fun initData() {
    }

    companion object {
        @JvmStatic
        fun newInstance() = MeFragment()
    }
}
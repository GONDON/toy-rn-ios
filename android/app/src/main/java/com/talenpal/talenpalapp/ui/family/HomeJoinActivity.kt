package com.talenpal.talenpalapp.ui.family

import android.text.Editable
import android.text.TextWatcher
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityHomeJoinBinding
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.sdk.api.IResultCallback


class HomeJoinActivity : BaseActivity<ActivityHomeJoinBinding>() {

    override fun initView() {
        setTitle(getString(R.string.join_home))
        binding.etInviteCode.addTextChangedListener(textWatcher)
        binding.rlInvite.setOnClickListener {
            val inviteCode = binding.etInviteCode.text.toString()
            if(inviteCode.isNotEmpty()){
                commit(inviteCode)
            }
        }
    }

    override fun initData() {
    }

    private val textWatcher = object : TextWatcher {
        override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
        }

        override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
            if(s.toString().isNotEmpty()){
                binding.ivInvite.setImageResource(R.mipmap.icon_invite_arrow_right_active)
                binding.rlInvite.isEnabled = true
            }else{
                binding.ivInvite.setImageResource(R.mipmap.icon_invite_arrow_right_grey)
                binding.rlInvite.isEnabled = false
            }
        }

        override fun afterTextChanged(s: Editable?) {
        }
    }

    private fun commit(inviteCode: String) {
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getHomeManagerInstance()
            .joinHomeByInviteCode(inviteCode, object : IResultCallback {
                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast(error)
                }

                override fun onSuccess() {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast("加入成功")
                    EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_HOME_INFO_CHANGED))
                    this@HomeJoinActivity.finish()
                }
            })

    }
}
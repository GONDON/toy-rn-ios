package com.talenpal.talenpalapp.ui.device

import android.content.Intent
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityRebootDeviceBinding
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.EventBusUtil

class RebootDeviceActivity : BaseActivity<ActivityRebootDeviceBinding>() {

    override fun initView() {
        setBackImage(R.mipmap.icon_x_black)

        binding.btnConnect.setOnClickListener {
            EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_REBOOT_DEVICE))
            this.finish()
        }
    }

    override fun initData() {
    }
}
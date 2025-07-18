package com.talenpal.talenpalapp.ui.device

import android.content.Intent
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.databinding.ActivityConnectDeviceBinding
import com.talenpal.talenpalapp.ui.base.BaseActivity

class ConnectDeviceActivity : BaseActivity<ActivityConnectDeviceBinding>() {

    override fun initView() {
        setBackImage(R.mipmap.icon_x_black)
    }

    override fun initData() {
//        startActivity(Intent(this, AddDeviceActivity::class.java))
    }
}
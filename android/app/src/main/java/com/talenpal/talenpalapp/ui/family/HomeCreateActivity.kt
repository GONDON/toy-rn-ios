package com.talenpal.talenpalapp.ui.family

import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.databinding.ActivityHomeCreateBinding
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.manager.ActManager
import com.talenpal.talenpalapp.ui.MainActivity
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.ToastUtil
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.bean.HomeBean
import com.thingclips.smart.home.sdk.callback.IThingHomeResultCallback

class HomeCreateActivity : BaseActivity<ActivityHomeCreateBinding>() {

    override fun initView() {
        setTitle(getString(R.string.create_home))
        setLeftText(getString(R.string.cancel))
        setRightText(getString(R.string.save))
    }

    override fun initData() {
    }

    override fun onRightBtnClickListener() {
        commit()
    }

    private fun commit() {
        val name = binding.etName.text.toString().trim()
        if (name.isEmpty()) {
            ToastUtil.showToast(getString(R.string.family_name_not_empty))
            return
        }
        rl_base_right.isEnabled = false
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getHomeManagerInstance().createHome(name, 0.0, 0.0, "", emptyList(), object :
            IThingHomeResultCallback {
            override fun onSuccess(bean: HomeBean?) {
                LoadingHelper.getInstance().hideLoading()
                rl_base_right.isEnabled = true
                binding.etName.setText("")
                DialogHelper.showContentDialog(this@HomeCreateActivity,
                    getString(R.string.family_create_suc),
                    getString(R.string.check_family),
                    getString(R.string.complete_submit),
                    {
                        ActManager.getAppManager().clearAllExcept(MainActivity::class.java)
                    },
                    { this@HomeCreateActivity.finish() })
            }

            override fun onError(errorCode: String?, errorMsg: String?) {
                LoadingHelper.getInstance().hideLoading()
                rl_base_right.isEnabled = true
                ToastUtil.showToast(errorMsg)
            }

        })
    }

}
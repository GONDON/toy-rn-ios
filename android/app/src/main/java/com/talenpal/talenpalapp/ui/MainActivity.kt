package com.talenpal.talenpalapp.ui

import android.app.AlertDialog
import android.content.Intent
import androidx.fragment.app.Fragment
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityMainBinding
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.listener.HomeInviteListener
import com.talenpal.talenpalapp.module.mainTab.TabBaseEntity
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.ui.fragment.CallFragment
import com.talenpal.talenpalapp.ui.fragment.CreationFragment
import com.talenpal.talenpalapp.ui.fragment.HomeFragment
import com.talenpal.talenpalapp.ui.fragment.MeFragment
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.sdk.api.IResultCallback
import java.util.Arrays


class MainActivity : BaseActivity<ActivityMainBinding>() {
    private var fragments: List<Fragment> = ArrayList()
    private var  inviteDialog:AlertDialog? = null
    override fun isImmersion(): Boolean {
        return true
    }
    override fun isExitApp(): Boolean {
        return true
    }

    override fun initView() {
        val homeFragment: HomeFragment = HomeFragment.newInstance();
        val creationFragment: CreationFragment = CreationFragment.newInstance()
        val callFragment: CallFragment = CallFragment.newInstance()
        val meFragment: MeFragment = MeFragment.newInstance()

        fragments = Arrays.asList(homeFragment, creationFragment, callFragment, meFragment)

        binding.mainTabView.addTab(
            TabBaseEntity(
                getString(R.string.device),
                R.mipmap.icon_tab_home_t,
                R.mipmap.icon_tab_home_f,
                homeFragment
            )
        )
            .addTab(
                TabBaseEntity(
                    getString(R.string.creation),
                    R.mipmap.icon_tab_creation_t,
                    R.mipmap.icon_tab_creation_f,
                    creationFragment
                )
            )
            .addTab(
                TabBaseEntity(
                    getString(R.string.call),
                    R.mipmap.icon_tab_call_t,
                    R.mipmap.icon_tab_call_f,
                    callFragment
                )
            )
            .addTab(
                TabBaseEntity(
                    getString(R.string.me),
                    R.mipmap.icon_tab_me_t,
                    R.mipmap.icon_tab_me_f,
                    meFragment
                )
            )
            .setFragmentManager(supportFragmentManager)
            .build()

        //注册家庭管理监听
        registerHomeManager()
    }

    override fun initData() {
    }

    //注册家庭管理监听
    private fun registerHomeManager() {
        ThingHomeSdk.getHomeManagerInstance()
            .registerThingHomeChangeListener(homeInviteListener)
    }
    private val homeInviteListener = object : HomeInviteListener() {
        override fun onHomeInvite(homeId: Long, homeName: String?) {
            inviteDialog =
                DialogHelper.showContentDialog(this@MainActivity, "加入家庭邀请",
                    "您有一个加入${homeName}家庭的邀请，是否同意加入？",
                    "暂不加入", "加入家庭",
                    { processInvitationFun(homeId, false) },
                    { processInvitationFun(homeId, true) })
        }

    }

    fun processInvitationFun(homeId: Long, isAccept: Boolean) {
        ThingHomeSdk.getMemberInstance()
            .processInvitation(homeId, isAccept, object : IResultCallback {
                override fun onError(code: String?, error: String?) {
                    ToastUtil.showToast(error)
                }

                override fun onSuccess() {
                    ToastUtil.showToast(if (isAccept) "已加入家庭" else "")
                }
            })
    }

    override fun receiveEvent(event: EventBusUtil.MessageEvent?) {
        super.receiveEvent(event)
        when (event?.code) {
            EventCode.EVENT_INVITE_HANDLED -> {
                if(inviteDialog != null && inviteDialog!!.isShowing){
                    inviteDialog!!.dismiss()
                }
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        for (fragment in fragments) {
            fragment.onActivityResult(requestCode, resultCode, data)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        inviteDialog = null
        //注销监听
        ThingHomeSdk.getHomeManagerInstance()
            .unRegisterThingHomeChangeListener(homeInviteListener)
    }

}

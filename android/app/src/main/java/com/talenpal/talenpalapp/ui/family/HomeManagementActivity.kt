package com.talenpal.talenpalapp.ui.family

import android.content.Intent
import android.util.Log
import android.view.View
import androidx.recyclerview.widget.LinearLayoutManager
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.adapter.HomeManagementAdapter
import com.talenpal.talenpalapp.app.TalenpalApplication
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityHomeManagementBinding
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.listener.HomeInviteListener
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.talenpal.talenpalapp.util.ViewDrawUtils
import com.talenpal.talenpalapp.view.ScrollerLinearLayoutManager
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.api.IThingHomeChangeListener
import com.thingclips.smart.home.sdk.bean.HomeBean
import com.thingclips.smart.home.sdk.callback.IThingGetHomeListCallback
import com.thingclips.smart.sdk.api.IResultCallback
import com.thingclips.smart.sdk.bean.DeviceBean
import com.thingclips.smart.sdk.bean.GroupBean
import org.xutils.common.util.DensityUtil


class HomeManagementActivity : BaseActivity<ActivityHomeManagementBinding>() {
    private val mAdapter by lazy {
        HomeManagementAdapter()
    }
    override fun initView() {
        setTitle(getString(R.string.home_management))
        binding.tvCreateHome.setOnClickListener {
            startActivity(Intent(this,HomeCreateActivity::class.java))
        }
        binding.tvJoinHome.setOnClickListener {
            startActivity(Intent(this,HomeJoinActivity::class.java))
        }

        ThingHomeSdk.getHomeManagerInstance().registerThingHomeChangeListener(listener)

        val manager = ScrollerLinearLayoutManager(this)
        manager.setScrollEnabled(false)
        binding.recyclerHomeManager.layoutManager = manager
        mAdapter.setHomeManagementListener(homeManagementListener)
        binding.recyclerHomeManager.adapter = mAdapter
    }

    override fun initData() {
        getData(true)
    }

    private fun getData(isLoading: Boolean){
        if(isLoading) {
            LoadingHelper.getInstance().showLoading()
        }
        ThingHomeSdk.getHomeManagerInstance().queryHomeList(object : IThingGetHomeListCallback {
            override fun onSuccess(homeBeans: List<HomeBean>) {
                LoadingHelper.getInstance().hideLoading()
                if(homeBeans.isNotEmpty()){
                    mAdapter.setList(homeBeans)
                    binding.recyclerHomeManager.visibility = View.VISIBLE
                }else{
                    binding.recyclerHomeManager.visibility = View.GONE
                }
            }

            override fun onError(errorCode: String, error: String) {
                LoadingHelper.getInstance().hideLoading()
                // no something
            }
        })
    }

    var listener: IThingHomeChangeListener = object : IThingHomeChangeListener {
        override fun onHomeInvite(homeId: Long, homeName: String) {
            getData(false)
        }

        override fun onHomeRemoved(homeId: Long) {
            getData(false)
        }

        override fun onHomeInfoChanged(homeId: Long) {

        }

        override fun onSharedDeviceList(sharedDeviceList: List<DeviceBean?>?) {
            // do something
        }

        override fun onSharedGroupList(sharedGroupList: List<GroupBean>) {
            // do something
        }

        override fun onServerConnectSuccess() {
            // do something
        }

        override fun onHomeAdded(homeId: Long) {
            getData(false)
        }
    }

    private var homeManagementListener = object : HomeManagementAdapter.HomeManagementListener{
        override fun onWaitJoin(homeId:Long,homeName:String) {
            DialogHelper.showContentDialog(this@HomeManagementActivity, "加入家庭邀请",
                "您有一个加入${homeName}家庭的邀请，是否同意加入？",
                "暂不加入", "加入家庭",
                { processInvitationFun(homeId, false) },
                { processInvitationFun(homeId, true) })
        }
    }

    fun processInvitationFun(homeId: Long, isAccept: Boolean) {
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getMemberInstance()
            .processInvitation(homeId, isAccept, object : IResultCallback {
                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast(error)
                }

                override fun onSuccess() {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast(if (isAccept) "已加入家庭" else "")
                    EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_INVITE_HANDLED))
                    if(isAccept){
                        initData()
                    }
                }
            })
    }

    override fun receiveEvent(event: EventBusUtil.MessageEvent?) {
        super.receiveEvent(event)
        when(event?.code){
            EventCode.EVENT_HOME_INFO_CHANGED -> {
                initData()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        ThingHomeSdk.getHomeManagerInstance().unRegisterThingHomeChangeListener(listener)
    }
}
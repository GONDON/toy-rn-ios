package com.talenpal.talenpalapp.ui.device

import android.view.View
import androidx.recyclerview.widget.RecyclerView
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.adapter.HomeDevicesAdapter
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityMyDevicesBinding
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.talenpal.talenpalapp.view.GridItemDecoration
import com.talenpal.talenpalapp.view.ScrollerGridLayoutManager
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.api.IThingHomeStatusListener
import com.thingclips.smart.home.sdk.bean.DeviceAndGroupInHomeBean
import com.thingclips.smart.home.sdk.bean.HomeBean
import com.thingclips.smart.home.sdk.callback.IThingHomeResultCallback
import com.thingclips.smart.interior.enums.BizParentTypeEnum
import com.thingclips.smart.sdk.api.IResultCallback
import com.thingclips.smart.sdk.bean.GroupBean
import java.util.Collections


class MyDevicesActivity : BaseActivity<ActivityMyDevicesBinding>() {
    private var isManager = false//是否进入管理
    private  val spanCount = 2
    private val devicesAdapter by lazy { HomeDevicesAdapter() }
    override fun initView() {
        setTitle(getString(R.string.device_manager))
        setRightText(getString(R.string.thing_light_manage))

        binding.btnDel.setOnClickListener {
            delDeviceFun()
        }
        binding.btnTopUp.setOnClickListener {
            devicesAdapter.pinToup()
        }

        var devicesLayoutManager = ScrollerGridLayoutManager(this, spanCount)
        binding.recyclerview.layoutManager = devicesLayoutManager
        binding.recyclerview.addItemDecoration(GridItemDecoration(spanCount, 10, true))
        binding.recyclerview.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrollStateChanged(recyclerView: RecyclerView, newState: Int) {
                if (newState == RecyclerView.SCROLL_STATE_IDLE) {
                    devicesAdapter.notifyDataSetChanged()
                }
            }
        })
        binding.recyclerview.adapter = devicesAdapter

        if(AppConfig.getCurrentHomeId() > 0) {
            //注册设备监听
            ThingHomeSdk.newHomeInstance(AppConfig.getCurrentHomeId())
                .registerHomeStatusListener(homeStatusListener)
        }

    }

    override fun onLeftBtnClickListener() {
        if(isManager){
            switchManager()
        }else{
            onBackPressed()
        }
    }

    override fun onRightBtnClickListener() {
        switchManager()
    }

    fun switchManager() {
        isManager = !isManager
        if (isManager) {
            setLeftText(getString(R.string.cancel))
            setRightText(getString(R.string.finish))
            binding.llManagerBottom.visibility = View.VISIBLE
        } else {
            setLeftText("")//显示返回按钮
            setRightText(getString(R.string.thing_light_manage))
            binding.llManagerBottom.visibility = View.GONE

            //置顶操作
            topUpFun()
        }
        devicesAdapter.setIsManager(isManager)
    }

    override fun initData() {
        //初始化家庭数据
        ThingHomeSdk.newHomeInstance(AppConfig.getCurrentHomeId()).getHomeDetail(object :
            IThingHomeResultCallback {
            override fun onSuccess(homeBean: HomeBean) {
                val deviceList = homeBean.deviceList
                devicesAdapter.setList(deviceList)
            }
            override fun onError(errorCode: String, errorMsg: String) {}
        })
    }

    private fun topUpFun() {
//        if (devicesAdapter.data.size <= 1) {
//            ToastUtil.showToast("至少需要两个设备才能进行排序")
//            return
//        }
        LoadingHelper.getInstance().showLoading()
        val list: MutableList<DeviceAndGroupInHomeBean> = ArrayList()
        for (bean in devicesAdapter.data) {
            val deviceInRoomBean = DeviceAndGroupInHomeBean()
            deviceInRoomBean.bizId = bean.getDevId()
            deviceInRoomBean.bizType = BizParentTypeEnum.DEVICE.getType()
            list.add(deviceInRoomBean)
        }
        ThingHomeSdk.newHomeInstance(AppConfig.getCurrentHomeId()).sortDevInHome(AppConfig.getCurrentHomeId().toString(), list, object : IResultCallback {
            override fun onSuccess() {
                LoadingHelper.getInstance().hideLoading()
                ToastUtil.showToast(getString(R.string.pin_to_top_success))
                EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_DEVICE_SORT_CHANGED))
                switchManager()
            }

            override fun onError(code: String, error: String) {
                LoadingHelper.getInstance().hideLoading()
                ToastUtil.showToast(error)
            }
        })


        // @param allDeviceBeans Contains all devices and groups in current home.
//        Collections.sort(allDeviceBeans,
//            Comparator<Any?> { o1, o2 -> o1.getHomeDisplayOrder() - o2.getHomeDisplayOrder() })
    }


    private fun delDeviceFun() {
        DialogHelper.showContentDialog( this,getString(R.string.delete_device_m),getString(R.string.confirm_device_deletion)){
            LoadingHelper.getInstance().showLoading()
            //删除操作
            val selectedDevId = devicesAdapter.selectedId
            val mDevice = ThingHomeSdk.newDeviceInstance(selectedDevId)
            //removeDevice删除设备  resetFactory恢复出厂设置
            mDevice.resetFactory(object : IResultCallback {
                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast(error)
                    switchManager()
                }

                override fun onSuccess() {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast(getString(R.string.ipc_cloud_storage_delete_success))
                }
            })

        }
    }

    private var homeStatusListener = object : IThingHomeStatusListener {
        override fun onDeviceAdded(devId: String?) {
            initData()
        }

        override fun onDeviceRemoved(devId: String?) {
            initData()
        }

        override fun onGroupAdded(groupId: Long) {
            initData()
        }

        override fun onGroupRemoved(groupId: Long) {
            initData()
        }

        override fun onMeshAdded(meshId: String?) {
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if(AppConfig.getCurrentHomeId() > 0) {
            ThingHomeSdk.newHomeInstance(AppConfig.getCurrentHomeId())
                .unRegisterHomeStatusListener(homeStatusListener)
        }
    }
}
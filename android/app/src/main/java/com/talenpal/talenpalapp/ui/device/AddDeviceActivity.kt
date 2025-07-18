package com.talenpal.talenpalapp.ui.device

import android.os.Handler
import android.util.Log
import android.widget.Button
import androidx.recyclerview.widget.LinearLayoutManager
import com.lxj.xpopup.XPopup
import com.lxj.xpopup.enums.PopupAnimation
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.adapter.AddDeviceAdapter
import com.talenpal.talenpalapp.app.TalenpalApplication
import com.talenpal.talenpalapp.bean.CustomScanDeviceBean
import com.talenpal.talenpalapp.bean.DeviceChangedBean
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityAddDeviceBinding
import com.talenpal.talenpalapp.dialog.DeviceAddTipDialog
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.dialog.WifiConnectPopup
import com.talenpal.talenpalapp.listener.ConnectDeviceWorkListener
import com.talenpal.talenpalapp.manager.ActManager
import com.talenpal.talenpalapp.ui.MainActivity
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.JsonUtils
import com.talenpal.talenpalapp.util.ToastUtil
import com.talenpal.talenpalapp.view.VerticalItemDecoration
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.api.IThingHomeStatusListener
import com.thingclips.smart.sdk.api.IResultCallback
import org.xutils.common.util.DensityUtil


class AddDeviceActivity : BaseActivity<ActivityAddDeviceBinding>() {
    private val mAdapter by lazy {
        AddDeviceAdapter()
    }
    private val wifiConnectPopup by lazy {
        WifiConnectPopup(this)
    }
    lateinit var xpConnect: XPopup.Builder
    private var currentOperaPid = ""//当前操作的pid

    private var isAutoConnect = false//自动配网

    override fun initView() {
        setTitle(getString(R.string.add_device))
        isAutoConnect = intent.getBooleanExtra("isAuto", false)

        binding.recyclerview.layoutManager = LinearLayoutManager(this)
        binding.recyclerview.addItemDecoration(VerticalItemDecoration(10, false))
        mAdapter.onAddListener = onAddDeviceListener
        binding.recyclerview.adapter = mAdapter

        wifiConnectPopup.setWorkListener(addDeviceResultListener)
        //显示wifi弹窗
        xpConnect = XPopup.Builder(this)
            .popupAnimation(PopupAnimation.TranslateAlphaFromBottom)
            .popupHeight(TalenpalApplication.heightPixels - DensityUtil.dip2px(100f))
            .enableDrag(false)

        binding.btnConfirm.setOnClickListener {
            ActManager.getAppManager().clearAllExcept(MainActivity::class.java)
        }

        checkConfirmBtnEnable()

        //自动配网
        if(isAutoConnect){
            Handler().postDelayed({
                runOnUiThread {
                    mAdapter.autoConnect()
                }
            },2000)
        }
    }

    override fun onBackPressed() {
        if (isCancelConnectOpera()) {
            XPopup.Builder(this)
                .asCustom(DeviceAddTipDialog(this,object : DeviceAddTipDialog.OnDeviceAddTipDialogListener{
                    override fun onContinueAdd() {
                        //do nothing
                    }

                    override fun onBack() {
                        cancelConnectOpera()//取消配网操作
                        this@AddDeviceActivity.finish()
                    }

                }))
                .show()
        }else{
            if(binding.btnConfirm.isEnabled){
                binding.btnConfirm.performClick()
            }else {
                super.onBackPressed()
            }
        }
    }

    private var onAddDeviceListener = object : AddDeviceAdapter.onAddDeviceListener {
        override fun onAddDevice(position: Int, productInfoBean: CustomScanDeviceBean) {
            //点击添加
            wifiConnectPopup.resetConfig(productInfoBean)
            xpConnect.asCustom(wifiConnectPopup)
                .show()

            //设备待入网状态  此状态需要取消
            mAdapter.getItem(position).isPConnect = true
        }

        override fun onEditDevice(position: Int, productInfoBean: CustomScanDeviceBean, name: String) {
            editDeviceName(productInfoBean.devId, name,position)
        }
    }

    private var addDeviceResultListener = object : ConnectDeviceWorkListener() {
        override fun onStart(pid: String) {
            currentOperaPid = pid
            wifiConnectPopup.dismiss()
            mAdapter.updateStateByPId(pid, 1)
            checkConfirmBtnEnable()
            //开始配网，模拟配网进度
            mAdapter.startTimer(pid)
        }
        override fun onSuccess(pid: String, `object`: Any?) {
            wifiConnectPopup.dismiss()
            mAdapter.updateStateByPId(pid, 2)
            checkConfirmBtnEnable()
        }

        override fun failed(pid: String, code: String?, message: String?) {
            wifiConnectPopup.dismiss()
            mAdapter.updateStateByPId(pid, 3)
            checkConfirmBtnEnable()
//            ToastUtil.showToast(message)
        }
    }

    override fun initData() {
        if(intent == null)return
        var jsonData = intent.getStringExtra("product_data")
        if(jsonData?.isEmpty() == true)return
        var list:List<CustomScanDeviceBean> = JsonUtils.jsonParser(jsonData, CustomScanDeviceBean::class.java) as List<CustomScanDeviceBean>
        mAdapter.setList(list)
    }

    fun checkConfirmBtnEnable(){
        //至少一个成功
        val countSuccess = mAdapter.getCountByState(2)
        binding.btnConfirm.isEnabled  = (countSuccess > 0 && countSuccess <= mAdapter.itemCount)
        binding.tvDeviceNum.text = String.format(getString(R.string.add_device_num),mAdapter.getCountByState(1))
    }

    //取消配网操作
    fun cancelConnectOpera(){
        //待入网和正在配网状态的设备 取消配网
        for (i in 0 until mAdapter.itemCount){
            val productInfoBean = mAdapter.getItem(i)
            if(productInfoBean.state == 1 || //正在配网的
                (productInfoBean.state == 0 && productInfoBean.isPConnect) ||//未开始配网，但是已连接wifi列表的
                productInfoBean.state == 3 //配网失败的
                ){
                ThingHomeSdk.getActivator().newMultiModeActivator().stopActivator(productInfoBean.scanDeviceBean.uuid)
            }
        }
    }
    fun isCancelConnectOpera(): Boolean {
        for (i in 0 until mAdapter.itemCount){
            val productInfoBean = mAdapter.getItem(i)
            if(productInfoBean.state == 1 || //正在配网的
                (productInfoBean.state == 0 && productInfoBean.isPConnect) ||//未开始配网，但是已连接wifi列表的
                productInfoBean.state == 3 //配网失败的
                ){
                return true
            }
        }
        return false
    }

    //修改设备名称
    fun editDeviceName(devId: String?, name: String, position: Int) {
        if(devId?.isEmpty() == true || name.isEmpty())return
        LoadingHelper.getInstance().showLoading()
        val mDevice = ThingHomeSdk.newDeviceInstance(devId)
        mDevice.renameDevice(name, object : IResultCallback{
            override fun onError(code: String?, error: String?) {
                LoadingHelper.getInstance().hideLoading()
                ToastUtil.showToast(error)
            }

            override fun onSuccess() {
                LoadingHelper.getInstance().hideLoading()
                ToastUtil.showToast(getString(R.string.edit_successfully))
                mAdapter.data[position].name = name
                mAdapter.notifyItemChanged(position)
                //通知设备信息变化
                EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_DEVICE_INFO_UPDATED))
            }
        })
    }


    override fun receiveEvent(event: EventBusUtil.MessageEvent?) {
        super.receiveEvent(event)
        when(event?.code){
            EventCode.EVENT_DEIVCE_CHANGED -> {
                val deviceChangedBean = event.data as DeviceChangedBean
                if(deviceChangedBean.state == 1){
                    //添加设备
                    mAdapter.updateDevIdByPId(currentOperaPid, deviceChangedBean.devId)
                }
            }
        }
    }


    override fun onDestroy() {
        super.onDestroy()
    }

}
package com.talenpal.talenpalapp.ui.other

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.recyclerview.widget.LinearLayoutManager
import com.lxj.xpopup.XPopup
import com.lxj.xpopup.enums.PopupAnimation
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.adapter.AddDeviceAdapter
import com.talenpal.talenpalapp.app.TalenpalApplication
import com.talenpal.talenpalapp.bean.CustomScanDeviceBean
import com.talenpal.talenpalapp.databinding.ActivityTestBinding
import com.talenpal.talenpalapp.dialog.DeviceAddTipDialog
import com.talenpal.talenpalapp.dialog.WifiConnectPopup
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.view.VerticalItemDecoration
import org.xutils.common.util.DensityUtil

class TestActivity : BaseActivity<ActivityTestBinding>() {
    private val mAdapter by lazy {
        AddDeviceAdapter()
    }

    override fun onBackPressed() {
        XPopup.Builder(this)
            .asCustom(DeviceAddTipDialog(this,object : DeviceAddTipDialog.OnDeviceAddTipDialogListener{
                override fun onContinueAdd() {
                }

                override fun onBack() {
                }

            }))
            .show()
    }
    override fun initView() {
        setTitle("测试页面")

        XPopup.Builder(this)
            .popupAnimation(PopupAnimation.TranslateAlphaFromBottom)
            .popupHeight(TalenpalApplication.heightPixels - DensityUtil.dip2px(100f))
            .enableDrag(false)
            .asCustom(WifiConnectPopup( this))
            .show()

        binding.recycler.layoutManager = LinearLayoutManager(this)
        binding.recycler.addItemDecoration(VerticalItemDecoration(10))
        binding.recycler.adapter = mAdapter
        mAdapter.onAddListener = object : AddDeviceAdapter.onAddDeviceListener {
            override fun onAddDevice(position: Int, productInfoBean: CustomScanDeviceBean) {
                mAdapter.updateStateByPId(productInfoBean.productId,1)
                mAdapter.startTimer(productInfoBean.productId)
            }

            override fun onEditDevice(position: Int, productInfoBean: CustomScanDeviceBean, name: String) {
                mAdapter.updateDevIdByPId(productInfoBean.productId,name)
            }
        }
    }

    override fun initData() {
        var list = ArrayList<CustomScanDeviceBean>()
        var bean = CustomScanDeviceBean()
        bean.state = 0
        bean.name = "设备1"
        bean.productId = "1"
        list.add(bean)
        var bean1 = CustomScanDeviceBean()
        bean1.state = 0
        bean1.name = "设备2"
        bean1.productId = "2"
        list.add(bean1)
        mAdapter.setList(list)
    }
}
package com.talenpal.talenpalapp.ui.family

import android.util.Log
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.config.Constant
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityMemberAddBinding
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.anntation.MemberRole
import com.thingclips.smart.home.sdk.bean.MemberBean
import com.thingclips.smart.home.sdk.bean.MemberWrapperBean
import com.thingclips.smart.sdk.api.IThingDataCallback


class MemberAddActivity : BaseActivity<ActivityMemberAddBinding>() {
    private var mHomeId: Long? = null
    override fun initView() {
        setTitle(getString(R.string.add_member))
        setLeftText(getString(R.string.cancel))
        setRightText(getString(R.string.save))
    }

    override fun onRightBtnClickListener() {
        addMember()
    }

    override fun initData() {
        mHomeId = intent.getLongExtra("homeId", 0)
    }

    /**
     * 添加成员
     */
    private fun addMember() {
        var name = binding.etName.text.toString().trim()
        var account = binding.etAccount.text.toString().trim()
        if (name.isEmpty()){
           ToastUtil.showToast("请输入名称")
            return
        }
        if (account.isEmpty()){
            ToastUtil.showToast("请输入账号")
            return
        }
        LoadingHelper.getInstance().showLoading()
        var memberWrapperBean = MemberWrapperBean.Builder()
            .setAccount(account)
            .setHomeId(mHomeId!!)
            .setCountryCode(Constant.CountryCode)
            .setNickName(name)
            .setRole(MemberRole.ROLE_MEMBER)
            .setAdmin(false)//是否为家庭管理员
            .setAutoAccept(false)//是否需要受邀请者同意接受加入家庭邀请
            .build()

        ThingHomeSdk.getMemberInstance()
            .addMember(memberWrapperBean, object : IThingDataCallback<MemberBean?> {
                override fun onSuccess(result: MemberBean?) {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast("已发送邀请")
                    EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_MEMBER_CHANGED))
                    this@MemberAddActivity.finish()
                }

                override fun onError(errorCode: String, errorMessage: String) {
                    LoadingHelper.getInstance().hideLoading()
                    DialogHelper.showContentDialog(this@MemberAddActivity,errorMessage){}
                }
            })


    }
}
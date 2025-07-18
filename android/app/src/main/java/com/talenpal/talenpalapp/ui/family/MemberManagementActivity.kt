package com.talenpal.talenpalapp.ui.family

import android.util.Log
import android.view.View
import com.alibaba.fastjson.JSON
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.bean.ConformityMemberBean
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.config.Constant
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityMemberManagementBinding
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.listener.WorkListener
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.ClipboardHelper
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.thingclips.sdk.home.bean.InviteMessageBean
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.anntation.MemberRole
import com.thingclips.smart.home.sdk.bean.MemberWrapperBean
import com.thingclips.smart.sdk.api.IResultCallback
import com.thingclips.smart.sdk.api.IThingDataCallback


class MemberManagementActivity : BaseActivity<ActivityMemberManagementBinding>() {
    private lateinit var memberBean: ConformityMemberBean
    private var homeRole = MemberRole.ROLE_MEMBER
    override fun initView() {
        setTitle(getString(R.string.family_member))
        val dataExtra = intent.getStringExtra("data")
        memberBean = JSON.parseObject(dataExtra, ConformityMemberBean::class.java)
        homeRole = intent.getIntExtra("homeRole", MemberRole.ROLE_MEMBER)

        initViewByRole()
        binding.llMemberName.setOnClickListener {
            val memberName = binding.tvMemberName.text.toString()
            if (memberName.isEmpty()) {
                return@setOnClickListener
            }
            DialogHelper.showEditDialog(this, "成员名称", memberName, object : WorkListener() {
                override fun onSuccess(`object`: Any?) {
                    updateHome(`object` as String)
                }
            })
        }
        binding.tvDelete.setOnClickListener {
            deleteMember()
        }
        binding.tvRevoke.setOnClickListener {
            revokeMember()
        }
        binding.tvReInvite.setOnClickListener {
            reInviteMember()
        }
    }


    private fun initViewByRole() {
        val user = AppConfig.getUser()
        binding.tvMemberName.text = memberBean.nickName
        binding.tvRelatedAccount.text = memberBean.account
        binding.tvRoleName.text = getRoleName(memberBean.role)
        binding.tvInviteCode.text = memberBean.invitationCode

        if (memberBean.memberStatus == 1) {//待接受
            binding.tvRelatedAccount.text = "待加入"
        } else if (memberBean.memberStatus == 2) {//已接受邀请
            binding.tvRelatedAccount.text = memberBean.account
        } else if (memberBean.memberStatus == 3) {//已拒绝邀请
            binding.tvRelatedAccount.text = "已拒绝邀请"
        } else {//无效状态
            binding.tvRelatedAccount.text = "无效状态"
        }
        //是否是当前用户
        var isCurrentUser = memberBean.account == user.email

        if (homeRole == MemberRole.ROLE_OWNER) {
            //家庭所有者
            binding.llMemberName.isEnabled = true
            binding.ivNameMore.visibility = View.VISIBLE
        } else if (homeRole == MemberRole.ROLE_ADMIN) {
            binding.llMemberName.isEnabled = true
            binding.ivNameMore.visibility = View.VISIBLE
            //管理员
        } else if (homeRole == MemberRole.ROLE_MEMBER) {
            //普通成员  也不能修改信息
//            if (isCurrentUser) {
//                binding.llMemberName.isEnabled = true
//                binding.ivNameMore.visibility = View.VISIBLE
//            } else {
                binding.llMemberName.isEnabled = false
                binding.ivNameMore.visibility = View.GONE
//            }
        } else {
            binding.llMemberName.isEnabled = false
            binding.ivNameMore.visibility = View.GONE
        }

        if (homeRole == MemberRole.ROLE_OWNER || homeRole == MemberRole.ROLE_ADMIN) {
            if (memberBean.isInvitation) {
                binding.tvDelete.visibility = View.GONE
                binding.tvRevoke.visibility = View.VISIBLE
                binding.tvReInvite.visibility = View.VISIBLE
            } else {
                binding.tvDelete.visibility = View.VISIBLE
                binding.tvRevoke.visibility = View.GONE
                binding.tvReInvite.visibility = View.GONE
            }
        } else {
            binding.tvDelete.visibility = View.GONE
            binding.tvRevoke.visibility = View.GONE
            binding.tvReInvite.visibility = View.GONE
        }

        //家庭所有者不能删除自己
        if (homeRole == MemberRole.ROLE_OWNER && isCurrentUser) {
            binding.tvDelete.visibility = View.GONE
        }
        //管理员不能删除家庭所有者和自己
        if (homeRole == MemberRole.ROLE_ADMIN && (isCurrentUser || memberBean.role == MemberRole.ROLE_OWNER)) {
            binding.tvDelete.visibility = View.GONE
        }
        //邀请码只能邀请者能看
        if (memberBean.isInvitation && (homeRole == MemberRole.ROLE_OWNER || homeRole == MemberRole.ROLE_ADMIN)) {
            binding.llInviteCode.visibility = View.VISIBLE
        } else {
            binding.llInviteCode.visibility = View.GONE
        }

        //隐藏删除成员按钮
        binding.tvDelete.visibility = View.GONE

    }

    override fun initData() {
    }

    /**
     * 修改名字
     */
    private fun updateHome(name: String) {
        LoadingHelper.getInstance().showLoading()
        if (!memberBean.isInvitation) {
            var memberWrapperBean = MemberWrapperBean.Builder()
                .setHomeId(memberBean.homeId)
                .setMemberId(memberBean.memberId)
                .setNickName(name)
                .build()
            ThingHomeSdk.getMemberInstance()
                .updateMember(memberWrapperBean, object : IResultCallback {
                    override fun onSuccess() {
                        LoadingHelper.getInstance().hideLoading()
                        binding.tvMemberName.text = name
                        ToastUtil.showToast("修改成功")
                        EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_MEMBER_CHANGED))
                    }

                    override fun onError(code: String?, error: String?) {
                        LoadingHelper.getInstance().hideLoading()
                        ToastUtil.showToast(error)
                    }
                })
        } else {
            ThingHomeSdk.getMemberInstance()
                .updateInvitedMember(
                    memberBean.invitationId,
                    name,
                    memberBean.role,
                    object : IResultCallback {
                        override fun onSuccess() {
                            LoadingHelper.getInstance().hideLoading()
                            binding.tvMemberName.text = name
                            ToastUtil.showToast("修改成功")
                            EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_INVITE_CHANGED))
                        }

                        override fun onError(code: String, error: String) {
                            LoadingHelper.getInstance().hideLoading()
                            ToastUtil.showToast(error)
                        }
                    })
        }
    }

    /**
     * 刪除成员
     */
    private fun deleteMember() {
        DialogHelper.showContentDialog(
            this,
            "删除成员",
            "您确定要删除该成员吗？",
            "取消",
            "删除",
        ) {
            LoadingHelper.getInstance().showLoading()
            ThingHomeSdk.getMemberInstance()
                .removeMember(memberBean.memberId, object : IResultCallback {
                    override fun onSuccess() {
                        LoadingHelper.getInstance().hideLoading()
                        ToastUtil.showToast("删除成功")
                        EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_MEMBER_CHANGED))
                        this@MemberManagementActivity.finish()
                    }

                    override fun onError(code: String, error: String) {
                        LoadingHelper.getInstance().hideLoading()
                        ToastUtil.showToast(error)
                    }
                })
        }
    }

    /**
     * 撤销邀请
     * @param isReInvite 是否是重新邀请来的
     */
    private fun revokeMember() {
        DialogHelper.showContentDialog(
            this,
            "撤销邀请",
            "您确定要撤销该邀请吗？",
            "取消",
            "确定",
        ) {
            revokeMemberRequest(false)
        }
    }

    private fun revokeMemberRequest(isReInvite: Boolean) {
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getMemberInstance()
            .cancelMemberInvitationCode(memberBean.invitationId, object : IResultCallback {
                override fun onSuccess() {
                    LoadingHelper.getInstance().hideLoading()
                    EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_INVITE_CHANGED))
                    if (!isReInvite) {
                        ToastUtil.showToast("撤销成功")
                        this@MemberManagementActivity.finish()
                    }
                }

                override fun onError(code: String, error: String) {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast(error)
                }
            })
    }

    /**
     * 重新邀请
     */
    private fun reInviteMember() {
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.getMemberInstance()
            .getInvitationMessage(
                memberBean.homeId,
                object : IThingDataCallback<InviteMessageBean?> {
                    override fun onSuccess(result: InviteMessageBean?) {
                        LoadingHelper.getInstance().hideLoading()
                        ClipboardHelper.copyToClipboard(
                            result?.invitationMsgContent ?: "",
                            "邀请码"
                        )
                        ToastUtil.showToast("已复制邀请信息到剪贴板")
                        //撤销老的邀请
                        revokeMemberRequest(true)
                    }

                    override fun onError(errorCode: String, errorMessage: String) {
                        LoadingHelper.getInstance().hideLoading()
                        ToastUtil.showToast(errorMessage)
                    }
                })
    }

    override fun receiveEvent(event: EventBusUtil.MessageEvent?) {
        super.receiveEvent(event)
        when (event?.code) {
            EventCode.EVENT_INVITE_MEMBER_LAST -> {
                //重新撤销后更新数据
                event.data?.let {
                    memberBean = it as ConformityMemberBean
                    binding.tvInviteCode.text = memberBean.invitationCode
                }
            }
        }
    }

    private fun getRoleName(role: Int): String {

        return when (role) {
            -1 -> getString(R.string.custom_role)
            0 -> getString(R.string.family_ordinary_member)
            1 -> getString(R.string.family_perms_admin)
            2 -> getString(R.string.thing_owner)
            else -> getString(R.string.illegal_role)
        }
    }
}
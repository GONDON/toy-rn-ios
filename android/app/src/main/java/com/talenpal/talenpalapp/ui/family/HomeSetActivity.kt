package com.talenpal.talenpalapp.ui.family

import android.content.Intent
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.adapter.HomeSetAdapter
import com.talenpal.talenpalapp.bean.ConformityMemberBean
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.ActivityHomeSetBinding
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.dialog.LoadingHelper
import com.talenpal.talenpalapp.listener.OnSingleClickListener
import com.talenpal.talenpalapp.listener.WorkListener
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.ClipboardHelper
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.talenpal.talenpalapp.view.ScrollerLinearLayoutManager
import com.thingclips.sdk.home.bean.InviteListResponseBean
import com.thingclips.sdk.home.bean.InviteMessageBean
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.anntation.MemberRole
import com.thingclips.smart.home.sdk.bean.HomeBean
import com.thingclips.smart.home.sdk.bean.MemberBean
import com.thingclips.smart.home.sdk.callback.IThingGetMemberListCallback
import com.thingclips.smart.home.sdk.callback.IThingHomeResultCallback
import com.thingclips.smart.sdk.api.IResultCallback
import com.thingclips.smart.sdk.api.IThingDataCallback

class HomeSetActivity : BaseActivity<ActivityHomeSetBinding>() {
    private val mAdapter by lazy { HomeSetAdapter() }
    private var mHomeId: Long? = null
    private  var role = MemberRole.ROLE_MEMBER
    private val memberList = mutableListOf<ConformityMemberBean>()
    private val inviteList = mutableListOf<ConformityMemberBean>()
    private var currentUserMemberId = 0L
    private var homeBean: HomeBean? = null
    private var homeCount = 0//家庭数量
    override fun initView() {
        setTitle(getString(R.string.home_set))
        mHomeId = intent.getLongExtra("homeId", 0)
        homeCount = intent.getIntExtra("homeCount",0)
        binding.tvLeaveHome.setOnClickListener {
            deleteFun()
        }
        binding.llFamilyName.setOnClickListener {
            val familyName = binding.tvFamilyName.text.toString()
            if (familyName.isEmpty()) {
                return@setOnClickListener
            }
            DialogHelper.showEditDialog(this, getString(R.string.home_name), familyName, object : WorkListener() {
                override fun onSuccess(`object`: Any?) {
                    updateHome(`object` as String)
                }
            })
        }
        binding.tvInviteMember.setOnClickListener(object :OnSingleClickListener(){
            override fun onSingleClick(v: View?) {
                //邀请成员
                inviteMemberFun()
            }
        })
        binding.llMemberFooter.setOnClickListener{
            //添加成员
            startActivity(
                Intent(this, MemberAddActivity::class.java)
                    .putExtra("homeId", mHomeId)
            )
        }

        var layoutManager = ScrollerLinearLayoutManager(this)
        layoutManager.setScrollEnabled(false)
        binding.recyclerview.layoutManager = layoutManager
        binding.recyclerview.adapter = mAdapter
//        mAdapter.addFooterView(getFooterView())
    }

    private fun getFooterView(): View {
        val view = LayoutInflater.from(this)
            .inflate(R.layout.item_home_set_footer, binding.recyclerview, false);
        view.setOnClickListener {
            startActivity(
                Intent(this, MemberAddActivity::class.java)
                    .putExtra("homeId", mHomeId)
            )
        }
        return view
    }

    fun showHomeInfo(bean: HomeBean) {
        this.homeBean = bean
        role = bean.role
        if(role == MemberRole.ROLE_OWNER){
            //家庭所有者
            binding.tvLeaveHome.text = getString(R.string.family_delete)
            binding.tvLeaveHome.visibility = View.VISIBLE
            binding.tvInviteMember.visibility = View.VISIBLE

            binding.llFamilyName.isEnabled = true
            binding.ivMore.visibility = View.VISIBLE

            binding.llMemberFooter.visibility = View.VISIBLE
        }else if(role == MemberRole.ROLE_ADMIN){
            //管理员
            binding.tvLeaveHome.text = getString(R.string.family_remove)
            binding.tvLeaveHome.visibility = View.VISIBLE
            binding.tvInviteMember.visibility = View.VISIBLE
            binding.llFamilyName.isEnabled = true
            binding.ivMore.visibility = View.VISIBLE

            binding.llMemberFooter.visibility = View.VISIBLE
        }else {//MemberRole.ROLE_MEMBER
            //普通成员
            binding.tvLeaveHome.text = getString(R.string.family_remove)
            binding.tvLeaveHome.visibility = View.VISIBLE
            binding.tvInviteMember.visibility = View.GONE
            mAdapter.removeAllFooterView()
            binding.llFamilyName.isEnabled = false
            binding.ivMore.visibility = View.GONE

            binding.llMemberFooter.visibility = View.GONE
        }

        binding.tvFamilyName.text = bean.name
        mAdapter.setHomeRole(role)
    }

    override fun receiveEvent(event: EventBusUtil.MessageEvent?) {
        when (event?.code) {
            EventCode.EVENT_MEMBER_CHANGED -> {
                queryMemberList()
            }
            EventCode.EVENT_INVITE_CHANGED ->{
                queryInviteMemberList()
            }
        }
    }

    override fun initData() {
        if (mHomeId == null) return
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.newHomeInstance(mHomeId!!).getHomeDetail(object : IThingHomeResultCallback {
            override fun onSuccess(bean: HomeBean) {
                LoadingHelper.getInstance().hideLoading()
                showHomeInfo(bean)
            }

            override fun onError(errorCode: String, errorMsg: String) {
                LoadingHelper.getInstance().hideLoading()
                // no something
            }
        })
        //查询成员列表
        queryMemberList()
        queryInviteMemberList()
    }

    /**
     * 更新家庭名称
     */
    private fun updateHome(name: String) {
        LoadingHelper.getInstance().showLoading()
        ThingHomeSdk.newHomeInstance(mHomeId!!)
            .updateHome(name, 0.0, 0.0, "", object : IResultCallback {
                override fun onError(code: String?, error: String?) {
                    LoadingHelper.getInstance().hideLoading()
                    ToastUtil.showToast(error)
                }

                override fun onSuccess() {
                    LoadingHelper.getInstance().hideLoading()
                    binding.tvFamilyName.text = name
                    EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_HOME_INFO_CHANGED))
                    ToastUtil.showToast(getString(R.string.nickname_edit_success))
                }
            })

    }

    /**
     * 删除家庭
     */
    private fun deleteFun() {
        if (role == MemberRole.ROLE_OWNER || role == MemberRole.ROLE_ADMIN){
            //删除家庭
            if(homeBean != null){
                val deviceList = homeBean?.deviceList
                if(!deviceList.isNullOrEmpty()){
                    DialogHelper.showTipDialog(this,"无法删除","您家庭下有故事机，请解绑后再删除家庭")
                    return
                }
            }

            if(homeCount <= 1){
                DialogHelper.showTipDialog(this,"无法删除","请至少保留一个家庭")
                return
            }
        }

        DialogHelper.showContentDialog(
            this,
            if (role == MemberRole.ROLE_MEMBER)"离开家庭" else "删除家庭",
            if (role == MemberRole.ROLE_MEMBER)"离开后，将不能操作家庭里的设备和智能，是否继续？" else "删除家庭不可恢复，您的家庭成员将会被清退，是否继续？",
            "取消",
            if (role == MemberRole.ROLE_MEMBER)"确定" else "删除",
        ) {
//            ThingHomeSdk.newHomeInstance(mHomeId!!).dismissHome(object : IResultCallback {
//                override fun onSuccess() {
//                    ToastUtil.showToast( if (role == MemberRole.ROLE_MEMBER) "离开成功" else "删除成功")
//                    EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_HOME_INFO_CHANGED))
//                    this@HomeSetActivity.finish()
//                }
//
//                override fun onError(code: String, error: String) {
//                    //您家庭下有故事机，请解绑后再删除家庭
//                    DialogHelper.showTipDialog(this@HomeSetActivity, if (role == MemberRole.ROLE_MEMBER)"无法离开" else "无法删除", error)
//                }
//            })
            /**
             * 若成员传入自身 memberId，针对不同的家庭成员有一些区别：
             *
             * 家庭管理员、普通成员、自定义角色为离开家庭，此时该家庭未注销，设备也不会被重置。
             * 拥有者为注销家庭，同时该家庭下所有设备会被重置，效果与 注销家庭 一致。
             */
            ThingHomeSdk.getMemberInstance().removeMember(currentUserMemberId, object : IResultCallback {
                override fun onSuccess() {
                    ToastUtil.showToast( if (role == MemberRole.ROLE_MEMBER) "离开成功" else "删除成功")
                    EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_HOME_INFO_CHANGED))
                    this@HomeSetActivity.finish()
                }

                override fun onError(code: String, error: String) {
                    DialogHelper.showTipDialog(this@HomeSetActivity, if (role == MemberRole.ROLE_MEMBER)"无法离开" else "无法删除", error)
                }
            })

        }
    }

    /**
     * 查询成员列表
     */
    private fun queryMemberList() {
        ThingHomeSdk.getMemberInstance()
            .queryMemberList(mHomeId!!, object : IThingGetMemberListCallback {
                override fun onSuccess(memberBeans: List<MemberBean>) {
                    memberConvertToConformity(memberBeans)
                    handleListData()
                }

                override fun onError(errorCode: String, error: String) {
                    // do something
                }
            })
    }

    private fun queryInviteMemberList() {
        ThingHomeSdk.getMemberInstance()
            .getInvitationList(
                mHomeId!!,
                object : IThingDataCallback<List<InviteListResponseBean>> {
                    override fun onSuccess(result: List<InviteListResponseBean>?) {
                        inviteConvertToConformity(result)
                        handleListData()
                    }

                    override fun onError(errorCode: String?, errorMessage: String?) {
                    }
                })

    }

    private fun inviteMemberFun() {
        ThingHomeSdk.getMemberInstance()
            .getInvitationMessage(mHomeId!!, object : IThingDataCallback<InviteMessageBean?> {
                override fun onSuccess(result: InviteMessageBean?) {
                    queryInviteMemberList()
                    DialogHelper.showTipDialog(this@HomeSetActivity, getString(R.string.invite_member), result?.invitationMsgContent)
                    ClipboardHelper.copyToClipboard(result?.invitationMsgContent ?: "", getString(R.string.invite_code))
                    ToastUtil.showBottomToast(getString(R.string.thing_copied))
                }

                override fun onError(errorCode: String, errorMessage: String) {
                    ToastUtil.showToast(errorMessage)
                }
            })
    }

    private fun handleListData(){
        var allList = ArrayList<ConformityMemberBean>()
        allList.addAll(memberList)
        allList.addAll(inviteList)

        mAdapter.setList(allList)
    }

    /**
     * 成员信息转换为整合信息
     */
    private fun memberConvertToConformity(memberBeans: List<MemberBean>) {
        this.memberList.clear()
        if (memberBeans.isEmpty()) return
        for (bean in memberBeans) {
            val cmBean = ConformityMemberBean()
            cmBean.homeId = bean.homeId
            cmBean.nickName = bean.nickName
            cmBean.admin = bean.isAdmin
            cmBean.memberId = bean.memberId
            cmBean.headPic = bean.headPic
            cmBean.account = bean.account
            cmBean.memberStatus = bean.memberStatus
            cmBean.role = bean.role

            if(AppConfig.getUser().email.equals(cmBean.account)){
                currentUserMemberId = cmBean.memberId
            }

            this.memberList.add(cmBean)
        }
    }

    /**
     * 邀请信息转换为整合信息
     */
    private fun inviteConvertToConformity(result: List<InviteListResponseBean>?) {
        this.inviteList.clear()
        if (result == null || result?.isEmpty()!!) return
        for (bean in result) {
            val cmBean = ConformityMemberBean()
            cmBean.isInvitation = true
            cmBean.homeId = mHomeId!!
            cmBean.nickName = bean.name
            cmBean.admin = bean.isAdmin
            cmBean.memberId = bean.gid
            cmBean.memberStatus = bean.dealStatus
            cmBean.role = bean.role
            cmBean.invitationId = bean.invitationId
            cmBean.invitationCode = bean.invitationCode
            cmBean.validTime = bean.validTime
           this.inviteList.add(cmBean)
        }
        //重新邀请后，需要把最后一条数据传递到成员详情页
        this.inviteList.last().let {
            EventBusUtil.sendEvent(EventBusUtil.MessageEvent(EventCode.EVENT_INVITE_MEMBER_LAST,it))
        }
    }

}
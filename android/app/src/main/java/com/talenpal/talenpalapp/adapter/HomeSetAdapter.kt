package com.talenpal.talenpalapp.adapter

import android.content.Intent
import android.graphics.Color
import android.widget.TextView
import com.alibaba.fastjson.JSON
import com.chad.library.adapter.base.BaseQuickAdapter
import com.chad.library.adapter.base.viewholder.BaseViewHolder
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.bean.ConformityMemberBean
import com.talenpal.talenpalapp.ui.family.MemberManagementActivity
import com.talenpal.talenpalapp.util.DateUtil
import com.thingclips.smart.home.sdk.anntation.MemberRole
import com.thingclips.smart.home.sdk.bean.MemberBean
import java.io.Serializable

class HomeSetAdapter : BaseQuickAdapter<ConformityMemberBean, BaseViewHolder>(R.layout.item_home_set) {
    private var homeRole = MemberRole.ROLE_MEMBER
    fun setHomeRole(homeRole: Int) {
        this.homeRole = homeRole
    }
    override fun convert(holder: BaseViewHolder, item: ConformityMemberBean) {
        holder.getView<TextView>(R.id.tv_member_name).text = item.nickName
        val mTvMemberAccount = holder.getView<TextView>(R.id.tv_member_account)
        val mTvRole = holder.getView<TextView>(R.id.tv_role)
        //1：待接受
        //2：已接受邀请
        //3：已拒绝邀请
        //4：无效状态
        if(item.memberStatus == 1){
            if(!item.isInvitation){
                mTvMemberAccount.text = context.getString(R.string.home_wait_join)
                mTvRole.text = getRoleName(item.role)
                mTvRole.setTextColor(Color.parseColor("#80000000"))
            }else{
                mTvMemberAccount.text = context.getString(R.string.home_wait_join)
                mTvRole.text = "有效期剩余${DateUtil.getHourToDay(item.validTime)}"
                mTvRole.setTextColor(Color.parseColor("#F04C4C"))
            }
        }else if(item.memberStatus == 2){
            mTvMemberAccount.text = item.account
            mTvRole.text = getRoleName(item.role)
            mTvRole.setTextColor(Color.parseColor("#80000000"))
        }else if(item.memberStatus == 3){
            mTvMemberAccount.text = "已拒绝"
            mTvRole.text = getRoleName(item.role)
            mTvRole.setTextColor(Color.parseColor("#80000000"))
//        }else if(item.memberStatus == 4) {
//            mTvMemberAccount.text = item.account
//            mTvRole.text = "无效状态"
//            mTvRole.setTextColor(Color.parseColor("#F04C4C"))
        }else{
            mTvMemberAccount.text = "无效状态"
            mTvRole.text = getRoleName(item.role)
            mTvRole.setTextColor(Color.parseColor("#80000000"))
        }

        holder.itemView.setOnClickListener {
            context.startActivity(Intent(context, MemberManagementActivity::class.java)
                .putExtra("data",JSON.toJSON(item).toString())
                .putExtra("homeRole",homeRole)
            )
        }
    }

    private fun getRoleName(role: Int): String {
        return when (role) {
            -1 -> context.getString(R.string.custom_role)
            0 ->  context.getString(R.string.family_ordinary_member)
            1 ->  context.getString(R.string.family_perms_admin)
            2 ->  context.getString(R.string.thing_owner)
            else ->  context.getString(R.string.illegal_role)
        }
    }
}
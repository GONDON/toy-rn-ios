package com.talenpal.talenpalapp.bean

class ConformityMemberBean {
    var homeId: Long = 0
    var nickName: String = ""
    var admin = false
    var memberId: Long = 0
    var headPic: String? = null
    var account: String = ""
    var memberStatus = 0
    var role = 0

    var isInvitation = false //是否是邀请信息
    //邀请信息
    var validTime: Long = 0
    var invitationId: Long = 0
    var invitationCode: String = ""
}
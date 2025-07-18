package com.talenpal.talenpalapp.http.model

class DollModel(
    val id: String,
    val name: String,
    val type: String,
    val family:String,
    val model:String,
    val desc:String,
    val coverImg:String,
    val backgroundImg:String,
    val preview3d:String,
    val releaseStatus:String,
    val grayConfig:String,
    val createTime:String,
)

data class DollInstanceModel (
    val list: List<DollItemModel>? = null,
    var total: Int = 0
)

data class DollItemModel(
    val active: Boolean,
    val activeTime: Long,
    val createTime: Long,
    val deviceInstanceId: String,
    val dollModel: DollModel,
    val dollModelId: String,
    val hardwareCode: String,
    val id: Int,
    val memberUserId: Int,
    val totalStoryDuration: Int,
    val totalStoryNum: Int,
)
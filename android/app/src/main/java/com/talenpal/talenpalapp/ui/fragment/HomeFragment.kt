package com.talenpal.talenpalapp.ui.fragment

import android.content.Intent
import android.os.Handler
import android.util.Log
import android.view.View
import androidx.recyclerview.widget.LinearLayoutManager
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.bitmap.CenterCrop
import com.bumptech.glide.load.resource.bitmap.RoundedCorners
import com.lxj.xpopup.XPopup
import com.lxj.xpopup.enums.PopupAnimation
import com.talenpal.talenpalapp.adapter.HomeBannerToyAdapter
import com.talenpal.talenpalapp.adapter.HomeDevicesAdapter
import com.talenpal.talenpalapp.adapter.HomeSwitchAdapter
import com.talenpal.talenpalapp.adapter.HomeToysAdapter
import com.talenpal.talenpalapp.app.TalenpalApplication
import com.talenpal.talenpalapp.bean.DeviceChangedBean
import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.databinding.FragmentHomeBinding
import com.talenpal.talenpalapp.dialog.HomeAttachPopup
import com.talenpal.talenpalapp.dialog.HomeSwitchPopup
import com.talenpal.talenpalapp.dialog.HomeToyGuidePopup
import com.talenpal.talenpalapp.http.call.HttpCall
import com.talenpal.talenpalapp.http.model.BannerModel
import com.talenpal.talenpalapp.http.model.DollInstanceModel
import com.talenpal.talenpalapp.http.util.HttpUtils
import com.talenpal.talenpalapp.http.util.RetrofitClint
import com.talenpal.talenpalapp.ui.base.BaseFragment
import com.talenpal.talenpalapp.ui.device.DeviceDistributionNetworkActivity
import com.talenpal.talenpalapp.ui.device.MyDevicesActivity
import com.talenpal.talenpalapp.ui.toy.MyToysActivity
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.talenpal.talenpalapp.util.ViewDrawUtils
import com.talenpal.talenpalapp.view.GridItemDecoration
import com.talenpal.talenpalapp.view.HorizontalItemDecoration
import com.talenpal.talenpalapp.view.ScrollerGridLayoutManager
import com.talenpal.talenpalapp.view.ScrollerLinearLayoutManager
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.api.IThingHomeChangeListener
import com.thingclips.smart.home.sdk.api.IThingHomeStatusListener
import com.thingclips.smart.home.sdk.bean.HomeBean
import com.thingclips.smart.home.sdk.callback.IThingGetHomeListCallback
import com.thingclips.smart.home.sdk.callback.IThingHomeResultCallback
import com.thingclips.smart.sdk.bean.DeviceBean
import com.thingclips.smart.sdk.bean.GroupBean
import com.youth.banner.adapter.BannerImageAdapter
import com.youth.banner.holder.BannerImageHolder
import com.youth.banner.indicator.CircleIndicator
import org.xutils.common.util.DensityUtil


class HomeFragment : BaseFragment<FragmentHomeBinding>() {
    companion object {
        @JvmStatic
        fun newInstance() =
            HomeFragment()
    }

    private val devicesAdapter by lazy { HomeDevicesAdapter() }
    private val toysAdapter by lazy { HomeToysAdapter() }
    private val homeAttachPopup by lazy { context?.let { HomeAttachPopup(it) } }
    private val homeSwitchPopup by lazy { context?.let { HomeSwitchPopup(it) } }
    private val homeToyGuidePopup by lazy { context?.let { HomeToyGuidePopup(it) } }
    private val homeBannerToyAdapter by lazy { HomeBannerToyAdapter() }
    private var refreshCount = 0//刷新个数

    override fun initView(view: View?) {
        binding?.ivPoint?.setOnClickListener {
            XPopup.Builder(context)
                .hasShadowBg(false)
                .atView(it)
                .offsetY(-DensityUtil.dip2px(18f))
                .offsetX(DensityUtil.dip2px(22f))
                .asCustom(homeAttachPopup)
                .show()
        }
        binding.refreshLayout.setEnableLoadMore(false)
        binding.refreshLayout.setOnRefreshListener {
            refreshData()
        }
        initBanner()
        initFamily()
        initDevices()
        initToys()
        initExploreToy()

        //注册家庭监听
        registerHomeManager()
    }

    private fun showShimmer(){
        binding.shimmerHomeContainer.shimmerHomeContainer.startShimmer()
        binding.rlMainContainer.visibility = View.GONE
        binding.shimmerHomeContainer.shimmerHomeContainer.visibility = View.VISIBLE

        startDelayedTask() // 启动2秒延迟任务
    }
    private fun startDelayedTask() {
        Handler().postDelayed({
            activity?.runOnUiThread {
                hideShimmer()
            }
        }, 3000)
    }
    private fun hideShimmer(){
        binding.shimmerHomeContainer.shimmerHomeContainer.hideShimmer()
        binding.rlMainContainer.visibility = View.VISIBLE
        binding.shimmerHomeContainer.shimmerHomeContainer.visibility = View.GONE
    }

    override fun initData() {
        showShimmer()//显示骨骼图
        //获取banner
        getBannerList()
        //获取家庭列表
        getHomeDataList()
        //my toys
        getDollInstanceList_toys()
        //ip公仔
        getDollInstanceList_explore_toys()
    }


    private fun refreshData() {
        refreshCount = 4
        //刷新数据
        getDeviceData()
        getBannerList()
        getDollInstanceList_toys()
        getDollInstanceList_explore_toys()
    }

    private fun changeRefreshState() {
        refreshCount--
        if (refreshCount <= 0) {
            binding.refreshLayout.finishRefresh()
        }
    }

    fun initBanner() {
        binding.banner
            .setAdapter(object : BannerImageAdapter<BannerModel?>(null) {

            override fun onBindView(
                holder: BannerImageHolder?,
                data: BannerModel?,
                position: Int,
                size: Int
            ) {
                //图片加载自己实现
                if (holder != null) {
                    Glide.with(holder.itemView)
                        .load(data?.mediaUrl)
                        .transform(CenterCrop(), RoundedCorners(DensityUtil.dip2px(20f)))
                        .into(holder.imageView)
                }
            }
        })
            ?.addBannerLifecycleObserver(this)?.indicator = CircleIndicator(activity)
    }

    //注册家庭管理监听
    private fun registerHomeManager() {
        ThingHomeSdk.getHomeManagerInstance()
            .registerThingHomeChangeListener(homeInviteListener)
    }

    private val homeInviteListener = object : IThingHomeChangeListener {
        override fun onHomeAdded(homeId: Long) {
            getHomeDataList()
        }

        override fun onHomeInvite(homeId: Long, homeName: String?) {
        }

        override fun onHomeRemoved(homeId: Long) {
            getHomeDataList()
        }

        override fun onHomeInfoChanged(homeId: Long) {
//            getHomeDataList()
        }

        override fun onSharedDeviceList(sharedDeviceList: MutableList<DeviceBean>?) {
        }

        override fun onSharedGroupList(sharedGroupList: MutableList<GroupBean>?) {
        }

        override fun onServerConnectSuccess() {
        }
    }

    private var homeStatusListener = object : IThingHomeStatusListener {
        override fun onDeviceAdded(devId: String?) {
            Log.e("===", "onDeviceAdded:$devId")
            if (!devId.isNullOrEmpty()) {
                EventBusUtil.sendEvent(
                    EventBusUtil.MessageEvent(
                        EventCode.EVENT_DEIVCE_CHANGED,
                        DeviceChangedBean(devId, 1)
                    )
                )
            }
            getDeviceData()
        }

        override fun onDeviceRemoved(devId: String?) {
            Log.e("===", "onDeviceRemoved:$devId")
            if (!devId.isNullOrEmpty()) {
                EventBusUtil.sendEvent(
                    EventBusUtil.MessageEvent(
                        EventCode.EVENT_DEIVCE_CHANGED,
                        DeviceChangedBean(devId, 2)
                    )
                )
            }
            getDeviceData()
        }

        override fun onGroupAdded(groupId: Long) {
            Log.e("===", "onGroupAdded:$groupId")
            getDeviceData()
        }

        override fun onGroupRemoved(groupId: Long) {
            Log.e("===", "onGroupRemoved:$groupId")
            getDeviceData()
        }

        override fun onMeshAdded(meshId: String?) {
        }
    }

    override fun receiveEvent(event: EventBusUtil.MessageEvent?) {
        super.receiveEvent(event)
        when (event?.code) {
            EventCode.EVENT_DEVICE_SORT_CHANGED -> {
               //设备排序发生变化
                getDeviceData()
            }
            EventCode.EVENT_DEVICE_INFO_UPDATED ->{
                //设备信息变化
                getDeviceData()
            }
            EventCode.EVENT_HOME_INFO_CHANGED -> {
                //家庭信息变化
                getHomeDataList()
            }
        }
    }

    /*****************************************家庭管理********START**********************************************/
    fun initFamily() {
        homeAttachPopup?.setmListener {
            //切换家庭弹窗
            XPopup.Builder(context)
                .isLightStatusBar(true)
                .enableDrag(false)
                .popupAnimation(PopupAnimation.ScrollAlphaFromTop)
                .popupWidth(DensityUtil.getScreenWidth())
                .asCustom(homeSwitchPopup)
                .show()
        }
        homeSwitchPopup?.setHomeChangeListener(object : HomeSwitchAdapter.OnHomeSelectedListener {
            override fun onHomeSelected(homeId: Long, homeBean: HomeBean) {
                homeSwitchPopup?.dismiss()
                //切换家庭监听
                initFamilyDevice(homeBean)
            }

        })
    }

    fun getHomeDataList() {
        ThingHomeSdk.getHomeManagerInstance().queryHomeList(object : IThingGetHomeListCallback {
            override fun onSuccess(homeBeans: List<HomeBean>) {
                //获取默认家庭，暂取第一个
                if (homeBeans != null && homeBeans.isNotEmpty()) {
                    initFamilyDevice(homeBeans[0])
                } else {
                    //无家庭处理  家庭删除时，默认家庭id设为0
                    val currentHomeId = AppConfig.getCurrentHomeId()
                    if(currentHomeId !== 0L){
                        AppConfig.setCurrentHomeId(0)
                    }
                    //无家庭数据
                    showDeviceData(null)
                }

                homeSwitchPopup?.refreshData(homeBeans)
            }

            override fun onError(errorCode: String, error: String) {
                // no something
            }
        })
    }
    /*****************************************家庭管理******END************************************************/
    //===============================================================================================
    /*****************************************设备管理********START**********************************************/

    //初始化家庭设备数据
    fun initFamilyDevice(homeBeanF: HomeBean) {
        val currentHomeId = AppConfig.getCurrentHomeId()
        if (currentHomeId != homeBeanF.homeId) {
            AppConfig.setCurrentHomeId(homeBeanF.homeId)
            //注销设备监听
            if (currentHomeId > 0) {
                ThingHomeSdk.newHomeInstance(currentHomeId)
                    .unRegisterHomeStatusListener(homeStatusListener)
            }
        }
        //注册设备监听
        ThingHomeSdk.newHomeInstance(homeBeanF.homeId)
            .registerHomeStatusListener(homeStatusListener)
        getDeviceData()
    }


    private fun getDeviceData() {
        //初始化家庭数据
        ThingHomeSdk.newHomeInstance(AppConfig.getCurrentHomeId())
            .getHomeDetail(object : IThingHomeResultCallback {
                override fun onSuccess(homeBean: HomeBean) {
                    changeRefreshState()
                    val deviceList = homeBean.deviceList
                    Log.e("===1", "设备个数：${deviceList.size}")
                    showDeviceData(deviceList)
                }

                override fun onError(errorCode: String, errorMsg: String) {
                    changeRefreshState()
                }
            })
    }

    fun showDeviceData(deviceList: List<DeviceBean>? = null) {
        if (deviceList?.isNotEmpty() == true) {
            binding.recyclerDevices.visibility = View.VISIBLE
            binding.llDevicesEmpty.visibility = View.GONE
            if(deviceList.size > 2) {
                binding.llDeviceMore.visibility = View.VISIBLE
                devicesAdapter.setList(deviceList.subList(0, 2))
            }else{
                binding.llDeviceMore.visibility = View.GONE
                devicesAdapter.setList(deviceList)
            }
        } else {
            binding.recyclerDevices.visibility = View.GONE
            binding.llDevicesEmpty.visibility = View.VISIBLE
            binding.llDeviceMore.visibility = View.GONE
        }
    }

    //去设备配网
    private fun goToDeviceDistributionNetwork() {
        if (AppConfig.getCurrentHomeId() <= 0) {
            ToastUtil.showToast("请先创建家庭")
            return
        }
        startActivity(Intent(context, DeviceDistributionNetworkActivity::class.java))
    }

    fun initDevices() {
        binding.btnAddDevice.setOnClickListener {
            goToDeviceDistributionNetwork()
        }
        binding.llDeviceMore.setOnClickListener {
            //更多
            startActivity(Intent(context, MyDevicesActivity::class.java))
        }
        var spanCount = 2
        var devicesLayoutManager = ScrollerGridLayoutManager(activity, spanCount)
        binding.recyclerDevices.layoutManager = devicesLayoutManager
        binding.recyclerDevices.addItemDecoration(GridItemDecoration(spanCount, 10, false))
        devicesAdapter.isHome = true
        binding.recyclerDevices.adapter = devicesAdapter
    }
    /*****************************************设备管理********END**********************************************/
    //===============================================================================================
    /*****************************************公仔********START**********************************************/
    fun initToys() {
        binding.btnAddToy.setOnClickListener {
            //添加公仔
        }
        binding.ivExplain.setOnClickListener {
            //公仔指引
            XPopup.Builder(context)
                .popupAnimation(PopupAnimation.ScrollAlphaFromBottom)
                .offsetY(DensityUtil.dip2px(-10F))
                .asCustom(homeToyGuidePopup)
                .show()
        }
        binding.llToysMore.setOnClickListener {
            //更多
            startActivity(Intent(context, MyToysActivity::class.java))
        }
        var toysLayoutManager =
            ScrollerLinearLayoutManager(activity, LinearLayoutManager.HORIZONTAL, false)
        binding.recyclerToys.layoutManager = toysLayoutManager
        binding.recyclerToys.addItemDecoration(HorizontalItemDecoration(10, false))
        toysAdapter.isHomeDisplay = true
        binding.recyclerToys.adapter = toysAdapter

    }
    /*****************************************公仔********END**********************************************/
    //==============================================================================================
    /*****************************************explore toy********START**********************************************/
    fun initExploreToy() {
        ViewDrawUtils.viewScreenWidthSetHeight(
            binding.bannerToy,
            TalenpalApplication.widthPixels - DensityUtil.dip2px(40f),
            (327f / 290f).toDouble()
        )
        binding.bannerToy.setAdapter(homeBannerToyAdapter, false)
            .isAutoLoop(false)
            .setBannerGalleryEffect(10, 10)
            .addBannerLifecycleObserver(this)
    }

    /*****************************************explore toy********END**********************************************/

    /*****************************************Sass 接口请求********START**********************************************/
    private fun getBannerList() {
        HttpUtils.getInstance()
            .setShowLoading(false)
            .request(RetrofitClint.getApi().bannerList(),object :HttpCall<List<BannerModel>>{
            override fun onSuccess(model: List<BannerModel>?) {
                changeRefreshState()
                binding.banner.visibility =  if(!model.isNullOrEmpty()) View.VISIBLE else View.GONE
                binding.banner.adapter.setDatas(model)
            }

            override fun onError(code: String?, msg: String?) {
                changeRefreshState()
            }

        })
    }
    private fun getDollInstanceList_toys() {
      HttpUtils.getInstance()
          .setShowLoading(false)
          .request(RetrofitClint.getApi().dollInstanceList(1,5, "ip,creative"),object :HttpCall<DollInstanceModel>{
          override fun onSuccess(model: DollInstanceModel) {
              changeRefreshState()
              toysAdapter.setList(model.list)
              if(!model.list.isNullOrEmpty()){
                  binding.recyclerToys.visibility = View.VISIBLE
                  binding.llToysEmpty.visibility = View.GONE
                  binding.ivExplain.visibility = View.VISIBLE
                  if(model.list.size > 5){
                      binding.llToysMore.visibility = View.VISIBLE
                  }else{
                      binding.llToysMore.visibility = View.GONE
                  }
              }else{
                  binding.recyclerToys.visibility = View.GONE
                  binding.llToysEmpty.visibility = View.VISIBLE
                  binding.llToysMore.visibility = View.GONE
                  binding.ivExplain.visibility = View.GONE
              }
          }

          override fun onError(code: String?, msg: String?) {
              changeRefreshState()
              binding.recyclerToys.visibility = View.GONE
              binding.llToysEmpty.visibility = View.VISIBLE
              binding.llToysMore.visibility = View.GONE
              binding.ivExplain.visibility = View.GONE
          }

      })
    }
    private fun getDollInstanceList_explore_toys() {
        HttpUtils.getInstance()
            .setShowLoading(false)//explore
            .request(RetrofitClint.getApi().dollInstanceList(1,100, "explore"),object :HttpCall<DollInstanceModel>{
                override fun onSuccess(model: DollInstanceModel) {
                    changeRefreshState()
                    binding.toyTabLayout.setData(model.list)
                    homeBannerToyAdapter.setDatas(model.list)
                    binding.toyTabLayout.setupWithViewPager(binding.bannerToy.viewPager2)
                }

                override fun onError(code: String?, msg: String?) {
                    changeRefreshState()
                }

            })
    }
    /*****************************************Sass ********END**********************************************/

    override fun onDestroyView() {
        super.onDestroyView()
        //注销监听
        ThingHomeSdk.getHomeManagerInstance()
            .unRegisterThingHomeChangeListener(homeInviteListener)
        //注销家庭变化监听
        if (AppConfig.getCurrentHomeId() > 0) {
            ThingHomeSdk.newHomeInstance(AppConfig.getCurrentHomeId())
                .unRegisterHomeStatusListener(homeStatusListener)
        }
    }

}
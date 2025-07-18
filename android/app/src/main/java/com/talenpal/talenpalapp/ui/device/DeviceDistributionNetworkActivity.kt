package com.talenpal.talenpalapp.ui.device

import android.Manifest
import android.animation.ObjectAnimator
import android.bluetooth.BluetoothAdapter
import android.content.ActivityNotFoundException
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.Uri
import android.net.wifi.WifiManager
import android.os.Build
import android.provider.Settings
import android.view.View
import android.view.animation.Animation
import android.view.animation.LinearInterpolator
import androidx.core.app.ActivityCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.lxj.xpopup.XPopup
import com.lxj.xpopup.enums.PopupAnimation
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.adapter.DeviceFindAdapter
import com.talenpal.talenpalapp.adapter.DeviceTypeAdapter
import com.talenpal.talenpalapp.bean.CustomScanDeviceBean
import com.talenpal.talenpalapp.config.Constant
import com.talenpal.talenpalapp.config.EventCode
import com.talenpal.talenpalapp.config.PermissionCode
import com.talenpal.talenpalapp.databinding.ActivityDeviceDistributionNetworkBinding
import com.talenpal.talenpalapp.dialog.BluetoothPermissionPopup
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.dialog.WifiPermissionPopup
import com.talenpal.talenpalapp.http.call.HttpCall
import com.talenpal.talenpalapp.http.model.DollModel
import com.talenpal.talenpalapp.http.util.HttpUtils
import com.talenpal.talenpalapp.http.util.RetrofitClint
import com.talenpal.talenpalapp.ui.other.WebActivity
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.EventBusUtil
import com.talenpal.talenpalapp.util.ToastUtil
import com.talenpal.talenpalapp.view.ClickableTextView
import com.talenpal.talenpalapp.view.GridItemDecoration
import com.talenpal.talenpalapp.view.HorizontalItemDecoration
import com.talenpal.talenpalapp.view.ScrollerGridLayoutManager
import com.thingclips.smart.android.ble.api.LeScanSetting
import com.thingclips.smart.android.ble.api.ScanDeviceBean
import com.thingclips.smart.android.ble.api.ScanType
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.bean.ConfigProductInfoBean
import com.thingclips.smart.sdk.api.IThingDataCallback
import `in`.xiandan.countdowntimer.CountDownTimerSupport
import `in`.xiandan.countdowntimer.OnCountDownTimerListener
import org.xutils.common.util.DensityUtil


class DeviceDistributionNetworkActivity : BaseActivity<ActivityDeviceDistributionNetworkBinding>() {
    private val deviceTypeAdapter by lazy { DeviceTypeAdapter() }
    private val deviceFindAdapter by lazy { DeviceFindAdapter() }
    private val bluetoothPermissionPopup by lazy {
        BluetoothPermissionPopup(this)
    }
    private val wifiPermissionPopup by lazy {
        WifiPermissionPopup(this)
    }
    lateinit var xpBluetooth: XPopup.Builder
    lateinit var xpWifi: XPopup.Builder
    private var isPermissonBlutooth = false
    private var isOpenBluetooth = false
    private var isOpenWifi = false
    private var isPermissonLocation = false
    private var mTimer: CountDownTimerSupport? = null
    private val SCAN_TIME_OUT = 60 * 1000L //扫描超时时间
    private val AUTO_CONNECT_TIME = 10 * 1000L //自动连接倒计时
    private var mAutoTimer: CountDownTimerSupport? = null

    override fun initView() {
        setTitle(getString(R.string.add_device))
        //倒计时
        mTimer = CountDownTimerSupport(
            SCAN_TIME_OUT,
            Constant.COUNT_DOWN_INTERVAL
        )
        mTimer?.setOnCountDownTimerListener(countDownTimerListener)

        mAutoTimer = CountDownTimerSupport(
            AUTO_CONNECT_TIME,
            Constant.COUNT_DOWN_INTERVAL
        )
        mAutoTimer?.setOnCountDownTimerListener(autoConnectTimerListener)


        //动画
        animatorRotation(binding.ivRadarSmall)
        animatorRotation(binding.ivRadarBig)
        //配网中
        binding.tvNetworkTip.setMixedParts(getString(R.string.activator_auto_search_text_new)," ",
            ClickableTextView.ClickableText(getString(R.string.thing_activator_auto_search_highlight_text)) {
                startActivity(
                    Intent(this@DeviceDistributionNetworkActivity, WebActivity::class.java)
                        .putExtra("title", getString(R.string.thing_activator_auto_search_highlight_text))
                        .putExtra("url", "")
                )
            },)
        //配网超时
        binding.ctTryagain.setMixedParts("Please check the ",
            ClickableTextView.ClickableText("help") {
                startActivity(
                    Intent(this@DeviceDistributionNetworkActivity, WebActivity::class.java)
                        .putExtra("title", "help")
                        .putExtra("url", "")
                )
            },
            " and confirm that the device is waiting to be connected"
            )

        //找到设备
        binding.recyclerviewFind.layoutManager =
            LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        binding.recyclerviewFind.addItemDecoration(HorizontalItemDecoration(10, false))
        deviceFindAdapter.onDeviceFindListener = object : DeviceFindAdapter.OnDeviceFindListener {

            override fun toAddDevice() {
                //跳转添加设备 停止扫描
                if(mTimer != null){
                    mTimer?.stop()
                }
                stopLeScan()
            }
        }
        binding.recyclerviewFind.adapter = deviceFindAdapter

        binding.btnAdd.setOnClickListener {
            deviceFindAdapter.toAddDevice()
        }

        //自动倒计时
        binding.tvCancelAutoTimer.setOnClickListener {
            binding.llAutoTimer.visibility = View.GONE
            if(mAutoTimer != null){
                mAutoTimer?.stop()
            }
        }

        //超时
        binding.btnTryAgain.setOnClickListener {
            updateDeviceUI(1)
        }

        //手动添加
        var spanCount = 4
        binding.recyclerviewType.layoutManager = ScrollerGridLayoutManager(this, spanCount)
        binding.recyclerviewType.addItemDecoration(GridItemDecoration(4, spanCount, false))
        binding.recyclerviewType.adapter = deviceTypeAdapter

        initWifiAndBluetooth()

        //开始扫描  扫描中
        updateDeviceUI(1)
    }

    override fun initData() {
        //获取手动添加的列表
        getDollModel()
    }

    fun initWifiAndBluetooth() {
        //蓝牙权限弹窗
        xpBluetooth = XPopup.Builder(this)
            .popupAnimation(PopupAnimation.ScrollAlphaFromBottom)
            .offsetY(DensityUtil.dip2px(-10F))
        //wifi权限弹窗
        xpWifi = XPopup.Builder(this)
            .popupAnimation(PopupAnimation.ScrollAlphaFromBottom)
            .offsetY(DensityUtil.dip2px(-10F))

        bluetoothPermissionPopup.setBluetoothPermissionListener(object :
            BluetoothPermissionPopup.OnBluetoothPermissionListener {
            override fun requestPermission() {
                //蓝牙权限
                requestPermissionsFun(
                    getBluetoothPermissionsArr(),
                    PermissionCode.BLUETOOTH_REQUEST_CODE
                )
            }

            override fun goToSetting() {
                requestOpenBluetooth()
            }

        })
        wifiPermissionPopup.setOnWifiPermissionListener(object :
            WifiPermissionPopup.OnWifiPermissionListener {
            override fun requestPermission() {
                // 请求位置权限（Wi-Fi 扫描需要）
                requestPermissionsFun(
                    arrayOf(
                        Manifest.permission.ACCESS_COARSE_LOCATION,
                        Manifest.permission.ACCESS_FINE_LOCATION
                    ),
                    PermissionCode.LOCATION_REQUEST_CODE
                )
            }

            override fun goToSetting() {
                openWifiSettings()
            }
        })

        //是否有蓝牙权限
        isPermissonBlutooth = checkPermissions(getBluetoothPermissionsArr())
        //是否开启蓝牙
        isOpenBluetooth = isBluetoothEnabled()
        binding.llBluetoothPermission.visibility =
            if (isPermissonBlutooth && isOpenBluetooth) View.GONE else View.VISIBLE
        binding.llBluetoothPermission.setOnClickListener {
            bluetoothPermissionPopup.setBluetoothOpenAndPermission(
                isOpenBluetooth,
                isPermissonBlutooth
            )
            xpBluetooth.asCustom(bluetoothPermissionPopup)
                .show()
        }
        //是否有wifi权限
        isOpenWifi = isWifiEnabled()
        //是否有定位权限
        isPermissonLocation = checkPermissions(
            arrayOf(
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        )
        binding.llWifiPermission.visibility =
            if (isPermissonLocation && isOpenWifi) View.GONE else View.VISIBLE
        binding.llWifiPermission.setOnClickListener {
            wifiPermissionPopup.setWifiOpenAndPermission(isOpenWifi, isPermissonLocation)
            xpWifi.asCustom(wifiPermissionPopup)
                .show()
        }

        //检查蓝牙和wifi
        if (!isPermissonBlutooth || !isOpenBluetooth) {
            bluetoothPermissionPopup.setBluetoothOpenAndPermission(
                isOpenBluetooth,
                isPermissonBlutooth
            )
            xpBluetooth.asCustom(bluetoothPermissionPopup)
                .show()
        } else if (!isOpenWifi || !isPermissonLocation) {
            wifiPermissionPopup.setWifiOpenAndPermission(isOpenWifi, isPermissonLocation)
            xpWifi.asCustom(wifiPermissionPopup)
                .show()
        }
    }

    //刷新蓝牙显示
    private fun updateBluetoothUI() {
        bluetoothPermissionPopup.post {
            bluetoothPermissionPopup.setBluetoothOpenAndPermission(
                isOpenBluetooth,
                isPermissonBlutooth
            )
        }
        binding.llBluetoothPermission.visibility =
            if (isPermissonBlutooth && isOpenBluetooth) View.GONE else View.VISIBLE
        //打开wifi弹窗
        if (isOpenBluetooth && isPermissonBlutooth && (!isOpenWifi || !isPermissonLocation)) {
            wifiPermissionPopup.setWifiOpenAndPermission(isOpenWifi, isPermissonLocation)
            xpWifi.asCustom(wifiPermissionPopup)
                .show()
        }
        updatePermissionAfterScan()
    }

    //刷新wifi显示
    private fun updateWifiUI() {
        wifiPermissionPopup.setWifiOpenAndPermission(isOpenWifi, isPermissonLocation)
        binding.llWifiPermission.visibility =
            if (isOpenWifi && isPermissonLocation) View.GONE else View.VISIBLE
        updatePermissionAfterScan()
    }

    //权限更新后开始扫描
    private fun updatePermissionAfterScan() {
        if (isPermissonBlutooth && isOpenBluetooth && isPermissonLocation && isOpenWifi) {
            updateDeviceUI(1)
        }
    }

    private fun getBluetoothPermissionsArr(): Array<String> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return arrayOf(Manifest.permission.BLUETOOTH_CONNECT,Manifest.permission.BLUETOOTH_SCAN)
        }
        return arrayOf(Manifest.permission.BLUETOOTH)
    }

    /**
     * if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {// Android 6.0到Android 11
     *       permissionList.add(Manifest.permission.ACCESS_FINE_LOCATION)// 精确位置
     *       permissionList.add(Manifest.permission.ACCESS_COARSE_LOCATION)// 粗略位置
     *   }
     *
     *   if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) { // Android 12及以上
     *       permissionList.add(Manifest.permission.BLUETOOTH_CONNECT)
     *       permissionList.add(Manifest.permission.BLUETOOTH_SCAN)
     *   }
     */

    override fun onResume() {
        super.onResume()
        registerReceiver(
            bluetoothStateReceiver,
            IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED)
        )
        // 注册 Wi-Fi 状态广播
        registerReceiver(wifiStateReceiver, IntentFilter().apply {
            addAction(WifiManager.WIFI_STATE_CHANGED_ACTION)
            addAction(WifiManager.NETWORK_STATE_CHANGED_ACTION) // 新增
        })


        // 检查权限变化
        val newBluetoothPermission =
            checkPermissions(getBluetoothPermissionsArr())
        if (newBluetoothPermission != isPermissonBlutooth) {
            isPermissonBlutooth = newBluetoothPermission
            updateBluetoothUI()
        }

        val newLocationPermission =
            checkPermissions(
                arrayOf(
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                    Manifest.permission.ACCESS_FINE_LOCATION
                )
            )
        if (newLocationPermission != isPermissonLocation) {
            isPermissonLocation = newLocationPermission
            updateWifiUI()
        }
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(bluetoothStateReceiver)
        unregisterReceiver(wifiStateReceiver)
    }

    override fun onDestroy() {
        super.onDestroy()
        stopLeScan()
        if (mTimer != null) {
            mTimer?.stop()
            mTimer = null
        }
        if(mAutoTimer != null){
            mAutoTimer?.stop()
            mAutoTimer = null
        }
    }

    //更新ui显示
    fun updateDeviceUI(state: Int) {
        if (state == 1) {
            //扫描中...
            binding.llNetworking.visibility = View.VISIBLE
            binding.llFindDevice.visibility = View.GONE
            binding.llNoFoundDevice.visibility = View.GONE
            deviceFindAdapter.data.clear()//清除老的数据
            startScan()
        } else if (state == 2) {
            //找到设备
            binding.llNetworking.visibility = View.GONE
            binding.llFindDevice.visibility = View.VISIBLE
            binding.llNoFoundDevice.visibility = View.GONE
            //开启自动倒计时
            binding.llAutoTimer.visibility = View.VISIBLE
            if(mAutoTimer != null){
                mAutoTimer?.reset()
                mAutoTimer?.start()
            }
        } else if (state == 3) {
            //超时，未找到
            binding.llNetworking.visibility = View.GONE
            binding.llFindDevice.visibility = View.GONE
            binding.llNoFoundDevice.visibility = View.VISIBLE
            stopLeScan()
        }
    }

    //发现到设备
    fun checkedFindDeviceShow(count: Int) {
        //发现设备
        if (count > 0) {
            updateDeviceUI(2)
            //关闭倒计时  只能发现一个设备
//            if (mTimer != null) {
//                mTimer?.stop()
//            }
        }
        if (count > 1) {
            //多设备
            binding.llFindDevice.setBackgroundResource(R.drawable.device_find_bg)
            binding.btnAdd.visibility = View.VISIBLE
            deviceFindAdapter.isSingle = false
            deviceFindAdapter.notifyDataSetChanged()
        } else {
            //单设备
            binding.llFindDevice.setBackgroundResource(0)
            binding.btnAdd.visibility = View.GONE
            deviceFindAdapter.isSingle = true
            deviceFindAdapter.notifyDataSetChanged()
        }
    }

    private fun animatorRotation(view: View) {
        val animator = ObjectAnimator.ofFloat(view, "rotation", 0f, 360f)
        animator.duration = 2000
        animator.interpolator = LinearInterpolator()
        animator.repeatCount = Animation.INFINITE
        animator.start()
    }

    // 检查蓝牙是否开启
    private fun isBluetoothEnabled(): Boolean {
        val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
        return bluetoothAdapter?.isEnabled == true
    }

    //检查wifi是否开启
    private fun isWifiEnabled(): Boolean {
        return try {
            val wifiManager =
                applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            // 添加权限检查
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) ==
                    PackageManager.PERMISSION_GRANTED
                    && checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) ==
                    PackageManager.PERMISSION_GRANTED
                ) {
                    wifiManager.isWifiEnabled
                } else {
                    // 无权限时使用备用方案
                    Settings.Global.getInt(contentResolver, "wifi_on") == 1
                }
            } else {
                wifiManager.isWifiEnabled
            }
        } catch (e: Exception) {
            false
        }
    }

    // 请求开启蓝牙
    private fun requestOpenBluetooth() {
        // 检查设备是否支持蓝牙
        if (!packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH)) {
            ToastUtil.showToast("设备不支持蓝牙")
            return
        }

        try {
            // 尝试使用系统对话框请求开启蓝牙
            val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
            for (permission in getBluetoothPermissionsArr()){
                if (ActivityCompat.checkSelfPermission(
                        this,
                        permission
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    return
                }
            }
            startActivityForResult(enableBtIntent, PermissionCode.BLUETOOTH_REQUEST_CODE)
        } catch (e: ActivityNotFoundException) {
            // 备用方案：跳转到蓝牙设置
            val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS)
            startActivityForResult(intent, PermissionCode.BLUETOOTH_REQUEST_CODE)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PermissionCode.BLUETOOTH_REQUEST_CODE) {
            //蓝牙
            var allGranted = true
            for (results in grantResults) {
                allGranted = allGranted and (results == PackageManager.PERMISSION_GRANTED)
            }
            if (allGranted) {
                isPermissonBlutooth = true

                updateBluetoothUI()
            }
        } else if (requestCode == PermissionCode.LOCATION_REQUEST_CODE) {
            // 位置权限处理（用于 Wi-Fi）
            var allGranted = true
            for (results in grantResults) {
                allGranted = allGranted and (results == PackageManager.PERMISSION_GRANTED)
            }
            if (allGranted) {
                isPermissonLocation = true
                updateWifiUI()
            }
        }
    }


    // 处理开启结果
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PermissionCode.BLUETOOTH_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {
                // 用户已开启蓝牙
                isOpenBluetooth = true
                //刷新显示
                updateBluetoothUI()
            }
        }
    }

    //蓝牙广播监听
    private val bluetoothStateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                BluetoothAdapter.ACTION_STATE_CHANGED -> {
                    val state =
                        intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR)
                    when (state) {
                        BluetoothAdapter.STATE_ON -> {
                            isOpenBluetooth = true
                            updateBluetoothUI()
                        }

                        BluetoothAdapter.STATE_OFF -> {
                            isOpenBluetooth = false
                            updateBluetoothUI()
                        }
                    }
                }
            }
        }
    }

    // 在类中添加 Wi-Fi 状态广播接收器
    private val wifiStateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                WifiManager.WIFI_STATE_CHANGED_ACTION -> {
                    val state = intent.getIntExtra(
                        WifiManager.EXTRA_WIFI_STATE,
                        WifiManager.WIFI_STATE_UNKNOWN
                    )
                    when (state) {
                        WifiManager.WIFI_STATE_ENABLED -> {
                            // Wi-Fi 已开启
                            if (!isOpenWifi) {
                                isOpenWifi = true
                                updateWifiUI()
                            }
                        }

                        WifiManager.WIFI_STATE_DISABLED -> {
                            // Wi-Fi 已关闭
                            isOpenWifi = false
                            updateWifiUI()
                        }
                    }
                }
//                // 添加网络连接变化监听
//                WifiManager.NETWORK_STATE_CHANGED_ACTION -> {
//                    isOpenWifi = isWifiEnabled()
//                    updateWifiUI()
//                }
            }
        }
    }

    override fun onPermissionsPermanentlyDenied(requestCode: Int) {
        var permissionName = ""
        if (requestCode == PermissionCode.BLUETOOTH_REQUEST_CODE) {
            permissionName = getString(R.string.bluetooth)
        } else if (requestCode == PermissionCode.LOCATION_REQUEST_CODE) {
            permissionName = getString(R.string.thing_permission_manager_location)
        }
        //权限被永久拒绝
        DialogHelper.showContentDialog(
            this,
            String.format(
                getString(R.string.thing_permission_manager_deny_guide_desc),
                permissionName
            ),
            getString(R.string.cancel),
            getString(R.string.go_set)
        ) {
            // 打开应用设置详情页
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", packageName, null)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            try {
                startActivity(intent)
            } catch (e: ActivityNotFoundException) {
                // 备用方案：打开系统设置首页
                startActivity(Intent(Settings.ACTION_SETTINGS))
            }
        }
    }

    //打开wifi
    private fun openWifiSettings() {
        try {
            val intent = Intent(Settings.ACTION_WIFI_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            // 备用方案：打开系统设置首页
            startActivity(Intent(Settings.ACTION_SETTINGS))
            ToastUtil.showToast("请手动进入 Wi-Fi 设置")
        }
    }

    // 检查系统级定位开关
    private fun isLocationEnabled(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val lm = context.getSystemService(LOCATION_SERVICE) as LocationManager
            lm.isLocationEnabled
        } else {
            val mode = Settings.Secure.getInt(
                context.contentResolver,
                Settings.Secure.LOCATION_MODE, Settings.Secure.LOCATION_MODE_OFF
            )
            mode != Settings.Secure.LOCATION_MODE_OFF
        }
    }

    /*********************开始扫描*********************************/
    //倒计时结束回调
    //倒计时
    private var countDownTimerListener = object : OnCountDownTimerListener {
        override fun onTick(millisUntilFinished: Long) {
        }

        override fun onFinish() {
            // 倒计时结束
            stopLeScan()
            updateDeviceUI(3)
        }

        override fun onCancel() {
            // 倒计时手动停止
        }
    }

    /**开始扫描
     * 蓝牙设备扫描前需要进行权限检测，只有 具备权限才能正常扫描：
     *
     *     蓝牙是否打开。
     *     应用是否具有定位权限。
     */
    private fun startScan() {
        if (!isOpenBluetooth || !isOpenWifi || !isPermissonBlutooth || !isPermissonLocation) {
            return
        }

        //开启倒计时
        if (mTimer != null) {
            mTimer?.reset()
            mTimer?.start()
        }

        val scanSetting = LeScanSetting.Builder()
            .setTimeout(SCAN_TIME_OUT) // 扫描的超时时间：ms
            .addScanType(ScanType.SINGLE) // 若需要扫描蓝牙设备，则只需要添加 ScanType.SINGLE
            .build()

        // 开始扫描
        ThingHomeSdk.getBleOperator().startLeScan(
            scanSetting
        ) { bean -> //扫描回调结果
            queryDeviceName(bean)
        }

    }

    //查询设备名称
    private fun queryDeviceName(scanDeviceBean: ScanDeviceBean?) {
        ThingHomeSdk.getActivatorInstance().getActivatorDeviceInfo(
            scanDeviceBean?.productId,
            scanDeviceBean?.uuid,
            scanDeviceBean?.mac,
            object : IThingDataCallback<ConfigProductInfoBean?> {
                override fun onSuccess(result: ConfigProductInfoBean?) {
                    if (result != null) {
                        deviceFindAdapter.addData(CustomScanDeviceBean(scanDeviceBean, result))
                        checkedFindDeviceShow(deviceFindAdapter.itemCount)
                    }
                }

                override fun onError(errorCode: String, errorMessage: String) {
//                    Log.e("===", "查询设备名称失败：$errorMessage")
                }
            })

    }

    /**停止扫描
     * 当退出配网页面或者在执行设备入网时，建议停止设备扫描，以防止扫描影响到配网过程。
     */
    private fun stopLeScan() {
        ThingHomeSdk.getBleOperator().stopLeScan()
    }

    /******************************************************/

    /************************手动配网**START**************************/
    fun getDollModel(){
        HttpUtils.getInstance().request(RetrofitClint.getApi().dollModelList,object :HttpCall<List<DollModel>>{
            override fun onSuccess(models: List<DollModel>?) {
                deviceTypeAdapter.setList(models)
            }

            override fun onError(code: String?, msg: String?) {
            }

        })
    }
    /**********************手动配网**END******************************/

    /****************************自动配网***START************************/
    //自动配网倒计时
    private var autoConnectTimerListener = object : OnCountDownTimerListener {
        override fun onTick(millisUntilFinished: Long) {
            binding.tvCancelAutoTimer.text = String.format(getString(R.string.ble_tem_auto_add_device_cancel),"${(millisUntilFinished / 1000)}s")
        }

        override fun onFinish() {
            // 倒计时结束
            stopLeScan()
            binding.llAutoTimer.visibility = View.GONE
            //跳转
            deviceFindAdapter.toAddDevice(true)
        }

        override fun onCancel() {
            // 倒计时手动停止
            binding.llAutoTimer.visibility = View.GONE
        }
    }
    /****************************自动配网***END************************/

    override fun receiveEvent(event: EventBusUtil.MessageEvent?) {
        super.receiveEvent(event)
        when (event?.code) {
            EventCode.EVENT_REBOOT_DEVICE -> {
                //先停止扫描
                stopLeScan()
                //重启设备 重新开始扫描
                updateDeviceUI(1)
            }
        }
    }

}
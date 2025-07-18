package com.talenpal.talenpalapp.ui.toy

import android.view.View
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.scwang.smart.refresh.layout.constant.RefreshState
import com.talenpal.talenpalapp.R
import com.talenpal.talenpalapp.adapter.HomeToysAdapter
import com.talenpal.talenpalapp.databinding.ActivityMyToysBinding
import com.talenpal.talenpalapp.dialog.DialogHelper
import com.talenpal.talenpalapp.http.call.HttpCall
import com.talenpal.talenpalapp.http.model.DollInstanceModel
import com.talenpal.talenpalapp.http.model.DollItemModel
import com.talenpal.talenpalapp.http.util.HttpUtils
import com.talenpal.talenpalapp.http.util.RetrofitClint
import com.talenpal.talenpalapp.ui.base.BaseActivity
import com.talenpal.talenpalapp.util.ToastUtil
import com.talenpal.talenpalapp.view.VerticalItemDecoration

class MyToysActivity : BaseActivity<ActivityMyToysBinding>() {
    private val toysAdapter by lazy { HomeToysAdapter() }
    private var isManager = false//是否进入管理
    private var page = 1
    private val pageSize = 10
    private var listData = ArrayList<DollItemModel>()
    override fun initView() {
        setTitle(getString(R.string.my_toys))
        setRightText(getString(R.string.thing_light_manage))

        binding.btnDel.setOnClickListener {
            delDeviceFun()
        }
        binding.btnTopUp.setOnClickListener {
            topUpFun()
        }

        binding.recyclerview.layoutManager = LinearLayoutManager(this)
        binding.recyclerview.addItemDecoration(VerticalItemDecoration(12,true))
        binding.recyclerview.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrollStateChanged(recyclerView: RecyclerView, newState: Int) {
                if (newState == RecyclerView.SCROLL_STATE_IDLE) {
                    toysAdapter.notifyDataSetChanged()
                }
            }
        })
        binding.recyclerview.adapter = toysAdapter

        binding.refreshLayout.setOnRefreshListener {
            page = 1
            getDataList()
        }
        binding.refreshLayout.setOnLoadMoreListener {
            page++
            getDataList()
        }
    }

    override fun onLeftBtnClickListener() {
        if(isManager){
            switchManager()
        }else{
            onBackPressed()
        }
    }

    override fun onRightBtnClickListener() {
        switchManager()
    }

    fun switchManager() {
        isManager = !isManager
        if (isManager) {
            setLeftText(getString(R.string.cancel))
            setRightText(getString(R.string.finish))
            binding.llManagerBottom.visibility = View.VISIBLE
        } else {
            setLeftText("")//显示返回按钮
            setRightText(getString(R.string.thing_light_manage))
            binding.llManagerBottom.visibility = View.GONE
        }
        toysAdapter.setIsManager(isManager)
    }

    override fun initData() {
        getDataList()
    }

    private fun getDataList() {
        HttpUtils.getInstance()
            .request(RetrofitClint.getApi().dollInstanceList(page,pageSize, "ip,creative"),object :
                HttpCall<DollInstanceModel> {
                override fun onSuccess(model: DollInstanceModel) {
                    if(page == 1){
                        listData.clear()
                    }
                    listData.addAll(model.list!!)
                    toysAdapter.setList(listData)
                    if(model.total <= page * pageSize) {
                        binding.refreshLayout.finishLoadMoreWithNoMoreData()
                    }
                    requestFinally()
                }

                override fun onError(code: String?, msg: String?) {
                    requestFinally()
                    ToastUtil.showToast(msg)
                }

            })
    }
    private fun requestFinally(){
        if(binding.refreshLayout.state == RefreshState.Refreshing){
            binding.refreshLayout.finishRefresh()
        }else if(binding.refreshLayout.state == RefreshState.Loading){
            binding.refreshLayout.finishLoadMore()
        }
    }

    private fun topUpFun() {
    }

    private fun delDeviceFun() {
        DialogHelper.showContentDialog( this,getString(R.string.delete_device_m),getString(R.string.confirm_device_deletion)){
            //删除操作
        }
    }
}
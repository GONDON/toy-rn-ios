package com.talenpal.talenpalapp.manager

import com.talenpal.talenpalapp.config.AppConfig
import com.talenpal.talenpalapp.http.call.HttpCall
import com.talenpal.talenpalapp.http.model.LoginModel
import com.talenpal.talenpalapp.http.util.HttpUtils
import com.talenpal.talenpalapp.http.util.RetrofitClint
import com.talenpal.talenpalapp.listener.WorkListener

object LoginManager {
    /**
     * sass登录
     * {"code":0,"data":{"userId":6,"accessToken":"49cad892453f41b1a4ff06e510649094",
     * "refreshToken":"9e9336a384be49268d018d61a6a747ff","expiresTime":1751861135526,
     * "openid":null},"msg":""}
     */
    fun sassLogin(username: String, password: String,workListener: WorkListener){
        //网络请求
        val map = HashMap<String, String>()
        map["username"] = username
        map["password"] = password
        map["autoRegister"] = true.toString()
        HttpUtils.getInstance()
            .setShowLoading(false)
            .request(
            RetrofitClint.getApi().login(HttpUtils.mapToRequestBody(map)),
            object : HttpCall<LoginModel> {
                override fun onSuccess(model: LoginModel?) {
                    AppConfig.setToken(model?.accessToken)
                    workListener.onSuccess( model)
                }

                override fun onError(code: String?, msg: String?) {
                    workListener.failed(code, msg)
                }

            })
    }

    fun outLogin(){
        AppConfig.saveUser(null)
        AppConfig.setToken("")
    }
}
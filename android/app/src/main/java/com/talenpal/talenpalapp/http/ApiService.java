package com.talenpal.talenpalapp.http;


import com.talenpal.talenpalapp.http.model.BannerModel;
import com.talenpal.talenpalapp.http.model.CommonResponse;
import com.talenpal.talenpalapp.http.model.DollInstanceModel;
import com.talenpal.talenpalapp.http.model.DollModel;
import com.talenpal.talenpalapp.http.model.LoginModel;
import com.talenpal.talenpalapp.http.model.SplashScreenModel;


import java.util.List;

import io.reactivex.rxjava3.core.Observable;
import okhttp3.RequestBody;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

/**
 *
 * @QueryMap 查询请求
 * @Body 多用于post请求发送非表单数据，例如发送日志
 **/
public interface ApiService {

    /**
     * 登录
     */
    @POST("app-api/member/auth/login")
    Observable<CommonResponse<LoginModel>> login(@Body RequestBody requestBody);

    /**
     * 获得公仔型号
     */
    @GET("app-api/doll/model/list")
    Observable<CommonResponse<List<DollModel>>> getDollModelList();

    /**
     * banner图
     */
    @GET("app-api/content/banner/list")
    Observable<CommonResponse<List<BannerModel>>> bannerList();

    /**
     * 获得用户公仔实例分页
     */
    @GET("app-api/doll/instance/page")
    Observable<CommonResponse<DollInstanceModel>> dollInstanceList(
            @Query("pageNo") int page,
            @Query("pageSize") int size,
            @Query("dollModelType") String type
    );

    /**
     * App启动页列表
     */
    @GET("app-api/content/splash-screen/list")
    Observable<CommonResponse<List<SplashScreenModel>>> getSplashScreenList();

}


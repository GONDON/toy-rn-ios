package com.talenpal.talenpalapp.http.util;

import android.text.TextUtils;
import android.util.Log;

import com.talenpal.talenpalapp.config.ApiConfig;
import com.talenpal.talenpalapp.config.AppConfig;
import com.talenpal.talenpalapp.http.ApiService;

import java.io.IOException;
import okio.Buffer;
import java.util.concurrent.TimeUnit;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.adapter.rxjava3.RxJava3CallAdapterFactory;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * 网络连接工具类
 **/
public class RetrofitClint {

    private static Retrofit retrofit = null;
    private static final String CONNECT_TIMEOUT = "CONNECT_TIMEOUT";
    private static final String READ_TIMEOUT = "READ_TIMEOUT";
    private static final String WRITE_TIMEOUT = "WRITE_TIMEOUT";
    private static final long DEFAULT_CONNECT_TIME_OUT = 120L;
    private static final long DEFAULT_WRITE_TIME_OUT = 20L;
    private static final long DEFAULT_READ_TIME_OUT = 20L;

    /**
     * 初始化Retrofit
     *
     * @return
     */
    private static Retrofit initRetrofit() {
        if (retrofit == null) {
            synchronized (RetrofitClint.class){
                if(retrofit == null){
                    loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);//日志打印等级
                    OkHttpClient okHttpClient = new OkHttpClient.Builder()
                            .retryOnConnectionFailure(true)
                            .addInterceptor(timeoutInterceptor)
                            .addInterceptor(sCommonInterceptor)
                            .addInterceptor(responInterceptor)
                            .addNetworkInterceptor(loggingInterceptor)
                            .connectTimeout(DEFAULT_CONNECT_TIME_OUT, TimeUnit.SECONDS)
                            .writeTimeout(DEFAULT_WRITE_TIME_OUT, TimeUnit.SECONDS)
                            .readTimeout(DEFAULT_READ_TIME_OUT, TimeUnit.SECONDS)
                            .build();

                    retrofit = new Retrofit.Builder()
                            .baseUrl(ApiConfig.BASE_URL)
                            .addConverterFactory(GsonConverterFactory.create())
                            .addCallAdapterFactory(RxJava3CallAdapterFactory.create())
                            .client(okHttpClient)
                            .build();
                }
            }
        }
        return retrofit;
    }

    public static ApiService getApi() {
        return initRetrofit().create(ApiService.class);
    }

    /**
     * 修改请求时间
     */
    private static final Interceptor timeoutInterceptor = chain -> {
        Request request = chain.request();
        int connectTimeout = chain.connectTimeoutMillis();
        int readTimeout = chain.readTimeoutMillis();
        int writeTimeout = chain.writeTimeoutMillis();

        String connectNew = request.header(CONNECT_TIMEOUT);
        String readNew = request.header(READ_TIMEOUT);
        String writeNew = request.header(WRITE_TIMEOUT);

        if (connectNew != null && connectNew.length() > 0 && TextUtils.isDigitsOnly(connectNew)) {
            connectTimeout = Integer.parseInt(connectNew);
        }
        if (readNew != null && readNew.length() > 0 && TextUtils.isDigitsOnly(readNew)) {
            readTimeout = Integer.parseInt(readNew);
        }
        if (writeNew != null && writeNew.length() > 0 && TextUtils.isDigitsOnly(writeNew)) {
            writeTimeout = Integer.parseInt(writeNew);
        }

        return chain
                .withConnectTimeout(connectTimeout, TimeUnit.MILLISECONDS)
                .withReadTimeout(readTimeout, TimeUnit.MILLISECONDS)
                .withWriteTimeout(writeTimeout, TimeUnit.MILLISECONDS)
                .proceed(request);
    };

    /**
     * 封装公共参数
     */
    private static final Interceptor sCommonInterceptor = chain -> {
        Request oldRequest = chain.request();
        // header添加domain
        Request.Builder requestBuilder = oldRequest.newBuilder();
        String token = AppConfig.getToken();
        if(!TextUtils.isEmpty(token)){
            requestBuilder.addHeader("Authorization","Bearer "+token);
        }
        return chain.proceed(requestBuilder.build());
    };
    private static final Interceptor responInterceptor = new Interceptor() {
        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();
            String url = request.url().toString();
            Log.d("RetrofitClint-请求url:",url);
            if(request.body() != null){
                final RequestBody requestBody = request.body();
                try (final Buffer buffer = new Buffer()) {
                    requestBody.writeTo(buffer);
                    String requestParams = buffer.readUtf8(); // 使用 UTF-8 读取字节流
                    Log.d("RetrofitClint-请求参数:", requestParams); // 打印请求参数
                }
            }
            Response response = chain.proceed(request);
            Response.Builder builder = response.newBuilder();
            Response clone = builder.build();
            ResponseBody body = clone.body();
            if (body != null) {
                MediaType mediaType = body.contentType();
                if (mediaType != null) {
                    if (mediaType.subtype().equals("json") || mediaType.type().equals("text")) {
                        String resp = body.string();
                        if(!TextUtils.isEmpty(resp)){
                            Log.d("RetrofitClint-响应参数:",resp);
                        }
                        body = ResponseBody.create(mediaType, resp);
                        return response.newBuilder().body(body).build();
                    }
                }
            }
            return response;
        }
    };

    static HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor(new HttpLoggingInterceptor.Logger()
    {
        @Override
        public void log(String message)
        {
//            if (BuildConfig.DEBUG) Log.d("Http", message+"");
        }
    });

}
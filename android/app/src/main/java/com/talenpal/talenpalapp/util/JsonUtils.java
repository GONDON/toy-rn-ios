package com.talenpal.talenpalapp.util;


import android.text.TextUtils;

import com.alibaba.fastjson.JSON;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by SCYDB on 2018/6/27.
 */
public class JsonUtils {

    public static Object jsonParser(String jsonStr, Class<?> clazz) {
        if(TextUtils.isEmpty(jsonStr))return null;
        if (!isJson(jsonStr)) {
            return jsonStr;
        }
        if (isJsonArray(jsonStr)) {
            return jsonParserArray(jsonStr, clazz);
        } else {
            return jsonParserObject(jsonStr, clazz);
        }
    }

    /**
     * 判断字符串是否是json
     *
     * @param str
     * @return
     */
    private static boolean isJson(String str) {
        boolean result = false;
        try {
            Object obj = JSON.parse(str);
            result = true;
        } catch (Exception e) {
            result = false;
        }
        return result;
    }

    /**
     * 解析转成对象
     *
     * @param jsonStr
     * @param clazz
     * @return
     */
    private static Object jsonParserObject(String jsonStr, Class<?> clazz) {
        Object objectClass = null;
        try {
            objectClass = JSON.parseObject(JSON.parse(jsonStr).toString(), clazz);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return objectClass;
    }

    /**
     * 解析转成数组
     *
     * @param jsonStr
     * @param clazz
     * @return
     */
    private static <T> List<T> jsonParserArray(String jsonStr, Class<T> clazz) {
        List<T> listData = new ArrayList<>();
        try {
            listData = JSON.parseArray(JSON.parse(jsonStr).toString(), clazz);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return listData;
    }

    private static boolean isJsonArray(String jsonStr) {
        Object typeObject = null;
        try {
            typeObject = new JSONTokener(jsonStr).nextValue();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (typeObject instanceof JSONArray) {
            return true;
        } else if (typeObject instanceof JSONObject) {
            return false;
        }
        return false;
    }


    public static String toJson(Object obj) {
        return JSON.toJSONString(obj);
    }

}

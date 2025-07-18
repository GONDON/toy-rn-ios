package com.talenpal.talenpalapp.util;

import android.text.TextUtils;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

public class DataUtils {

    //时间不足两位，0补齐
    public static String formatData(int str){
        return String.format("%2d", str).replace(" ", "0");
    }

    //判断数组
    public static boolean isNumberic(String str){
        Pattern pattern = Pattern.compile("[0-9]*");
        return pattern.matcher(str).matches();
    }

    /**
     * 数组转文字串
     * @param listK
     * @return
     */
    public static String lis2StringIds(List<?> listK,String tager){
        if(listK == null)return "";
        String str = listK.toString().replace(" ","");
        return str;
    }

    public static String lis2String(List<?> listK, String tager){
        if(listK == null)return "";
        return  lis2StringIds(listK,tager).replace("[","").replace("]","").replace(",",tager);
    }

    public static String lis2StringByTime(List<?> listK,String tager){
        if(listK == null)return "";
        String strs = "[";
        for(int i = 0;i < listK.size();i ++){
            if(i == listK.size()-1){
                strs += listK.get(i).toString().trim();
            }else {
                strs += listK.get(i).toString().trim()+tager;
            }
        }
        strs += "]";
        return strs;
    }

    /**
     * 文字串转集合
     * @param str
     * @return
     */
    public static List<String> str2List(String str){
        List<String> list = new ArrayList<>();
        if(TextUtils.isEmpty(str))return list;
        if(str.equals("[]"))return list;
        String[] split = str.replace("\"","")
                .replace("[", "")
                .replace("]", "")
                .split(",");
        Collections.addAll(list,split);
        return list;
    }

    /**
     * 更换中间间隔符号
     */
    public static String replaceTag(String str, String oldTag, String newTag){
        return str.replace(oldTag,newTag);
    }

    //集合转数组
    public static String[] listToArrayString(List<?> list){
        if(list == null){
            return new String[]{};
        }
        return (String[])list.toArray(new String[list.size()]);
    }

    public static Integer[] listToArrayInt(List<?> list){
        if(list == null){
            return new Integer[]{};
        }
        return (Integer[])list.toArray(new Integer[list.size()]);
    }

    //对象转Map
    public static Map<String, String> objectToMap(Object obj) {
        Map<String, String> map = new LinkedHashMap<String, String>();
        Class<?> clazz = obj.getClass();
        System.out.println(clazz);
        for (Field field : clazz.getDeclaredFields()) {
            field.setAccessible(true);
            String fieldName = field.getName();
            Object value = null;
            try {
                value = field.get(obj);
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
            if (value == null){
                value = "";
            }
            map.put(fieldName, (String) value);
        }
        return map;
    }

    //md5
    public static String makeMD5(String password) {
        try {
            // 生成一个MD5加密计算摘要
            MessageDigest md = MessageDigest.getInstance("MD5");
            // 计算md5函数
            md.update(password.getBytes());
            // digest()最后确定返回md5 hash值，返回值为8为字符串。因为md5 hash值是16位的hex值，实际上就是8位的字符
            // BigInteger函数则将8位的字符串转换成16位hex值，用字符串来表示；得到字符串形式的hash值
            return new BigInteger(1, md.digest()).toString(16);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

}

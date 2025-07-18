package com.talenpal.talenpalapp.util;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by Administrator on 2018/6/7.
 */

public class DateUtil {

    public static String y_m_d_h_m_s = "yyyy_MM_dd_HH_mm_ss";
    public static String ymdhms = "yyyy-MM-dd HH:mm:ss";
    public static String hms = "HH:mm:ss";
    public static String hm = "HH:mm";
    public static String ymd = "yyyy-MM-dd";
    public static String ymdhmsS = "yyyy-MM-dd HH:mm:ss:SSS";

    /**
     * 获取当前时间
     *
     * @param type
     * @return
     */
    public static String getDate(String type) {
        SimpleDateFormat formatter = new SimpleDateFormat(type);
        Date curDate = new Date(System.currentTimeMillis());
        String str = formatter.format(curDate);
        return str;
    }

    /**
     * 获取当前时间毫秒值
     */
    public static String getTime() {
        return String.valueOf(System.currentTimeMillis());
    }

    /**
     * 计算两个日期之间的天数差
     *
     * @param dateStr 日期字符串
     * @return 天数差，如果日期格式错误则返回 -1
     */
    public static int getDateDiff(String dateStr) {
        SimpleDateFormat sdf = new SimpleDateFormat(ymd);
        try {
            Date currentDate = new Date();
            Date targetDate = sdf.parse(dateStr);
            long diff = currentDate.getTime() - targetDate.getTime();
            return (int) (diff / (1000 * 60 * 60 * 24));
        } catch (ParseException e) {
            e.printStackTrace();
            return -1;
        }
    }

    /**
     * 小时转天数，不足一天按小时显示，不足一小时按分钟显示
     */
    public static String getHourToDay(Long hour) {
        if (hour < 0) return "0天";

        if (hour >= 24) {
            Long days = hour / 24;
            Long remainingHours = hour % 24;
            // 处理整天情况
            if (remainingHours == 0) {
                return days + "天";
            }
            return days + "天";// + remainingHours + "小时";
        } else {
            return hour + "小时";
        }
    }
}
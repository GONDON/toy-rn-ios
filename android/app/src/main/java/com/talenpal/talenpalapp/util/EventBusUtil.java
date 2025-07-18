package com.talenpal.talenpalapp.util;

import org.greenrobot.eventbus.EventBus;

public class EventBusUtil {
    public static void register(Object subscriber) {
        if (!EventBus.getDefault().isRegistered(subscriber)) {
            EventBus.getDefault().register(subscriber);
        }
    }
    public static void unregister(Object subscriber) {
        if (EventBus.getDefault().isRegistered(subscriber)) {
            EventBus.getDefault().unregister(subscriber);
        }
    }
    public static void sendEvent(MessageEvent event) {
        EventBus.getDefault().post(event);
    }
    public static void sendStickyEvent(MessageEvent event) {
        EventBus.getDefault().postSticky(event);
    }

    public static class MessageEvent {
        private int code;
        private Object data;
        public MessageEvent(int code) {
            this.code = code;
        }
        public MessageEvent(int code, Object data) {
            this.code = code; this.data = data;
        }
        public int getCode() {
            return code;
        }
        public void setCode(int code) {
            this.code = code;
        }
        public Object getData() {
            return data;
        }
        public void setData(Object data) {
            this.data = data;
        }
    }
}

package com.talenpal.talenpalapp.listener;

import com.thingclips.smart.home.sdk.api.IThingHomeChangeListener;
import com.thingclips.smart.sdk.bean.DeviceBean;
import com.thingclips.smart.sdk.bean.GroupBean;

import java.util.List;

public class HomeInviteListener implements IThingHomeChangeListener {

    @Override
    public void onHomeAdded(long homeId) {

    }

    @Override
    public void onHomeInvite(long homeId, String homeName) {

    }

    @Override
    public void onHomeRemoved(long homeId) {

    }

    @Override
    public void onHomeInfoChanged(long homeId) {

    }

    @Override
    public void onSharedDeviceList(List<DeviceBean> sharedDeviceList) {

    }

    @Override
    public void onSharedGroupList(List<GroupBean> sharedGroupList) {

    }

    @Override
    public void onServerConnectSuccess() {

    }
}

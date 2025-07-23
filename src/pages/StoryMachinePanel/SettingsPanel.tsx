import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  ScrollView,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SettingsPanel = () => {
  // 状态管理
  const [nickname, setNickname] = useState('小米粒');
  const [backgroundInfo, setBackgroundInfo] = useState('');
  const [aiChatEnabled, setAiChatEnabled] = useState(true);
  const [callSettingsEnabled, setCallSettingsEnabled] = useState(true);
  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [backgroundModalVisible, setBackgroundModalVisible] = useState(false);
  const [tempBackgroundInfo, setTempBackgroundInfo] = useState('');
  const [brightness, setBrightness] = useState(9);
  const [volume, setVolume] = useState(9);
  
  // 下载清单相关状态
  const [downloadListVisible, setDownloadListVisible] = useState(false);
  // 新增：公仔选择下拉框状态
  const [showDollDropdown, setShowDollDropdown] = useState(false);
  // 新增：选中的公仔索引
  const [selectedDollIndex, setSelectedDollIndex] = useState(0);

  // 新增：公仔列表模拟数据
  const [dollList] = useState([
    { id: 1, name: '默认公仔', image: require('../../img/doll.png') },
    { id: 2, name: '兔子公仔', image: require('../../img/doll2.png') },
  ]);

  const [downloadList] = useState([
    {
      id: 1,
      title: '小老鼠偷油吃的故事',
      duration: '14.5M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 2,
      title: '小兔子乖乖的故事',
      duration: '12.8M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 3,
      title: '三只小猪的故事',
      duration: '18.2M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 4,
      title: '小红帽的故事',
      duration: '15.6M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 5,
      title: '白雪公主的故事',
      duration: '20.1M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 6,
      title: '灰姑娘的故事',
      duration: '16.9M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 7,
      title: '龙兔超跑的故事',
      duration: '13.4M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 8,
      title: '青蛙王子的故事',
      duration: '17.3M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 9,
      title: '睡美人的故事',
      duration: '19.5M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 10,
      title: '木偶奇遇记',
      duration: '21.2M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 11,
      title: '海的女儿',
      duration: '16.8M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    },
    {
      id: 12,
      title: '丑小鸭的故事',
      duration: '14.7M',
      type: '25好-通用版',
      image: require('../../img/story-default-cover.png'),
    }
  ]);

  // 处理编辑昵称
  const handleEditNickname = () => {
    setTempNickname(nickname);
    setNicknameModalVisible(true);
  };

  // 处理确定修改昵称
  const handleConfirmNickname = () => {
    setNickname(tempNickname);
    setNicknameModalVisible(false);
  };

  // 处理取消修改昵称
  const handleCancelNickname = () => {
    setTempNickname('');
    setNicknameModalVisible(false);
  };

  // 处理编辑背景信息
  const handleEditBackground = () => {
    setTempBackgroundInfo(backgroundInfo);
    setBackgroundModalVisible(true);
  };

  // 处理确定修改背景信息
  const handleConfirmBackground = () => {
    setBackgroundInfo(tempBackgroundInfo);
    setBackgroundModalVisible(false);
  };

  // 处理取消修改背景信息
  const handleCancelBackground = () => {
    setTempBackgroundInfo('');
    setBackgroundModalVisible(false);
  };

  // 新增：处理公仔选择
  const handleSelectDoll = (index: number) => {
    setSelectedDollIndex(index);
    setShowDollDropdown(false);
  };

  // 新增：处理音频播放
  const handlePlayAudio = (id: number) => {
    console.log(`播放音频 ID: ${id}`);
    // 后续在这里处理实际的播放逻辑
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 电量显示 */}
      <View style={styles.batteryContainer}>
        <View style={styles.batteryIcon}>
          <View style={styles.batteryLevel} />
        </View>
        <Text style={styles.batteryText}>100%</Text>
      </View>

      {/* 设备图片 */}
      <View style={styles.deviceContainer}>
        <View style={styles.deviceImageContainer}>
          <Image 
            source={require('../../img/story-machine.png')}
            style={styles.deviceImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* 儿童昵称 */}
      <View style={styles.nicknameSection}>
        <Image 
          source={require('../../img/container-icon.png')}
          style={styles.nicknameAvatar}
        />
        <View style={styles.nicknameContent}>
          <Text style={styles.nicknameLabel}>儿童昵称</Text>
          <Text style={styles.nicknameValue}>{nickname}</Text>
        </View>
        <TouchableOpacity 
          style={styles.nicknameEditButton}
          onPress={handleEditNickname}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../../img/edit-icon.png')}
            style={styles.nicknameEditIcon}
          />
        </TouchableOpacity>
      </View>

      {/* 背景信息 */}
      <View style={styles.backgroundSection}>
        <View style={styles.backgroundContent}>
          <Text style={styles.backgroundLabel}>背景信息</Text>
          <Text style={styles.backgroundValue}>
            {backgroundInfo || '未填写，点击编辑填写信息'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.backgroundEditButton}
          onPress={handleEditBackground}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../../img/edit-icon.png')}
            style={styles.backgroundEditIcon}
          />
        </TouchableOpacity>
      </View>

      {/* AI对话设置 */}
      <Text style={styles.sectionHeaderTitle}>AI对话设置</Text>
      
      <View style={styles.settingsSectionWithoutTitle}>
        {/* AI对话开关 */}
        <View style={[styles.settingItem, styles.firstSettingItem]}>
          <View style={styles.settingLeft}>
            <Image 
              source={require('../../img/group-1403.png')}
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>AI对话</Text>
          </View>
          <Switch
            value={aiChatEnabled}
            onValueChange={setAiChatEnabled}
            trackColor={{ false: '#E5E5E5', true: '#1EAAFD' }}
            thumbColor={aiChatEnabled ? '#FFFFFF' : '#FFFFFF'}
            style={{ marginBottom: 12 }}
          />
        </View>

        {/* AI对话模式 */}
        <TouchableOpacity 
          style={[styles.settingItem, styles.lastSettingItem]}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Image 
              source={require('../../img/group-1409.png')}
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>AI对话模式</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>自然连续对话</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 通话设置 */}
      <Text style={styles.sectionHeaderTitle}>通话设置</Text>
      
      <View style={styles.settingsSectionWithoutTitle}>
        <View style={[styles.settingItem, styles.lastSettingItem]}>
          <View style={styles.settingLeft}>
            <Image 
              source={require('../../img/call-settings.png')}
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>通话设置</Text>
            <View style={styles.helpIcon}>
              <Text style={styles.helpText}>?</Text>
            </View>
          </View>
          <Switch
            value={callSettingsEnabled}
            onValueChange={setCallSettingsEnabled}
            trackColor={{ false: '#E5E5E5', true: '#1EAAFD' }}
            thumbColor={callSettingsEnabled ? '#FFFFFF' : '#FFFFFF'}
            style={{ marginBottom: 12 }}
          />
        </View>
      </View>

      {/* 设备设置 */}
      <Text style={styles.sectionHeaderTitle}>设备设置</Text>
      
      <View style={styles.settingsSectionWithoutTitle}>
        {/* 屏幕亮度 */}
        <View style={[styles.settingItem, styles.firstSettingItem, styles.settingItemWithSlider]}>
          <View style={styles.settingLeft}>
            <Image 
              source={require('../../img/screen-brightness.png')}
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>屏幕亮度</Text>
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Image 
                source={require('../../img/brightness.png')}
                style={styles.sliderIcon}
              />
              <Text style={styles.sliderValue}>{brightness} Gears</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={9}
              step={1}
              value={brightness}
              onValueChange={setBrightness}
              minimumTrackTintColor="#1EAAFD"
              maximumTrackTintColor="#E5E5E5"
              thumbTintColor="#1EAAFD"
            />
          </View>
        </View>

        {/* 最大音量 */}
        <View style={[styles.settingItem, styles.firstSettingItem, styles.settingItemWithSlider]}>
          <View style={styles.settingLeft}>
            <Image 
              source={require('../../img/max-volume.png')}
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>最大音量</Text>
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Image 
                source={require('../../img/volume-icon.png')}
                style={styles.sliderIcon}
              />
              <Text style={styles.sliderValue}>{volume} Gears</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={9}
              step={1}
              value={volume}
              onValueChange={setVolume}
              minimumTrackTintColor="#1EAAFD"
              maximumTrackTintColor="#E5E5E5"
              thumbTintColor="#1EAAFD"
            />
          </View>
        </View>

        {/* 耳机音量限制 */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Image 
              source={require('../../img/headphone-volume-limit.png')}
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>耳机音量限制</Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: '#E5E5E5', true: '#1EAAFD' }}
            thumbColor={'#FFFFFF'}
            style={{ marginBottom: 12 }}
          />
        </View>

        {/* 自动息屏时长 */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Image 
              source={require('../../img/auto-screen-off.png')}
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>自动息屏时长</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>20Min</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </View>
        </View>

        {/* 24小时制 */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Image 
              source={require('../../img/24hour-format.png')}
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>24小时制</Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: '#E5E5E5', true: '#1EAAFD' }}
            thumbColor={'#FFFFFF'}
            style={{ marginBottom: 12 }}
          />
        </View>
      </View>

      {/* 下载清单 */}
      <View style={styles.settingsSectionWithoutTitle}>
        <TouchableOpacity 
          style={[styles.settingItem, styles.lastSettingItem]}
          onPress={() => setDownloadListVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Image 
              source={require('../../img/download-light.png')}
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>下载清单</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.arrowIcon, { marginBottom: 18 }]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 下载清单Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={downloadListVisible}
        onRequestClose={() => setDownloadListVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 弹出框头部 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>下载清单</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setDownloadListVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* 公仔选择下拉框 */}
            <View style={styles.dollDropdownContainer}>
              <TouchableOpacity 
                style={styles.dollDropdownButton}
                onPress={() => setShowDollDropdown(!showDollDropdown)}
              >
                <Text style={styles.dollDropdownButtonText}>
                  {dollList[selectedDollIndex]?.name || '选择公仔'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              
              {showDollDropdown && (
                <ScrollView style={styles.dollDropdownList} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                  {dollList.map((doll, index) => (
                    <TouchableOpacity
                      key={doll.id}
                      style={[
                        styles.dollDropdownItem,
                        index === dollList.length - 1 && styles.dollDropdownItemLast
                      ]}
                      onPress={() => handleSelectDoll(index)}
                    >
                      <Text style={styles.dollDropdownItemText}>{doll.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* 下载内容区域 */}
            {downloadList.length > 0 ? (
              <ScrollView 
                style={styles.downloadListContainer}
                contentContainerStyle={styles.downloadListContent}
                showsVerticalScrollIndicator={false}
              >
                {downloadList.map((item, index) => (
                  <View key={item.id} style={styles.audioItem}>
                    <View style={styles.audioImageContainer}>
                      <Image
                        source={item.image}
                        style={styles.audioImage}
                        resizeMode="cover"
                      />
                      <View style={styles.audioBadge}>
                        <Image
                          source={require('../../img/283.png')}
                          style={styles.audioBadgeBackground}
                          resizeMode="contain"
                        />
                        <Text style={styles.audioBadgeText}>{index + 1}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.audioInfo}>
                      <Text style={styles.audioName} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.audioMeta}>
                        <Text style={styles.audioDuration}>{item.duration}</Text>
                        <Text style={styles.audioType}>{item.type}</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.playButton}
                      onPress={() => handlePlayAudio(item.id)}
                    >
                      <Image
                        source={require('../../img/play11.png')}
                        style={styles.playIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noDataContainer}>
                <Image
                  source={require('../../img/mask-group-33.png')}
                  style={styles.noDataImage}
                  resizeMode="contain"
                />
                <Text style={styles.noDataText}>暂无下载内容</Text>
              </View>
            )}

            {/* 底部按钮 */}
            <View style={styles.downloadModalButtonContainer}>
              <TouchableOpacity
                style={styles.downloadCancelButton}
                onPress={() => setDownloadListVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.downloadCancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.downloadConfirmButton}
                onPress={() => setDownloadListVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.downloadConfirmButtonText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 编辑昵称Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={nicknameModalVisible}
        onRequestClose={handleCancelNickname}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>儿童昵称</Text>
            </View>
            
            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                value={tempNickname}
                onChangeText={setTempNickname}
                placeholder="请输入儿童昵称"
                placeholderTextColor="#999"
                autoFocus
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelNickname}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmNickname}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 编辑背景信息Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={backgroundModalVisible}
        onRequestClose={handleCancelBackground}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>背景信息</Text>
            </View>
            
            <View style={styles.modalContent}>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={tempBackgroundInfo}
                onChangeText={setTempBackgroundInfo}
                placeholder="未填写，点击编辑填写信息"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                autoFocus
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelBackground}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmBackground}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  batteryIcon: {
    width: 24,
    height: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 2,
    marginRight: 8,
    position: 'relative',
  },
  batteryLevel: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 1,
    margin: 1,
  },
  batteryText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  deviceContainer: {
    marginTop: -30,
    marginBottom: 20,
    alignItems: 'center',
  },
  deviceImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceImage: {
    width: 180,
    height: 180,
  },
  nicknameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 16,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  nicknameAvatar: {
    width: 40,
    height: 40,
    borderRadius: 34,
  },
  nicknameContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nicknameLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  nicknameValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  nicknameEditButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nicknameEditIcon: {
    width: 20,
    height: 20,
  },
  backgroundSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 16,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  backgroundContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  backgroundLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  backgroundValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  backgroundEditButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundEditIcon: {
    width: 20,
    height: 20,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  settingsSectionWithoutTitle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 16,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  firstSettingItem: {
    // 第一个设置项可以保持默认样式
  },
  lastSettingItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.9)',
    lineHeight: 20,
  },
  helpIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 10,
    color: '#999999',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#999999',
    marginRight: 8,
    lineHeight: 20,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#999999',
    lineHeight: 20,
  },
  settingItemWithSlider: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  sliderContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  sliderValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  slider: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    height: SCREEN_HEIGHT * 0.8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999999',
    lineHeight: 24,
  },
  downloadListWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  downloadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  downloadItemLeft: {
    flex: 1,
    marginRight: 16,
  },
  downloadItemTitle: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  downloadItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadItemDuration: {
    fontSize: 12,
    color: '#999999',
    marginRight: 8,
  },
  downloadItemType: {
    fontSize: 12,
    color: '#999999',
  },
  downloadItemButton: {
    padding: 8,
  },
  downloadItemIcon: {
    width: 20,
    height: 20,
  },
  noDataContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noDataImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 14,
    color: '#999999',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modalInput: {
    fontSize: 16,
    color: '#333333',
    borderBottomWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
    paddingBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#999999',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  downloadListContainer: {
    flex: 1,
  },
  downloadListContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },

  // 下载清单底部按钮样式
  downloadModalButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingHorizontal: 12,
  },
  downloadCancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 6,
  },
  downloadCancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  downloadConfirmButton: {
    flex: 1,
    backgroundColor: '#1EAAFD',
    borderRadius: 25,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  downloadConfirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // 从 AddDoll 迁移过来的样式
  dollDropdownContainer: {
    marginBottom: 16,
    marginHorizontal: 20,
    position: 'relative',
    zIndex: 1000,
  },
  dollDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dollDropdownButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666666',
  },
  dollDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: 150,
  },
  dollDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  dollDropdownItemLast: {
    borderBottomWidth: 0,
  },
  dollDropdownItemImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  dollDropdownItemText: {
    fontSize: 16,
    color: '#333333',
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  audioImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  audioImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  audioBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioBadgeBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  audioBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  audioInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  audioName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 8,
  },
  audioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioDuration: {
    fontSize: 12,
    color: '#999999',
    marginRight: 12,
  },
  audioType: {
    fontSize: 12,
    color: '#999999',
  },
  playButton: {
    padding: 8,
  },
  playIcon: {
    width: 24,
    height: 24,
  },
});

export default SettingsPanel; 
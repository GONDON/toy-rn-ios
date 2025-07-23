import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Toast from '../../components/Toast';

const { width: screenWidth } = Dimensions.get('window');

export const COLORS = {
  PRIMARY_BLUE: '#1EAAFD',
  BACKGROUND_LIGHT: '#F6F7FB', 
  WHITE: '#FFFFFF',
  TEXT_DARK: '#333333',
  
  // 其他颜色...
};

const AddDoll = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  // 状态管理
  const [dollName, setDollName] = useState('');
  const [currentDollIndex, setCurrentDollIndex] = useState(0);
  // 移除状态，改为动态计算
  const totalStorageTime = 500; // 故事机总内存时间（分钟）
  
  // 音频弹出框相关状态
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [selectedDollForAudio, setSelectedDollForAudio] = useState(0);
  const [showDollDropdown, setShowDollDropdown] = useState(false);
  const [selectedAudioIds, setSelectedAudioIds] = useState<number[]>([]);
  
  // 按公仔索引分组的已添加音频列表
  const [addedAudioByDoll, setAddedAudioByDoll] = useState<{[key: number]: any[]}>({});
  
  // 公仔档案编辑模式状态
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // 公仔切换加载状态
  const [isDollLoading, setIsDollLoading] = useState(false);

  // 重置确认弹窗状态
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  
  // 删除故事确认弹窗状态
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingAudioId, setDeletingAudioId] = useState<number | null>(null);
  
  // 保存音频确认弹窗状态
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  
  // Toast状态
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 获取当前公仔的已添加音频列表
  const getCurrentDollAddedAudioList = () => {
    return addedAudioByDoll[currentDollIndex] || [];
  };

  const currentDollAddedAudioList = getCurrentDollAddedAudioList();
  
  // 按公仔分组的Mock音频数据
  const mockAudioDataByDoll = {
    0: [ // Mickey 的音频
      {
        id: 101,
        name: 'Mickey的奇幻冒险故事名称过长...',
        duration: '14 Min',
        type: '冒险故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 102,
        name: 'Mickey和朋友们的欢乐时光',
        duration: '12 Min', 
        type: '友情故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 103,
        name: 'Mickey的魔法城堡',
        duration: '18 Min',
        type: '魔法故事', 
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 104,
        name: 'Mickey学会分享',
        duration: '10 Min',
        type: '教育故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 105,
        name: 'Mickey的生日派对超级大庆典...',
        duration: '22 Min',
        type: '节日故事',
        image: require('../../img/story-default-cover.png'),
      },
    ],
    1: [ // Toy 12 (第2个) 的音频
      {
        id: 201,
        name: '太空探险记',
        duration: '16 Min',
        type: '科幻故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 202,
        name: '机器人朋友的秘密任务故事...',
        duration: '20 Min', 
        type: '科幻故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 203,
        name: '星际旅行日记',
        duration: '25 Min',
        type: '科幻故事', 
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 204,
        name: '未来世界的一天',
        duration: '15 Min',
        type: '科幻故事',
        image: require('../../img/story-default-cover.png'),
      },
    ],
    2: [ // Toy 12 (第3个) 的音频
      {
        id: 301,
        name: '森林里的小动物音乐会',
        duration: '12 Min',
        type: '音乐故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 302,
        name: '小鸟学唱歌的励志故事名称...',
        duration: '14 Min', 
        type: '音乐故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 303,
        name: '大象的鼻子交响曲',
        duration: '18 Min',
        type: '音乐故事', 
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 304,
        name: '森林音乐节',
        duration: '20 Min',
        type: '音乐故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 305,
        name: '会唱歌的花朵',
        duration: '8 Min',
        type: '音乐故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 306,
        name: '动物们的摇滚音乐会演出...',
        duration: '28 Min',
        type: '音乐故事',
        image: require('../../img/story-default-cover.png'),
      },
    ],
    3: [ // Toy 12 (第4个) 的音频
      {
        id: 401,
        name: '勇敢的小骑士',
        duration: '15 Min',
        type: '勇气故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 402,
        name: '公主拯救王国的英雄事迹故事...',
        duration: '24 Min', 
        type: '勇气故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 403,
        name: '小超人的第一次任务',
        duration: '13 Min',
        type: '勇气故事', 
        image: require('../../img/story-default-cover.png'),
      },
    ],
    4: [ // Toy 12 (第5个) 的音频
      {
        id: 501,
        name: '美味的蛋糕制作过程',
        duration: '10 Min',
        type: '生活故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 502,
        name: '奶奶的秘密食谱传承故事...',
        duration: '16 Min', 
        type: '生活故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 503,
        name: '小厨师的成长日记',
        duration: '12 Min',
        type: '生活故事', 
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 504,
        name: '家庭聚餐的温暖时光',
        duration: '14 Min',
        type: '生活故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: 505,
        name: '学做妈妈拿手菜',
        duration: '11 Min',
        type: '生活故事',
        image: require('../../img/story-default-cover.png'),
      },
    ],
  };

  // 获取当前选择公仔的音频列表
  const getCurrentDollAudioList = () => {
    return mockAudioDataByDoll[selectedDollForAudio as keyof typeof mockAudioDataByDoll] || [];
  };

  const currentAudioList = getCurrentDollAudioList();
  
  // 吸顶动画相关
  const stickyHeaderOpacity = useRef(new Animated.Value(0)).current;
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  
  // 模拟公仔数据（实际应该从接口获取）
  const dollList = [
    { id: 1, name: 'Mickey', image: require('../../img/doll2.png') },
    { id: 2, name: 'Toy 12', image: require('../../img/doll2.png') },
    { id: 3, name: 'Toy 12', image: require('../../img/no-doll.png') },
    { id: 4, name: 'Toy 12', image: require('../../img/no-doll.png') },
    { id: 5, name: 'Toy 12', image: require('../../img/no-doll.png') },
    // 可以添加更多公仔数据
  ];


  const handlePrevDoll = () => {
    if (currentDollIndex > 0 && !isDollLoading) {
      setIsDollLoading(true);
      // 模拟加载过程
      setTimeout(() => {
        setCurrentDollIndex(currentDollIndex - 1);
        setIsDollLoading(false);
      }, 1500); // 1.5秒加载时间
    }
  };

  const handleNextDoll = () => {
    if (currentDollIndex < dollList.length - 1 && !isDollLoading) {
      setIsDollLoading(true);
      // 模拟加载过程
      setTimeout(() => {
        setCurrentDollIndex(currentDollIndex + 1);
        setIsDollLoading(false);
      }, 1500); // 1.5秒加载时间
    }
  };

  const handleSaveDollProfile = () => {
    console.log('保存公仔档案:', { dollName, dollIndex: currentDollIndex });
    // TODO: 实现保存功能
    setIsEditingProfile(false); // 保存后回到展示模式
  };

  const handleEditProfile = () => {
    // 进入编辑模式时，将当前显示的名称回填到输入框
    if (!dollName) {
      setDollName(dollList[currentDollIndex]?.name || '');
    }
    setIsEditingProfile(true);
  };

  const handleAddContent = () => {
    console.log('添加内容');
    setShowAudioModal(true);
  };

  const handleCloseAudioModal = () => {
    setShowAudioModal(false);
    setShowDollDropdown(false);
    // 注意：不清除selectedAudioIds，保持跨公仔选择
  };

  const handleSelectDollForAudio = (index: number) => {
    setSelectedDollForAudio(index);
    setShowDollDropdown(false);
  };

  const handleCancelAudio = () => {
    setShowAudioModal(false);
    setShowDollDropdown(false);
    // 注意：不清除selectedAudioIds，保持跨公仔选择
  };

  const handleConfirmAudio = () => {
    console.log('确认添加音频', selectedAudioIds);
    
    // 检查是否有选中的音频且不超过存储限制
    if (selectedAudioIds.length === 0) {
      console.log('没有选择音频');
      return;
    }
    
    if (addedAudioDuration + selectedAudioDuration > totalStorageTime) {
      console.log('超过存储限制');
      return;
    }
    
    // 显示保存确认弹窗
    setShowSaveConfirmModal(true);
  };

  const handleToggleAudioSelection = (audioId: number) => {
    setSelectedAudioIds(prev => {
      if (prev.includes(audioId)) {
        return prev.filter(id => id !== audioId);
      } else {
        return [...prev, audioId];
      }
    });
  };

  // 计算已添加音频的总时长
  const calculateAddedAudioDuration = () => {
    return currentDollAddedAudioList.reduce((total: number, audio: any) => {
      // 解析duration字符串，如 "14 Min" -> 14
      const minutes = parseInt(audio.duration.replace(/[^\d]/g, ''), 10) || 0;
      return total + minutes;
    }, 0);
  };

  const addedAudioDuration = calculateAddedAudioDuration();

  // 计算弹窗中选择音频的总时长
  const calculateSelectedDuration = () => {
    return selectedAudioIds.reduce((total, audioId) => {
      // 在所有公仔的音频数据中查找
      let foundAudio: any = null;
      Object.values(mockAudioDataByDoll).forEach(audioList => {
        const audio = audioList.find(item => item.id === audioId);
        if (audio) foundAudio = audio;
      });
      
      if (foundAudio) {
        // 解析duration字符串，如 "14 Min" -> 14
        const minutes = parseInt(foundAudio.duration.replace(/[^\d]/g, ''), 10) || 0;
        return total + minutes;
      }
      return total;
    }, 0);
  };

  const selectedAudioDuration = calculateSelectedDuration();

  const handleSelectDoll = (index: number) => {
    if (index !== currentDollIndex && !isDollLoading) {
      setIsDollLoading(true);
      // 模拟加载过程
      setTimeout(() => {
        setCurrentDollIndex(index);
        setIsDollLoading(false);
      }, 1500); // 1.5秒加载时间
    }
  };

  const handleDeleteAudio = (audioId: number) => {
    setDeletingAudioId(audioId);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingAudioId === null) return;

    setShowDeleteConfirmModal(false);
    
    // 模拟接口调用过程
    console.log('调用删除接口，音频ID:', deletingAudioId);
    
    setTimeout(() => {
      // 模拟接口成功响应，删除数据
      setAddedAudioByDoll(prev => ({
        ...prev,
        [currentDollIndex]: (prev[currentDollIndex] || []).filter((audio: any) => audio.id !== deletingAudioId)
      }));
      
      // 清除删除的音频ID
      setDeletingAudioId(null);
      
      // 显示删除成功的Toast
      showToastMessage('删除成功');
    }, 800); // 模拟0.8秒的接口调用时间
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmModal(false);
    setDeletingAudioId(null);
  };

  const handleSaveConfirm = () => {
    setShowSaveConfirmModal(false);
    
    // 模拟接口调用过程
    console.log('调用保存音频接口，选择的音频IDs:', selectedAudioIds);
    
    // 显示保存中的Toast
    showToastMessage('保存中...');
    
    setTimeout(() => {
      // 模拟接口成功响应，添加音频到列表
      const selectedAudios: any[] = [];
      selectedAudioIds.forEach(audioId => {
        // 在所有公仔的音频数据中查找
        Object.values(mockAudioDataByDoll).forEach(audioList => {
          const audio = audioList.find(item => item.id === audioId);
          if (audio) {
            selectedAudios.push(audio);
          }
        });
      });
      
      // 添加到当前公仔的已添加音频列表中
      setAddedAudioByDoll(prev => ({
        ...prev,
        [currentDollIndex]: [...(prev[currentDollIndex] || []), ...selectedAudios]
      }));
      
      // 关闭添加音频弹窗并清除选择状态
      setShowAudioModal(false);
      setSelectedAudioIds([]);
      
      // 显示保存成功的Toast
      showToastMessage('保存成功');
    }, 1200); // 模拟1.2秒的接口调用时间
  };

  const handleSaveCancel = () => {
    setShowSaveConfirmModal(false);
    // 返回继续选择音频，不清除选择状态
  };

  const handlePlayAudio = (audioId: number) => {
    console.log('播放音频:', audioId);
    // TODO: 实现音频播放逻辑
  };

  const handleResetDoll = () => {
    setShowResetConfirmModal(true);
  };

  const handleResetConfirm = () => {
    setIsDollLoading(true);
    setShowResetConfirmModal(false);
    
    // 模拟重置过程
    setTimeout(() => {
      // 清除当前公仔的所有音频数据
      setAddedAudioByDoll(prev => ({
        ...prev,
        [currentDollIndex]: []
      }));
      // 清除公仔名称
      setDollName('');
      setIsDollLoading(false);
      
      // 显示重置成功的Toast
      showToastMessage('重置成功');
    }, 1500); // 1.5秒重置时间
  };

  // Toast显示功能
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // Toast隐藏回调
  const handleToastHide = () => {
    setShowToast(false);
  };

  // 使用 useEffect 来处理动画，避免在渲染过程中启动动画
  useEffect(() => {
    if (showStickyHeader) {
      Animated.timing(stickyHeaderOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(stickyHeaderOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showStickyHeader, stickyHeaderOpacity]);



  // 处理滚动事件
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const threshold = 200; // 滚动阈值，可以根据需要调整
    
    if (scrollY > threshold && !showStickyHeader) {
      setShowStickyHeader(true);
    } else if (scrollY <= threshold && showStickyHeader) {
      setShowStickyHeader(false);
    }
  };

  const remainingTime = totalStorageTime - addedAudioDuration;
  const progressPercentage = (addedAudioDuration / totalStorageTime) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#1EAAFD', '#F6F7FB']}
        style={styles.gradientContainer}
        locations={[0.3, 0.5]}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* 顶部标题区域 */}
          <View style={[styles.header, { paddingTop: 20}]}>
            <View style={styles.titleContainer}>
              <Text style={styles.stickyHeaderTitle}>Let's start your plush toy design!</Text>
            </View>
          </View>

          <ScrollView 
            style={styles.scrollContainer} 
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* 公仔图片展示区域 */}
            <View style={styles.dollImageContainer}>
              <TouchableOpacity 
                style={[styles.switchButton, styles.leftButton]}
                onPress={handlePrevDoll}
                disabled={currentDollIndex === 0 || isDollLoading}
              >
                <Text style={[styles.switchButtonText, { opacity: (currentDollIndex === 0 || isDollLoading) ? 0.3 : 1 }]}>←</Text>
              </TouchableOpacity>
              
              <View style={styles.dollImageWrapper}>
                <Image
                  source={dollList[currentDollIndex]?.image || require('../../img/no-doll.png')}
                  style={styles.dollImage}
                  resizeMode="contain"
                />
                
                <TouchableOpacity 
                    style={styles.resetButton}
                    onPress={handleResetDoll}
                  >
                    <Image
                      source={require('../../img/reset.png')}
                      style={styles.resetIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.resetButtonText}>重置公仔</Text>
                  </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[styles.switchButton, styles.rightButton]}
                onPress={handleNextDoll}
                disabled={currentDollIndex >= dollList.length - 1 || isDollLoading}
              >
                <Text style={[styles.switchButtonText, { opacity: (currentDollIndex >= dollList.length - 1 || isDollLoading) ? 0.3 : 1 }]}>→</Text>
              </TouchableOpacity>
            </View>

            {/* 加载动画 */}
            {isDollLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                  <Image
                    source={require('../../img/Pulse.gif')}
                    style={styles.pulseAnimation}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}

            {/* 公仔档案区域 */}
            {!isDollLoading && (
              <View style={styles.dollProfileContainer}>
              {isEditingProfile ? (
                // 编辑模式
                <>
                  <View style={styles.profileHeader}>
                    <Text style={styles.profileTitle}>Plush Toy Records</Text>
                  </View>
                  
                  <View style={styles.profileContent}>
                    <View style={styles.avatarRow}>
                      <Text style={styles.sectionLabel}>公仔头像</Text>
                      <View style={styles.avatarContainer}>
                        <Image
                          source={dollList[currentDollIndex]?.image || require('../../img/no-doll.png')}
                          style={styles.avatarImage}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.nameRow}>
                      <Text style={styles.sectionLabel}>公仔名称</Text>
                      <TextInput
                        style={styles.nameInput}
                        value={dollName}
                        onChangeText={setDollName}
                        placeholder="请输入"
                        placeholderTextColor="#CCCCCC"
                      />
                    </View>
                    
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveDollProfile}>
                      <Text style={styles.saveButtonText}>保存公仔档案</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // 展示模式
                <View style={styles.profileContent}>
                  <View style={styles.profileInfoRow}>
                    <View style={styles.profileAvatarContainer}>
                      <Image
                        source={dollList[currentDollIndex]?.image || require('../../img/no-doll.png')}
                        style={styles.profileAvatarImage}
                        resizeMode="contain"
                      />
                    </View>
                    
                    <View style={styles.profileTextInfo}>
                      <Text style={styles.profileDollName}>
                        {dollName || dollList[currentDollIndex]?.name || '公仔名称公仔名称公仔名称'}
                      </Text>
                      <Text style={styles.profileFamilyName}>公仔所属家族</Text>
                    </View>
                  </View>
                  
                                  <View style={styles.profileStatsRow}>
                  <View style={styles.profileStatItem}>
                    <View style={styles.profileStatHeader}>
                      <Image
                        source={require('../../img/story.png')}
                        style={styles.profileStatIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.profileStatLabel}>Story</Text>
                    </View>
                    <Text style={styles.profileStatValue}>{currentDollAddedAudioList.length}个</Text>
                  </View>
                  
                  <View style={styles.profileStatItem}>
                    <View style={styles.profileStatHeader}>
                      <Image
                        source={require('../../img/group-363.png')}
                        style={styles.profileStatIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.profileStatLabel}>Length</Text>
                    </View>
                    <Text style={styles.profileStatValue}>{addedAudioDuration}min</Text>
                  </View>
                </View>
                  
                  <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                    <Image
                      source={require('../../img/edit-icon.png')}
                      style={styles.editProfileIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.editProfileText}>编辑公仔档案</Text>
                  </TouchableOpacity>
                </View>
              )}
              </View>
            )}

            {/* 公仔音频区域 */}
            {!isDollLoading && (
              <View style={styles.audioContainer}>
              <View style={styles.audioHeader}>
                <Text style={styles.audioTitle}>公仔音频</Text>
                <View style={styles.audioHeaderButtons}>
            
                  <TouchableOpacity style={styles.addContentButton} onPress={handleAddContent}>
                     <Image
                      source={require('../../img/edit-icon.png')}
                      style={styles.editImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.addContentText}>添加内容</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.storageSection}>
                <View style={styles.storageHeader}>
                 <Image
                  source={require('../../img/group-363.png')}
                  style={styles.groupImage}
                  resizeMode="contain"
                />
                  <Text style={styles.storageLabel}>故事机内存</Text>
                  <Text style={styles.storageTime}>剩余{remainingTime}min/500min</Text>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
                  </View>
                </View>
              </View>
              
              {currentDollAddedAudioList.length > 0 ? (
                <View style={styles.audioListSection}>
                  {currentDollAddedAudioList.map((audio: any, index: number) => (
                    <View key={audio.id} style={styles.addedAudioItem}>
                      <View style={styles.addedAudioImageContainer}>
                        <Image
                          source={audio.image}
                          style={styles.addedAudioImage}
                          resizeMode="cover"
                        />
                        <View style={styles.addedAudioBadge}>
                          <Image
                            source={require('../../img/283.png')}
                            style={styles.addedAudioBadgeImage}
                            resizeMode="contain"
                          />
                          <Text style={styles.addedAudioBadgeText}>{index + 1}</Text>
                        </View>
                      </View>
                      <View style={styles.addedAudioInfo}>
                        <Text style={styles.addedAudioName} numberOfLines={1}>
                          {audio.name}
                        </Text>
                        <Text style={styles.addedAudioDuration}>
                          {audio.duration}
                        </Text>
                      </View>
                      <View style={styles.addedAudioActions}>
                        <TouchableOpacity 
                          style={styles.audioActionButton}
                          onPress={() => handleDeleteAudio(audio.id)}
                        >
                          <Image
                            source={require('../../img/delete.png')}
                            style={styles.audioActionIcon}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.audioActionButton}
                          onPress={() => handlePlayAudio(audio.id)}
                        >
                          <Image
                            source={require('../../img/play.png')}
                            style={styles.audioActionIcon}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyAudioContainer}>
                  <Image
                    source={require('../../img/mask-group-33.png')}
                    style={styles.emptyAudioImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.emptyAudioText}>暂时还没有音频，请添加</Text>
                </View>
              )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* 吸顶公仔选择器 */}
      <Animated.View 
        style={[
          styles.stickyHeaderContainer,
          {
            opacity: stickyHeaderOpacity,
            top: insets.top,
          }
        ]}
        pointerEvents={showStickyHeader ? 'auto' : 'none'}
      >
        <LinearGradient
          colors={['#1EAAFD', '#F6F7FB']}
          style={styles.stickyHeaderGradient}
          locations={[0.1, 1]}
        >
          <Text style={styles.stickyHeaderTitle}>Let's start your plush toy design!</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.dollSelectionContainer}
            contentContainerStyle={styles.dollSelectionContent}
          >
            {dollList.map((doll, index) => (
              <TouchableOpacity
                key={doll.id}
                style={[
                  styles.dollSelectionItem,
                  index === currentDollIndex && styles.dollSelectionItemSelected
                ]}
                onPress={() => handleSelectDoll(index)}
                disabled={isDollLoading}
              >
                <View style={[
                  styles.dollSelectionImageContainer,
                  index === currentDollIndex && styles.dollSelectionImageContainerSelected
                ]}>
                  <Image
                    source={doll.image}
                    style={styles.dollSelectionImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.dollSelectionName,
                  index === currentDollIndex && styles.dollSelectionNameSelected
                ]}>
                  {doll.name}
                </Text>
                {index === currentDollIndex && (
                  <View style={styles.dollSelectionIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
      </Animated.View>

      {/* 添加音频弹出框 */}
      <Modal
        visible={showAudioModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseAudioModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 弹出框头部 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Audio</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseAudioModal}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* 时间信息 */}
            <View style={styles.timeInfoContainer}>
              <Text style={styles.timeInfoText}>
                {addedAudioDuration + selectedAudioDuration} min added, {totalStorageTime - addedAudioDuration - selectedAudioDuration} min left
              </Text>
            </View>

            {/* 公仔选择下拉框 */}
            <View style={styles.dollDropdownContainer}>
              <TouchableOpacity 
                style={styles.dollDropdownButton}
                onPress={() => setShowDollDropdown(!showDollDropdown)}
              >
                <Text style={styles.dollDropdownButtonText}>
                  {dollList[selectedDollForAudio]?.name || '选择公仔'}
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
                      onPress={() => handleSelectDollForAudio(index)}
                    >
                      <Text style={styles.dollDropdownItemText}>{doll.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* 音频内容区域 */}
            <View style={styles.audioContentContainer}>
              {currentAudioList.length > 0 ? (
                <ScrollView style={styles.audioListContainer} showsVerticalScrollIndicator={false}>
                  {currentAudioList.map((audio, index) => (
                    <TouchableOpacity
                      key={audio.id}
                      style={styles.audioItem}
                      onPress={() => handleToggleAudioSelection(audio.id)}
                      activeOpacity={1}
                    >
                      <View style={styles.audioImageContainer}>
                        <Image
                          source={audio.image}
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
                          {audio.name}
                        </Text>
                        <View style={styles.audioMeta}>
                          <Text style={styles.audioDuration}>{audio.duration}</Text>
                          <Text style={styles.audioType}>{audio.type}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.audioSelection}>
                        <Image
                          source={
                            selectedAudioIds.includes(audio.id)
                              ? require('../../img/selected.png')
                              : require('../../img/unselected.png')
                          }
                          style={styles.selectionIcon}
                          resizeMode="contain"
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noDataContainer}>
                  <Image
                    source={require('../../img/mask-group-33.png')}
                    style={styles.noDataImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.noDataText}>暂无音频数据</Text>
                  <Text style={styles.noDataSubText}>请添加音频内容</Text>
                </View>
              )}
            </View>

            {/* 底部按钮 */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelAudio}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.confirmButton, 
                  (selectedAudioIds.length === 0 || addedAudioDuration + selectedAudioDuration > totalStorageTime) && styles.confirmButtonDisabled
                ]} 
                onPress={handleConfirmAudio}
                disabled={selectedAudioIds.length === 0 || addedAudioDuration + selectedAudioDuration > totalStorageTime}
              >
                <Text style={[
                  styles.confirmButtonText,
                  (selectedAudioIds.length === 0 || addedAudioDuration + selectedAudioDuration > totalStorageTime) && styles.confirmButtonTextDisabled
                ]}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 保存音频确认弹窗 - 在添加音频Modal内部 */}
          {showSaveConfirmModal && (
            <View style={styles.innerModalOverlay}>
              <View style={styles.saveConfirmContainer}>
                <Text style={styles.saveConfirmTitle}>
                  您一共选择了{selectedAudioIds.length}首故事，共{selectedAudioDuration}分钟，是否确认保存
                </Text>
                <View style={styles.saveConfirmButtons}>
                  <TouchableOpacity style={styles.saveConfirmCancel} onPress={handleSaveCancel}>
                    <Text style={styles.saveConfirmCancelText}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveConfirmConfirm} onPress={handleSaveConfirm}>
                    <Text style={styles.saveConfirmConfirmText}>确定</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>



      {/* 重置确认弹窗 */}
      <Modal
        visible={showResetConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetConfirmModal(false)}
      >
        <View style={styles.resetConfirmOverlay}>
          <View style={styles.resetConfirmContainer}>
            <Text style={styles.resetConfirmTitle}>确定恢复默认公仔吗？</Text>
            <Text style={styles.resetConfirmMessage}>重置后公仔所有信息将会清空，回到初始状态，是否继续？</Text>
            <View style={styles.resetConfirmButtons}>
              <TouchableOpacity style={styles.resetConfirmCancel} onPress={() => setShowResetConfirmModal(false)}>
                <Text style={styles.resetConfirmCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetConfirmConfirm} onPress={handleResetConfirm}>
                <Text style={styles.resetConfirmConfirmText}>确认</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 删除故事确认弹窗 */}
      <Modal
        visible={showDeleteConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDeleteCancel}
      >
        <View style={styles.deleteConfirmOverlay}>
          <View style={styles.deleteConfirmContainer}>
            <Text style={styles.deleteConfirmTitle}>确定要删除故事吗？</Text>
            <View style={styles.deleteConfirmButtons}>
              <TouchableOpacity style={styles.deleteConfirmCancel} onPress={handleDeleteCancel}>
                <Text style={styles.deleteConfirmCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmConfirm} onPress={handleDeleteConfirm}>
                <Text style={styles.deleteConfirmConfirmText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
              </Modal>

        {/* Toast组件 */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onHide={handleToastHide}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dollImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  switchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftButton: {
    marginRight: 20,
  },
  rightButton: {
    marginLeft: 20,
  },
  switchButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dollImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as 'relative',
  },
  dollImage: {
    width: 228,
    height: 228,
  },
  resetButton: {
    position: 'absolute' as 'absolute',
    left: '50%',
    marginLeft: -60, // 按钮宽度的一半，实现水平居中
    top: '100%',
    marginTop: 12, // 公仔脚下12px的位置
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 124,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 10, // 提高层级，确保不被遮挡
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  },
  resetIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  dollProfileContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 36, 
    marginBottom: 16,
    padding: 20,
    shadowColor: 'rgba(43, 43, 43, 0.05)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  defaultAvatarIndicator: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  defaultAvatarText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  profileContent: {
    flex: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#333333',
    flex: 0,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: 20,
  },
  avatarImage: {
    width: 64,
    height: 64,
  },
  nameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    fontSize: 16,
    color: '#333333',
    paddingVertical: 10,
    flex: 1,
    marginLeft: 20,
    textAlign: 'left',
  },
  saveButton: {
    backgroundColor: '#1EAAFD',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfoRow: {
    flexDirection: 'row' as 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  profileAvatarImage: {
    width: 48,
    height: 48,
  },
  profileTextInfo: {
    flex: 1,
  },
  profileDollName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  profileFamilyName: {
    fontSize: 14,
    color: '#999999',
  },
  profileStatsRow: {
    flexDirection: 'row' as 'row',
    marginBottom: 20,
  },
  profileStatItem: {
    flexDirection: 'column' as 'column',
    alignItems: 'flex-start',
    marginRight: 24,
  },
  profileStatHeader: {
    flexDirection: 'row' as 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileStatIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  profileStatLabel: {
    fontSize: 14,
    color: '#999999',
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  editProfileButton: {
    flexDirection: 'row' as 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 16,
  },
  editProfileIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  editProfileText: {
    fontSize: 16,
    color: '#1EAAFD',
    fontWeight: '500',
  },
  audioContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: 'rgba(43, 43, 43, 0.05)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  audioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  audioHeaderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addContentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 48,
  },
  storyMachinePanelButton: {
    backgroundColor: '#F0F8FF',
  },
  addContentText: {
    fontSize: 14,
    color: '#1EAAFD',
    fontWeight: '500',
  },
  storageSection: {
    marginBottom: 30,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF3CD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  storageIcon: {
    fontSize: 12,
  },
  storageLabel: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  storageTime: {
    fontSize: 16,
    color: '#666666',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1EAAFD',
    borderRadius: 3,
  },
  emptyAudioContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAudioImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  emptyAudioText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  // 吸顶公仔选择器样式
  stickyHeaderContainer: {
    position: 'absolute' as 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
  },
  stickyHeaderGradient: {
    paddingVertical: 15,
    paddingBottom: 80,
  },
  stickyHeaderTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  dollSelectionContainer: {
    maxHeight: 160,
  },
  dollSelectionContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 30,
    alignItems: 'center',
  },
  dollSelectionItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 50,
  },
  dollSelectionItemSelected: {
    // 选中状态的样式会通过borderColor来实现
  },
  dollSelectionImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  dollSelectionImageContainerSelected: {
    borderColor: '#0EA2FF',
    backgroundColor: '#FFFFFF',
  },
  dollSelectionImage: {
    width: 64,
    height: 64,
    borderRadius: 35,
  },
  dollSelectionName: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '600',
    textAlign: 'center',
  },
  dollSelectionNameSelected: {
    color: '#0EA2FF',
    fontWeight: 'bold',
  },
  dollSelectionIndicator: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0EA2FF',
    marginTop: 4,
  },
  groupImage:{
    width:14,
    height:14,
    marginRight:4
  },
  editImage:{
    width:14,
    height:14,
    marginRight:4
  },
  // 模态框样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingTop: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row' as 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative' as 'relative',
    paddingHorizontal: 24,

  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'left',
    flex: 1,

  },
  closeButton: {
    position: 'absolute' as 'absolute',
    right: 0,
    top: 0,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
    fontWeight: 'bold',
  },
  timeInfoContainer: {
    marginBottom: 24,
        paddingHorizontal: 24,

  },
  timeInfoText: {
    fontSize: 16,
    color: '#1EAAFD',
    textAlign: 'left',
    fontWeight: '500',
  },
  dollDropdownContainer: {
    marginBottom: 24,
    position: 'relative' as 'relative',
    zIndex: 1000,
  },
  dollDropdownButton: {
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 0,
    paddingHorizontal: 16,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    width: '100%',
  },
  dollDropdownButtonText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666666',
  },
  dollDropdownList: {
    position: 'absolute' as 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: 150,
    zIndex: 1001,
  },
  dollDropdownItem: {
    flexDirection: 'row' as 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    flex: 1,
  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#999999',
  },
  modalButtonContainer: {
    flexDirection: 'row' as 'row',
    marginTop: 20,
    paddingHorizontal: 6,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#1EAAFD',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonTextDisabled: {
    color: '#999999',
  },
  // 音频列表相关样式
  audioContentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  audioListContainer: {
    flex: 1,
  },
  audioItem: {
    flexDirection: 'row' as 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  audioImageContainer: {
    width: 56,
    height: 56,
    position: 'relative' as 'relative',
    marginRight: 12,
  },
  audioImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  audioBadge: {
    position: 'absolute' as 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBadgeBackground: {
    position: 'absolute' as 'absolute',
    width: 20,
    height: 20,
  },
  audioBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  audioInfo: {
    flex: 1,
    marginRight: 12,
  },
  audioName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 4,
  },
  audioMeta: {
    flexDirection: 'row' as 'row',
    alignItems: 'center',
  },
  audioDuration: {
    fontSize: 14,
    color: '#999999',
    marginRight: 8,
  },
  audioType: {
    fontSize: 14,
    color: '#999999',
  },
  audioSelection: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIcon: {
    width: 24,
    height: 24,
  },
  // 已添加音频列表样式
  audioListSection: {
    marginTop: 0,
  },
  addedAudioItem: {
    flexDirection: 'row' as 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  addedAudioImageContainer: {
    width: 48,
    height: 48,
    marginRight: 12,
    position: 'relative' as 'relative',
  },
  addedAudioImage: {
    width: 48,  
    height: 48,
    borderRadius: 8,
  },
  addedAudioBadge: {
    position: 'absolute' as 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedAudioBadgeImage: {
    width: 20,
    height: 20,
  },
  addedAudioBadgeText: {
    position: 'absolute' as 'absolute',
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center' as 'center',
  },
  addedAudioInfo: {
    flex: 1,
  },
  addedAudioName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  addedAudioDuration: {
    fontSize: 14,
    color: '#666666',
  },
  addedAudioActions: {
    flexDirection: 'row' as 'row',
    alignItems: 'center',
  },
  audioActionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  audioActionIcon: {
    width: 20,
    height: 20,
  },
  // 加载动画样式
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    shadowColor: 'rgba(43, 43, 43, 0.05)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseAnimation: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  // 重置确认弹窗样式
  resetConfirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  resetConfirmContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 32, // 左右两边32px间距
    alignItems: 'center',
  },
  resetConfirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  resetConfirmMessage: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  resetConfirmButtons: {
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetConfirmCancel: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 6,
  },
  resetConfirmCancelText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  resetConfirmConfirm: {
    flex: 1,
    backgroundColor: '#1EAAFD',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  resetConfirmConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // 删除故事确认弹窗样式
  deleteConfirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteConfirmContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 40,
    alignItems: 'center',
    minWidth: 280,
  },
  deleteConfirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center' as 'center',
  },
  deleteConfirmButtons: {
    flexDirection: 'row' as 'row',
    width: '100%',
  },
  deleteConfirmCancel: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 8,
  },
  deleteConfirmCancelText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  deleteConfirmConfirm: {
    flex: 1,
    backgroundColor: '#1EAAFD',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteConfirmConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Modal内部覆盖层样式
  innerModalOverlay: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  // 保存音频确认弹窗样式
  saveConfirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveConfirmContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 40,
    alignItems: 'center',
    minWidth: 280,
  },
  saveConfirmTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center' as 'center',
    lineHeight: 24,
  },
  saveConfirmButtons: {
    flexDirection: 'row' as 'row',
    width: '100%',
  },
  saveConfirmCancel: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 8,
  },
  saveConfirmCancelText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  saveConfirmConfirm: {
    flex: 1,
    backgroundColor: '#1EAAFD',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  saveConfirmConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default AddDoll; 
/*
 * @LastEditors: jizai jizai.zhu@tuya.com
 * @Date: 2025-07-15 17:00:12
 * @LastEditTime: 2025-07-15 21:33:11
 * @FilePath: /demoapp/src/pages/DollPanel/index.tsx
 * @Description: 
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DollInstance, getDollInstance } from '../../api';

type DollType = 'creative' | 'exploration' | 'ip';

const formatDuration = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) {
    return '0h 0min';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}min`;
};

const DollPanel = (props: any) => {
  const navigation = useNavigation();
  const route = useRoute();

  // 从props或route.params获取数据
  const dollData = props?.dollData || route.params?.dollData;
  const id = props?.id || route.params?.id || dollData?.dollModel?.id || 15996;

  // 处理从iOS传递过来的参数
  useEffect(() => {
    const params = route.params as any;
    console.log('🚀 [RN] DollPanel页面加载，路由参数:', params);

    if (params?.dollId) {
      console.log('🚀 [RN] 从iOS接收到dollId:', params.dollId);
      // 这里可以根据dollId执行特定逻辑
    }

    if (params?.source === 'home-page') {
      console.log('🚀 [RN] 从iOS首页进入DollPanel');
    }
  }, [route.params]);

  const [dollInfo, setDollInfo] = useState<DollInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDollData = async () => {
      try {
        setLoading(true);
        const response = await getDollInstance(id);
        if (response.code === 0) {
          setDollInfo(response.data);
        } else {
          setError(response.msg || 'Failed to fetch doll data');
        }
      } catch (e) {
        setError('An unexpected error occurred.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    // fetchDollData();
  }, [id]);

  const dollType = dollInfo?.dollModel?.type;

  const renderAudioList = () => {
    // Mock data based on the screenshot
    const audioItems = [
      {
        id: '1',
        title: '小老鼠偷油吃的故事',
        duration: '14 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: '2',
        title: '龟兔赛跑的故事',
        duration: '14 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: '3',
        title: '乌鸦和狐狸',
        duration: '14 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      },
      {
        id: '4',
        title: '农夫与蛇',
        duration: '35 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      },
       {
        id: '5',
        title: '农夫与蛇',
        duration: '35 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      }, {
        id: '6',
        title: '农夫与蛇',
        duration: '35 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      }, {
        id: '7',
        title: '农夫与蛇',
        duration: '35 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      }, {
        id: '8',
        title: '农夫与蛇',
        duration: '35 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      }, {
        id: '9',
        title: '农夫与蛇',
        duration: '35 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      }, {
        id: '10',
        title: '农夫与蛇',
        duration: '35 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      }, {
          id: '11',
        title: '农夫与蛇',
        duration: '35 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      }, {
        id: '12',
        title: '农夫与蛇',
        duration: '35 Min',
        category: '寓言故事',
        image: require('../../img/story-default-cover.png'),
      },
    ];

    return (
      <View style={styles.audioListContainer}>
        <Text style={styles.audioListTitle}>音频清单</Text>
        {dollType === 'explore' && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>所有音频只能试听1分钟</Text>
          </View>
        )}
        {audioItems.map((item, index) => (
          <View key={item.id} style={styles.audioItem}>
            <View style={styles.audioImageWrapper}>
              <Image source={item.image} style={styles.audioItemImage} />
              <Image
                source={require('../../img/283.png')}
                style={styles.audioNumberBackground}
              />
              <Text style={styles.audioNumber}>{index + 1}</Text>
            </View>
            <View style={styles.audioItemInfo}>
              <Text style={styles.audioItemTitle}>{item.title}</Text>
              <Text style={styles.audioItemMeta}>
                {item.duration} | {item.category}
              </Text>
            </View>
            <TouchableOpacity>
              <Image source={require('../../img/play11.png')} style={styles.playButton} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <Image
          source={require('../../img/Pulse.gif')}
          style={styles.pulseAnimation}
          resizeMode="contain"
        />
      </View>
    </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground
      source={
        dollInfo?.dollModel?.backgroundImg
          ? { uri: dollInfo.dollModel.backgroundImg }
          : require('../../img/bg_setting.png')
      }
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{dollInfo?.dollModel.name || '玩具公仔'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../../img/dark-close.png')} style={styles.closeButton} />
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View style={styles.dollContainer}>
            <Image 
              source={
                dollInfo?.dollModel?.coverImg
                  ? { uri: dollInfo.dollModel.coverImg }
                  : require('../../img/create-3d-toy-image.png')
              }
              style={styles.dollImage} 
            />
            <View style={styles.welcomeBubble}>
              <Text style={styles.welcomeText}>Hi, Welcome</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Image source={require('../../img/group-364.png')} style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>故事数量</Text>  
                <Text style={styles.statValue}>{dollInfo?.totalStoryNum || 0}</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <Image source={require('../../img/group-363.png')} style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>故事时长</Text>
                <Text style={styles.statValue}>{formatDuration(dollInfo?.totalStoryDuration || 0)}</Text>
              </View>
            </View>
          </View>

          {renderAudioList()}
        </ScrollView>

        {dollType === 'creative' && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButton}>
              <Text style={styles.footerButtonText}>恢复默认</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerButton, styles.footerButtonPrimary]}>
              <Text style={[styles.footerButtonText, styles.footerButtonPrimaryText]}>
                去创造中编辑
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    width: 24,
    height: 24,
  },
  dollContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  dollImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  welcomeBubble: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    position: 'absolute',
    top: 20,
    right: 50,
  },
  welcomeText: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    width: '46%',
  },
  statIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  statValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',  // 改为字符串
    color: 'rgba(0, 0, 0, 0.9)'
  },
  statLabel: {
    fontSize: 14,
    color: '#333',
  },
  audioListContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
  },
  audioListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  warningContainer: {
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#EA0000',
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  audioImageWrapper: {
    width: 60,
    height: 60,
  },
  audioItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  audioNumberBackground: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
  },
  audioNumber: {
    position: 'absolute',
    bottom: 2,
    right: 6,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  audioItemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  audioItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  audioItemMeta: {
    color: '#666',
    marginTop: 5,
  },
  playButton: {
    width: 20,
    height: 20,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  footerButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  footerButtonPrimary: {
    backgroundColor: '#4A90E2',
  },
  footerButtonText: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  footerButtonPrimaryText: {
    color: '#fff',
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
});

export default DollPanel; 

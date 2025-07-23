import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Image, } from 'react-native';
import CircularSlider from 'react-native-circular-slider';
import {  G  } from 'react-native-svg';
import NightIcon from '../../img/night.svg';
import WakeIcon from '../../img/getup.svg';
import AudioSelectionModal, { Audio } from './AudioSelectionModal';

const WAKE_ICON = <WakeIcon width={24} height={24} fill="#fff" />;
const BEDTIME_ICON = <NightIcon width={24} height={24} fill="#fff" />;


const MINUTES_IN_DAY = 24 * 60;
const FIVE_MINUTE_ANGLE = (2 * Math.PI) / (MINUTES_IN_DAY / 5);

function roundAngleToFives(angle: number) {
  return Math.round(angle / FIVE_MINUTE_ANGLE) * FIVE_MINUTE_ANGLE;
}

function calculateMinutesFromAngle(angle: number) {
  const minutes = (angle / (2 * Math.PI)) * MINUTES_IN_DAY;
  return Math.round(minutes / 5) * 5;
}

function calculateTimeFromAngle(angle: number) {
  const minutes = calculateMinutesFromAngle(angle);
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return { h, m };
}

function padMinutes(min: number) {
  if (`${min}`.length < 2) {
    return `0${min}`;
  }
  return min;
}

const SleepPanel = () => {
  const [isTimerSet, setIsTimerSet] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<Audio>({ id: '1', name: '音频1' });

  const bedtimeMins = 22 * 60; // 10 PM
  const waketimeMins = 7 * 60; // 7 AM
  const durationMins = (waketimeMins - bedtimeMins + MINUTES_IN_DAY) % MINUTES_IN_DAY;

  const [startAngle, setStartAngle] = useState((bedtimeMins / MINUTES_IN_DAY) * 2 * Math.PI);
  const [angleLength, setAngleLength] = useState((durationMins / MINUTES_IN_DAY) * 2 * Math.PI);

  const onUpdate = ({ startAngle, angleLength }: { startAngle: number; angleLength: number }) => {
    setStartAngle(roundAngleToFives(startAngle));
    setAngleLength(roundAngleToFives(angleLength));
  };
  
  const bedtime = calculateTimeFromAngle(startAngle);
  const waketime = calculateTimeFromAngle((startAngle + angleLength));
  const durationMinutes = calculateMinutesFromAngle(angleLength);

  const duration = {
    hours: Math.floor(durationMinutes / 60),
    minutes: durationMinutes % 60,
  };

  const showTime = isTimerSet || angleLength > 0;

  const handleAudioConfirm = (audio: Audio) => {
    setSelectedAudio(audio);
    setModalVisible(false);
  };

  return (
    <View
      style={[styles.scrollContainer,styles.container]}
    >
      <View style={styles.header}>
        <View style={styles.timeInfo}>
          <View style={styles.timeLabelContainer}>
            <Image source={require('../../img/sleep.png')} style={styles.timeIcon} />
            <Text style={styles.timeLabel}>Sleep</Text>
          </View>
          <Text style={styles.timeValue}>
            {showTime ? `${bedtime.h}:${padMinutes(bedtime.m)}` : '--:--'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.timeInfo}>
          <View style={styles.timeLabelContainer}>
            <Image source={require('../../img/weekup.png')} style={styles.timeIcon} />
            <Text style={styles.timeLabel}>Week up</Text>
          </View>
          <Text style={styles.timeValue}>
            {showTime ? `${waketime.h}:${padMinutes(waketime.m)}` : '--:--'}
          </Text>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <CircularSlider
          startAngle={startAngle}
          angleLength={angleLength}
          onUpdate={onUpdate}
          segments={5}
          strokeWidth={40}
          radius={120}
          gradientColorFrom={'#13A5FF'}
          gradientColorTo={'#FFB32A'}
          showClockFace
          clockFaceColor="#9d9d9d"
          bgCircleColor="#171717" 
          startIcon={<G scale="1.6" transform={[{ translateX: -12 }, { translateY: -12 }]}>{BEDTIME_ICON}</G>}
          stopIcon={<G scale="1.6" transform={[{ translateX: -12 }, { translateY: -12 }]}>{WAKE_ICON}</G>}
        />
        <View style={styles.centerContent}>
          {showTime ? (
            <Text style={styles.durationText}>
              {String(duration.hours).padStart(2, '0')}
              <Text style={styles.durationUnit}>h</Text>{' '}
              {String(duration.minutes).padStart(2, '0')}
              <Text style={styles.durationUnit}>min</Text>
            </Text>
          ) : (
            <>
              <Text style={styles.promptText}>请先设置哄睡时间</Text>
              <Text style={styles.durationText}>
                --<Text style={styles.durationUnit}>h</Text> --
                <Text style={styles.durationUnit}>min</Text>
              </Text>
            </>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isTimerSet && styles.cancelButton]}
        onPress={() => setIsTimerSet(!isTimerSet)}
        disabled={angleLength === 0}
      >
        <Text style={[styles.buttonText,isTimerSet && styles.cancelButtonText]}>
          {isTimerSet ? '取消哄睡定时' : '启动哄睡定时'}
        </Text>
      </TouchableOpacity>

      <View style={styles.audioSection}>
        <Text style={styles.audioLabel}>哄睡音频</Text>
        <TouchableOpacity style={styles.audioSelector} onPress={() => setModalVisible(true)}>
          <Text style={styles.audioValue}>{selectedAudio.name}</Text>
          <Image
            source={require('../../img/n6.png')}
            style={styles.audioArrowIcon}
          />
        </TouchableOpacity>
      </View>
      <AudioSelectionModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleAudioConfirm}
        currentAudioId={selectedAudio.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  timeInfo: {
    alignItems: 'center',
  },
  timeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  timeLabel: {
    color: '#FFF',
    fontSize: 14,
  },
  timeValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: '#555',
  },
  sliderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 10,
  },
  durationText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '300',
  },
  durationUnit: {
    fontSize: 18,
    color: '#888',
    fontWeight: 'normal',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
    marginBottom: 40,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  audioSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), rgba(0, 0, 0, 0)',
    padding: 20,
    borderRadius: 12,
  },  
  audioLabel: {
    color: '#FFF',
    fontSize: 15,
  },
  audioSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioValue: {
    color: '#888',
    fontSize: 13,
    marginRight: 10,
  },
  audioArrowIcon: {
    width: 16,
    height: 16,
  },
  cancelButtonText: {
    color: '#007AFF',
  },
});

export default SleepPanel; 
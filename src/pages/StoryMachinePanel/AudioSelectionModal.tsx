
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
} from 'react-native';

export interface Audio {
  id: string;
  name: string;
}

const mockAudioList: Audio[] = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  name: `音频${i + 1}`,
}));

interface CheckboxIconProps {
  selected: boolean;
}

const CheckboxIcon: React.FC<CheckboxIconProps> = ({ selected }) => (
  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
    {selected && (
      <Text style={styles.checkmark}>✓</Text>
    )}
  </View>
);

interface AudioSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (audio: Audio) => void;
  currentAudioId: string;
}

const AudioSelectionModal: React.FC<AudioSelectionModalProps> = ({ isVisible, onClose, onConfirm, currentAudioId }) => {
  const [selectedAudioId, setSelectedAudioId] = useState(currentAudioId);

  const handleConfirm = () => {
    const selectedAudio = mockAudioList.find(audio => audio.id === selectedAudioId);
    if (selectedAudio) {
      onConfirm(selectedAudio);
    }
    onClose();
  };

  const renderItem = ({ item }: { item: Audio }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => setSelectedAudioId(item.id)}
    >
      <Text style={styles.itemText}>{`${item.id}   ${item.name}`}</Text>
      <CheckboxIcon selected={selectedAudioId === item.id} style={styles.checkboxIcon} />
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>选择音频</Text>
            <TouchableOpacity onPress={onClose}>
              <Image source={require('../../img/dark-close.png')} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockAudioList}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.list}
          />
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeIcon: {
    width: 30,
    height: 30,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  itemText: {
    color: 'white',
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#3A3A3C',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkboxIcon: {
    width: 20,
    height: 20,
  },
});

export default AudioSelectionModal; 
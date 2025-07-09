import { colors, theme } from '@/constants/theme';
import { visionBoardService } from '@/services/visionboard.service';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AddImageModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (imageUrl: string) => Promise<void>;
  isSaving?: boolean;
}

export const AddImageModal: React.FC<AddImageModalProps> = ({ visible, onClose, onAdd, isSaving }) => {
  const [galleryImage, setGalleryImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    setError('');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Fix for expo-image-picker type
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setGalleryImage(result.assets[0].uri);
    }
  };


  const handleSave = async () => {
    if (!galleryImage) {
      setError('Please select an image');
      return;
    }
    setError('');
    setUploading(true);
    
    try {
      // Use the service to handle everything
      const imageRecord = await visionBoardService.uploadAndCreateImage(galleryImage);
      await onAdd(imageRecord.url);
      setGalleryImage(null);
      onClose();
      

    } catch (e: any) {
      console.error('Upload error:', e);
      setError(e.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setGalleryImage(null);
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Inspiration</Text>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handlePickImage}
            activeOpacity={0.8}
            disabled={uploading || isSaving}
          >
            <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          {galleryImage ? (
            <Image source={{ uri: galleryImage }} style={styles.preview} resizeMode="cover" />
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={uploading || isSaving}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, (!galleryImage || uploading || isSaving) && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!galleryImage || uploading || isSaving}
            >
              {uploading ? (
                <ActivityIndicator color={colors.accent.white} />
              ) : (
                <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: colors.accent.slate,
    borderRadius: theme.borderRadius.large,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.glass.text.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  galleryButton: {
    backgroundColor: colors.accent.copper,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  galleryButtonText: {
    color: colors.accent.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  saveButton: {
    backgroundColor: colors.accent.copper,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.glass.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
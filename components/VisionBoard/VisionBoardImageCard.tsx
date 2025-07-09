import { colors, theme } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface VisionBoardImageCardProps {
  imageUrl: string;
  onPress?: () => void;
  onDelete?: () => void;
  style?: any;
}

export const VisionBoardImageCard: React.FC<VisionBoardImageCardProps> = ({ imageUrl, onPress, onDelete, style }) => {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay} />
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete} activeOpacity={0.7}>
          <MaterialIcons name="delete" size={20} color={colors.accent.white} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    aspectRatio: 1,
    margin: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.large,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: theme.borderRadius.large,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    padding: 4,
    zIndex: 2,
  },
}); 
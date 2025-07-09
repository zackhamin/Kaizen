import { StackScreen } from '@/components/Layout/StackScreen';
import { AddImageModal } from '@/components/VisionBoard/AddImageModal';
import { VisionBoardImageCard } from '@/components/VisionBoard/VisionBoardImageCard';
import { colors, theme } from '@/constants/theme';
import { VisionBoardImage, visionBoardService } from '@/services/visionboard.service';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VisionBoardScreen() {
  const [images, setImages] = useState<VisionBoardImage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const images = await visionBoardService.getUserVisionBoardImagesWithUrls();
      setImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteImage = async (imageId: string) => {
    try {
      await visionBoardService.deleteVisionBoardImage(imageId);
      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', 'Failed to delete image');
    }
  };

  const renderImage = ({ item }: { item: VisionBoardImage }) => (
    <VisionBoardImageCard
      imageUrl={item.url}
      onDelete={() => deleteImage(item.id)}
      // onPress={() => {}} // Optionally implement fullscreen view
      style={styles.imageCard}
    />
  );

  return (
    <StackScreen title="Vision Board">
      {images.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="photo-library" size={48} color={colors.glass.text.secondary} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>Everyone has something that drives them. That can be your kids or a 5.2L Hellcat. We don't judge.</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderImage}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      )}
      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color={colors.accent.white} />
      </TouchableOpacity>
      <AddImageModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={loadImages}
        isSaving={isSaving}
      />
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  grid: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  imageCard: {
    flex: 1,
    minWidth: 0,
    margin: theme.spacing.sm,
  },
  addButton: {
    position: 'absolute',
    right: 28,
    bottom: 32,
    backgroundColor: colors.accent.copper,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: colors.glass.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
    maxWidth: 260,
  },
});
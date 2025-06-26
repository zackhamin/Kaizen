import { useGratitudeData } from '@/app/context/GratitudeContext';
import { useCreateGratitudeEntry, useDeleteGratitudeEntry, useGratitudeEntries } from '@/app/hooks/useGratitude';
import { colors } from '@/constants/theme';
import { GratitudeEntry } from '@/services/gratitude.service.modern';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import GradientBackground from '../Layout/GradientBackground';

const { width: screenWidth } = Dimensions.get('window');

// Warrior Animation Component
interface WarriorCompletionProps {
  onAnimationComplete?: () => void;
}

const WarriorCompletion: React.FC<WarriorCompletionProps> = ({ onAnimationComplete }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation sequence
    scale.value = withSequence(
      withTiming(1.2, { duration: 600 }),
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    
    opacity.value = withTiming(1, { duration: 800 });
    
    rotateY.value = withSequence(
      withTiming(360, { duration: 1000 }),
      withTiming(0, { duration: 0 })
    );

    // Glow effect
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0.3, { duration: 2000 }),
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 500 }, () => {
        if (onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateY: `${rotateY.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={animationStyles.container}>
      <Animated.View style={[animationStyles.textContainer, animatedStyle]}>
        {/* Glow effect */}
        
        {/* Japanese text */}
        <Text style={animationStyles.japaneseText}>戦士</Text>
        <Text style={animationStyles.englishText}>WARRIOR</Text>
        <Text style={animationStyles.subtitle}>Daily gratitude practice complete</Text>
      </Animated.View>
    </View>
  );
};

// Main Gratitude Component
const Gratitude: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [showWarriorAnimation, setShowWarriorAnimation] = useState(false);
  const [hasShownAnimation, setHasShownAnimation] = useState(false);
  const router = useRouter();

  // Use React Query hooks instead of legacy hook
  const { data: gratitudeEntries = [], isLoading: loading, refetch: refreshGratitudeEntries } = useGratitudeEntries();
  const createGratitudeEntryMutation = useCreateGratitudeEntry();
  const deleteGratitudeEntryMutation = useDeleteGratitudeEntry();

  // Get context methods to update daily goals
  const { updateGratitudeCount } = useGratitudeData();

  // Update context when gratitude entries change
  useEffect(() => {
    console.log('Gratitude component: Updating context with count:', gratitudeEntries.length);
    updateGratitudeCount(gratitudeEntries.length);
  }, [gratitudeEntries, updateGratitudeCount]);

  // Check if we should show the warrior animation
  useEffect(() => {
    console.log('Gratitude component: Checking animation - entries:', gratitudeEntries.length, 'hasShown:', hasShownAnimation, 'loading:', loading);
    if (gratitudeEntries.length === 3 && !hasShownAnimation && !loading) {
      console.log('Gratitude component: Showing warrior animation');
      setShowWarriorAnimation(true);
      setHasShownAnimation(true);
    }
  }, [gratitudeEntries.length, hasShownAnimation, loading]);

  // Reset animation state when entries drop below 3
  useEffect(() => {
    if (gratitudeEntries.length < 3) {
      console.log('Gratitude component: Resetting animation state');
      setHasShownAnimation(false);
    }
  }, [gratitudeEntries.length]);

  const handleAddGratitudeEntry = async (): Promise<void> => {
    if (!inputText.trim() || createGratitudeEntryMutation.isPending) return;

    // Check if user already has 3 entries for today
    if (gratitudeEntries.length >= 3) {
      Alert.alert('Daily Limit', 'You can add up to 3 entries per day. Come back tomorrow to continue.');
      return;
    }

    try {
      console.log('Gratitude component: Adding entry:', inputText.trim());
      await createGratitudeEntryMutation.mutateAsync({ content: inputText.trim() });
      setInputText('');
      console.log('Gratitude component: Entry added successfully');
    } catch (error) {
      console.error('Gratitude component: Error adding gratitude entry:', error);
      Alert.alert('Error', 'Failed to add gratitude entry');
    }
  };

  const handleDeleteGratitudeEntry = async (id: string): Promise<void> => {
    Alert.alert(
      'Remove Entry',
      'Are you sure you want to remove this gratitude entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGratitudeEntryMutation.mutateAsync(id);
            } catch (error) {
              console.error('Error deleting gratitude entry:', error);
              Alert.alert('Error', 'Failed to remove gratitude entry');
            }
          }
        }
      ]
    );
  };

  const handleAnimationComplete = () => {
    setShowWarriorAnimation(false);
  };

  const remainingSlots: number = 3 - gratitudeEntries.length;

  const renderGratitudeItem = ({ item, index }: { item: GratitudeEntry; index: number }) => (
    <View style={styles.gratitudeItem}>
      <View style={styles.gratitudeHeader}>
        <View style={styles.entryNumber}>
          <Text style={styles.entryNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.gratitudeContent}>
          <Text style={styles.gratitudeText} numberOfLines={0}>
            {item.content}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteGratitudeEntry(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProgressBar = () => {
    const progress = gratitudeEntries.length / 3;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressCount}>{gratitudeEntries.length}/3</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <GradientBackground showHeader={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.glass.text.primary} />
          <Text style={styles.loadingText}>Loading your entries...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground showHeader={false}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Daily Gratitude</Text>
          </View>

          {renderProgressBar()}

          {remainingSlots > 0 ? (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                What are you grateful for right now?
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="I'm grateful for..."
                  placeholderTextColor={colors.glass.text.placeholder}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleAddGratitudeEntry}
                  returnKeyType="done"
                  multiline={true}
                  textAlignVertical="top"
                  maxLength={200}
                  editable={!createGratitudeEntryMutation.isPending}
                />
              </View>
              <TouchableOpacity 
                style={[
                  styles.addButton, 
                  createGratitudeEntryMutation.isPending && styles.addButtonDisabled,
                  !inputText.trim() && styles.addButtonDisabled
                ]} 
                onPress={handleAddGratitudeEntry}
                activeOpacity={0.8}
                disabled={createGratitudeEntryMutation.isPending || !inputText.trim()}
              >
                {createGratitudeEntryMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.glass.text.primary} />
                ) : (
                  <Text style={styles.addButtonText}>Add Entry</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.completedContainer}>
              <Text style={styles.completedTitle}>Daily Practice Complete</Text>
              <Text style={styles.completedText}>
                You've completed today's gratitude practice. Come back tomorrow to continue building this positive habit.
              </Text>
            </View>
          )}

          {gratitudeEntries.length > 0 && (
            <View style={styles.entriesSection}>
              <Text style={styles.entriesSectionTitle}>Today's Entries</Text>
              <FlatList
                data={gratitudeEntries}
                renderItem={renderGratitudeItem}
                keyExtractor={(item) => item.id}
                style={styles.gratitudeList}
                contentContainerStyle={styles.gratitudeListContent}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={refreshGratitudeEntries}
              />
            </View>
          )}

          {gratitudeEntries.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Start Your Practice</Text>
              <Text style={styles.emptyStateText}>
                Research shows that practicing gratitude can improve mental well-being and reduce stress. Start with just one thing you're grateful for.
              </Text>
            </View>
          )}
        </View>

        {/* Warrior Animation Overlay */}
        {showWarriorAnimation && (
          <WarriorCompletion onAnimationComplete={handleAnimationComplete} />
        )}
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

// Animation Styles
const animationStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1000,
  },
  textContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.glass.text.primary,
    shadowColor: colors.glass.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  japaneseText: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.glass.text.primary,
    textShadowColor: colors.glass.text.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 16,
  },
  englishText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.glass.text.primary,
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    textAlign: 'center',
  },
});

// Main Component Styles
const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.glass.text.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.glass.buttonDefault,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.glass.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
    width: '100%',
    maxWidth: screenWidth,
  },
  headerSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.glass.text.primary,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    lineHeight: 24,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.glass.text.primary,
  },
  progressCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.glass.text.secondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.glass.overlay,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.glass.text.primary,
    borderRadius: 4,
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.glass.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.glass.inputBorder,
    color: colors.glass.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: colors.glass.buttonDefault,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.glass.buttonDisabled,
    opacity: 0.6,
  },
  addButtonText: {
    color: colors.glass.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  completedContainer: {
    backgroundColor: colors.glass.overlay,
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  completedText: {
    color: colors.glass.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  entriesSection: {
    flex: 1,
  },
  entriesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: 16,
  },
  gratitudeList: {
    flex: 1,
  },
  gratitudeListContent: {
    paddingBottom: 20,
  },
  gratitudeItem: {
    backgroundColor: colors.glass.conversationCard,
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.conversationBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  gratitudeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.glass.buttonDefault,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  entryNumberText: {
    color: colors.glass.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  gratitudeContent: {
    flex: 1,
  },
  gratitudeText: {
    fontSize: 15,
    color: colors.glass.text.primary,
    lineHeight: 20,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.glass.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  deleteButtonText: {
    color: colors.glass.text.secondary,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default Gratitude;
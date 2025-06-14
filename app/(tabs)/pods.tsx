import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { colors } from '../../constants/theme';
import { Community, CommunityService } from '../../services/community.service';

const communityService = new CommunityService();

// Enhanced category configuration with icons and colors
const categoryConfig: { [key: string]: { bg: string; text: string; icon: string; emoji: string } } = {
  'chronic-pain': { bg: '#FEE2E2', text: '#DC2626', icon: 'medical', emoji: '🩹' },
  'mental-health': { bg: '#E0E7FF', text: '#4F46E5', icon: 'brain', emoji: '🧠' },
  'autoimmune': { bg: '#D1FAE5', text: '#059669', icon: 'heart', emoji: '🤝' },
  'cancer': { bg: '#FED7E2', text: '#BE185D', icon: 'ribbon', emoji: '🎗️' },
  'neurological': { bg: '#E9D5FF', text: '#7C3AED', icon: 'pulse', emoji: '⚡' },
  'default': { bg: colors.ui.lavender + '20', text: colors.primary.main, icon: 'people', emoji: '👥' },
};

// Filter options
const filters = [
  'All',
  'My pods', 
  'Recently Active',
  'Popular',
  'Mental Health',
  'Chronic Pain',
  'Autoimmune'
];

export default function PodsScreen() {
  const [pods, setpods] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadpods();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadpods = async () => {
    try {
      const { data, error } = await communityService.getAllpods();
      if (error) throw error;
      setpods(data || []);
    } catch (error) {
      console.error('Error loading pods:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadpods();
  };

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category] || categoryConfig.default;
  };

  const renderCommunity = ({ item, index }: { item: Community; index: number }) => {
    const categoryStyle = getCategoryConfig(item.category);
    
    return (
      <Animated.View
        style={[
          styles.communityCardWrapper,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.communityCard}
          onPress={() => router.push(`/community/${item.slug}`)}
          activeOpacity={0.7}
        >
          {/* Split Layout */}
          <View style={styles.splitContainer}>
            {/* Left side - Visual */}
            <View style={styles.visualSection}>
              <View style={[styles.iconContainer, { backgroundColor: categoryStyle.bg }]}>
                <Text style={styles.categoryEmoji}>{categoryStyle.emoji}</Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: categoryStyle.text }]} />
            </View>

            {/* Right side - Content */}
            <View style={styles.contentSection}>
              <View style={styles.cardHeader}>
                <Text style={styles.communityName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.is_private && (
                  <View style={styles.privateBadge}>
                    <Ionicons name="lock-closed" size={12} color="#D97706" />
                  </View>
                )}
              </View>

              <Text style={styles.communityDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberCount}>
                    {item.member_count} members
                  </Text>
                  <Text style={styles.activeText}>
                    Active recently
                  </Text>
                </View>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statsBadge}>
                    <Text style={styles.statsNumber}>24</Text>
                    <Ionicons name="trending-up" size={12} color={colors.ui.muted.dark} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Finding pods for you...</Text>
      </View>
    );
  }

  return (

      <SafeAreaView style={styles.container}>
        {/* Gradient Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradientHeader}
        >
          <Text style={styles.headerTitle}>pods</Text>
          <Text style={styles.headerSubtitle}>Your health journey, together</Text>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Search Bar */}
          {/* <View style={styles.searchSection}>
           
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/create-community')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View> */}

          {/* Tab-style Filters */}
          <View style={styles.filtersSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScrollContent}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterTab,
                    activeFilter === filter && styles.filterTabActive
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[
                    styles.filterTabText,
                    activeFilter === filter && styles.filterTabTextActive
                  ]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* pods List */}
          <FlatList
            data={pods}
            renderItem={renderCommunity}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary.main}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                  <Ionicons name="people-outline" size={48} color={colors.ui.muted.light} />
                </View>
                <Text style={styles.emptyTitle}>
                  {isSearching ? 'No pods found' : 'Discover pods'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {isSearching 
                    ? 'Try adjusting your search terms' 
                    : 'Create the first community and start connecting with others'}
                </Text>
                {!isSearching && (
                  <TouchableOpacity 
                    style={styles.createFirstButton}
                    onPress={() => router.push('/create-community')}
                  >
                    <Text style={styles.createFirstButtonText}>Create Community</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </View>
      </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.ui.muted.dark,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary.dark,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersSection: {
    paddingBottom: 16,
    paddingTop: 16,
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.ui.muted.light,
    backgroundColor: 'transparent',
  },
  filterTabActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ui.muted.dark,
  },
  filterTabTextActive: {
    color: 'white',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  communityCardWrapper: {
    marginBottom: 12,
  },
  communityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  splitContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  visualSection: {
    marginRight: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  contentSection: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.dark,
    flex: 1,
    marginRight: 8,
  },
  privateBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityDescription: {
    fontSize: 13,
    color: colors.ui.muted.dark,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberCount: {
    fontSize: 12,
    color: colors.ui.muted.dark,
    marginBottom: 2,
  },
  activeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statsNumber: {
    fontSize: 11,
    color: colors.ui.muted.dark,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.ui.lavender + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.ui.muted.dark,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
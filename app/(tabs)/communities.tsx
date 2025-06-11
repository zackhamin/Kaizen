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
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../constants/theme';
import { Community, CommunityService } from '../../services/community.service';

const communityService = new CommunityService();

// Category color mapping for visual distinction
const categoryColors: { [key: string]: { bg: string; text: string } } = {
  'chronic-pain': { bg: '#FEE2E2', text: '#DC2626' },
  'mental-health': { bg: '#E0E7FF', text: '#4F46E5' },
  'autoimmune': { bg: '#D1FAE5', text: '#059669' },
  'cancer': { bg: '#FED7E2', text: '#BE185D' },
  'neurological': { bg: '#E9D5FF', text: '#7C3AED' },
  'default': { bg: colors.ui.lavender + '20', text: colors.primary.main },
};

export default function CommunitiesScreen() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadCommunities();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadCommunities = async () => {
    try {
      const { data, error } = await communityService.getAllCommunities();
      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCommunities();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      try {
        const { data, error } = await communityService.searchCommunities(query);
        if (error) throw error;
        setCommunities(data || []);
      } catch (error) {
        console.error('Error searching communities:', error);
      }
    } else {
      setIsSearching(false);
      loadCommunities();
    }
  };

  const getCategoryStyle = (category: string) => {
    return categoryColors[category] || categoryColors.default;
  };

  const renderCommunity = ({ item, index }: { item: Community; index: number }) => {
    const categoryStyle = getCategoryStyle(item.category);
    
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
          <View style={styles.communityContent}>
            <View style={styles.communityHeader}>
              <View style={styles.communityTitleRow}>
                <View style={[styles.communityIcon, { backgroundColor: categoryStyle.bg }]}>
                  <Ionicons 
                    name={item.is_private ? "lock-closed" : "people"} 
                    size={20} 
                    color={categoryStyle.text} 
                  />
                </View>
                <View style={styles.communityInfo}>
                  <Text style={styles.communityName}>{item.name}</Text>
                  <View style={styles.communityMeta}>
                    <Ionicons name="people-outline" size={14} color={colors.ui.muted.dark} />
                    <Text style={styles.memberCount}>{item.member_count} members</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.ui.muted.light} />
            </View>
            
            <Text style={styles.communityDescription} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.communityFooter}>
              <View style={[styles.categoryTag, { backgroundColor: categoryStyle.bg }]}>
                <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
                  {item.category.replace('-', ' ')}
                </Text>
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
        <Text style={styles.loadingText}>Finding communities for you...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.light, '#F9FAFB']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Communities</Text>
          <Text style={styles.headerSubtitle}>Find your support network</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.ui.muted.dark} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search communities..."
              placeholderTextColor={colors.ui.muted.dark}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={colors.ui.muted.dark} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/create-community')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary.main, '#6366F1']}
              style={styles.createButtonGradient}
            >
              <Ionicons name="add" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Communities List */}
        <FlatList
          data={communities}
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
                {isSearching ? 'No communities found' : 'Discover Communities'}
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
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.light,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.ui.muted.dark,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary.dark,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.ui.muted.dark,
    marginTop: 4,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  communityContent: {
    padding: 16,
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  communityTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  communityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary.dark,
    marginBottom: 4,
  },
  communityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 14,
    color: colors.ui.muted.dark,
  },
  separator: {
    color: colors.ui.muted.light,
    marginHorizontal: 4,
  },
  postCount: {
    fontSize: 14,
    color: colors.ui.muted.dark,
  },
  communityDescription: {
    fontSize: 14,
    color: colors.text.primary.dark,
    lineHeight: 20,
    marginBottom: 12,
  },
  communityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    fontSize: 12,
    color: colors.ui.muted.dark,
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
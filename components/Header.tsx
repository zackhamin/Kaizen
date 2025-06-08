import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

export default function Header() {
  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logout pressed');
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search pressed');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>Solace</Text>
        <View style={styles.rightButtons}>
          <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color={colors.text.primary.dark} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="person-circle-outline" size={24} color={colors.text.primary.dark} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.muted.light,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary.dark,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
}); 
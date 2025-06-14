import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/settings');
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search pressed');
  };

  return (

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

  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.light,
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
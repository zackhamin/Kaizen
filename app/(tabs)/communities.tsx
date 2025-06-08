import { colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export default function CommunitiesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Communities screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.text.primary.dark,
  },
});

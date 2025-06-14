import GradientBackground from '@/components/GradientBackground';
import { colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  return (
    <GradientBackground showHeader={false}>
      <View style={styles.container}>
        <Text style={styles.text}>About screen</Text>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.text.primary.dark,
  },
});

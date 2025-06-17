import GradientBackground from '@/components/GradientBackground';
import Todos from '@/components/Todos/Todos';
import { colors } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

export default function WinsScreen() {
  return (
    <GradientBackground showHeader={false}>
      <View style={styles.container}>
        <Todos/>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  text: {
    color: colors.text.primary.dark,
  },
});

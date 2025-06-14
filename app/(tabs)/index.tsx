import { StyledCalendar } from '@/components/Calendar';
import GradientBackground from '@/components/GradientBackground';
import { PainScaleCircles } from '@/components/ScaleCircles';
import { PainScaleSlider } from '@/components/ScaleSlider';
import { colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <GradientBackground  showHeader={false}>
      <View style={styles.container}>
        <Text style={styles.text}>Home screen</Text>
        <View style={styles.scaleContainer}> 
          <View style={{marginBottom: 10}}>
            <PainScaleSlider initialValue={5} onValueChange={(e: number) => {console.log('value changed', e)}} />
          </View>

            {/* <PainScaleBar value={5} onValueChange={() => {}} /> */}

          <View style={{marginBottom: 0}}>
            <PainScaleCircles initialValue={5} onValueChange={() => {}} /> 
          </View>
        <View style={{marginBottom: 10}}>
          <StyledCalendar />
        </View>
      </View>
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
  scaleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

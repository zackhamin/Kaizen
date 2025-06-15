import { HorizontalCalendar } from '@/components';
import GradientBackground from '@/components/GradientBackground';
import { colors } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <GradientBackground  showHeader={false}>
      <View style={styles.container}>
        <View style={styles.scaleContainer}> 
          <HorizontalCalendar onDateChange={(date) => {console.log('date changed', date)}} />
          {/* <View style={{marginBottom: 10}}>
            <PainScaleSlider initialValue={5} onValueChange={(e: number) => {console.log('value changed', e)}} />
          </View> */}

            {/* <PainScaleBar value={5} onValueChange={() => {}} /> */}
{/* 
          <View style={{marginBottom: 0}}>
            <PainScaleCircles initialValue={5} onValueChange={() => {}} /> 
          </View>
        <View style={{marginBottom: 10}}>
          <HorizontalCalendar  />
          <StyledCalendar />
        </View> */}
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
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});

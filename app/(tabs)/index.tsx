import { DailyGoals, HomeCardsContainer, HorizontalCalendar } from '@/components';
import { QuoteCard } from '@/components/Cards';
import GradientBackground from '@/components/Layout/GradientBackground';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <GradientBackground showHeader={false}>
      <View style={styles.container}>
        <View style={styles.scaleContainer}> 
          <HorizontalCalendar onDateChange={(date) => {console.log('date changed', date)}} />
        </View>
        
        <DailyGoals />
        
        <HomeCardsContainer />
        
        <View style={styles.quoteContainer}>
          <QuoteCard transparent={true} quote="Forget perfection. Just aim to be 1% better than yesterday." />
        </View>
        <View style={styles.questionContainer}>
          {/* <QuestionCard question="How are you feeling today?" onValueChange={(value) => {console.log('value changed', value)}} />  */}
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  scaleContainer: {
    width: '100%',
    marginBottom: 16,
  },
  quoteContainer: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  questionContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
});

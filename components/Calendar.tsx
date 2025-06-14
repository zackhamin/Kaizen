import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface CalendarProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  showMonthNavigation?: boolean;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  highlightToday?: boolean;
  showSelectedDate?: boolean;
}

interface SizeConfig {
  daySize: number;
  fontSize: number;
  headerFontSize: number;
  padding: number;
  spacing: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(View);

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const StyledCalendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  showMonthNavigation = true,
  size = 'medium',
  disabled = false,
  highlightToday = true,
  showSelectedDate = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(selectedDate || null);
  
  // Size configurations
  const sizeConfig: Record<string, SizeConfig> = {
    small: { daySize: 28, fontSize: 12, headerFontSize: 14, padding: 15, spacing: 2 },
    medium: { daySize: 32, fontSize: 14, headerFontSize: 16, padding: 20, spacing: 3 },
    large: { daySize: 36, fontSize: 16, headerFontSize: 18, padding: 25, spacing: 4 }
  };
  
  const config = sizeConfig[size];
  const today = new Date();

  // Update selected day when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedDay(selectedDate);
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date): boolean => {
    if (disabled) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return selectedDay ? date.toDateString() === selectedDay.toDateString() : false;
  };

  const handleDateSelect = (day: number) => {
    if (disabled) return;
    
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (isDateDisabled(newDate)) return;
    
    setSelectedDay(newDate);
    onDateChange?.(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (disabled) return;
    
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const MonthNavButton: React.FC<{ direction: 'prev' | 'next'; onPress: () => void }> = ({ 
    direction, 
    onPress 
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const tapGesture = Gesture.Tap()
      .onBegin(() => {
        scale.value = withSpring(0.9);
        opacity.value = withTiming(0.7);
      })
      .onEnd(() => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
        runOnJS(onPress)();
      })
      .enabled(!disabled);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <GestureDetector gesture={tapGesture}>
        <AnimatedPressable style={[styles.navButton, animatedStyle]}>
          <Text style={[styles.navButtonText, { fontSize: config.headerFontSize }]}>
            {direction === 'prev' ? '‹' : '›'}
          </Text>
        </AnimatedPressable>
      </GestureDetector>
    );
  };

  const DayCell: React.FC<{ day: number; isEmpty?: boolean }> = ({ day, isEmpty = false }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    
    if (isEmpty) {
      return <View style={[styles.dayCell, { width: config.daySize, height: config.daySize }]} />;
    }

    const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isDateSelected = isSelected(cellDate);
    const isDateToday = highlightToday && isToday(cellDate);
    const isDateDisabledStatus = isDateDisabled(cellDate);

    let backgroundColor = 'transparent';
    let textColor = '#333';
    let borderColor = 'transparent';
    let borderWidth = 0;

    if (isDateSelected) {
      backgroundColor = '#4CAF50';
      textColor = '#FFFFFF';
      borderWidth = 2;
      borderColor = '#4CAF50';
    } else if (isDateToday) {
      backgroundColor = '#E3F2FD';
      textColor = '#1976D2';
      borderWidth = 2;
      borderColor = '#1976D2';
    }

    if (isDateDisabledStatus) {
      textColor = '#CCC';
      backgroundColor = 'transparent';
      borderColor = 'transparent';
      borderWidth = 0;
    }

    const tapGesture = Gesture.Tap()
      .onBegin(() => {
        if (!isDateDisabledStatus) {
          scale.value = withSpring(0.9);
          opacity.value = withTiming(0.8);
        }
      })
      .onEnd(() => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
        if (!isDateDisabledStatus) {
          runOnJS(handleDateSelect)(day);
        }
      })
      .enabled(!disabled && !isDateDisabledStatus);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <GestureDetector gesture={tapGesture}>
        <AnimatedPressable
          style={[
            styles.dayCell,
            {
              width: config.daySize,
              height: config.daySize,
              borderRadius: config.daySize / 2,
              backgroundColor,
              borderWidth,
              borderColor,
            },
            animatedStyle
          ]}
        >
          <Text 
            style={[
              styles.dayText,
              {
                fontSize: config.fontSize,
                color: textColor,
                fontWeight: isDateSelected ? 'bold' : isDateToday ? '600' : 'normal',
              }
            ]}
          >
            {day}
          </Text>
        </AnimatedPressable>
      </GestureDetector>
    );
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7; // Always complete weeks
    const days = [];

    // Create all cells for a complete grid
    for (let i = 0; i < totalCells; i++) {
      if (i < firstDay) {
        // Empty cells before first day
        days.push(<DayCell key={`empty-start-${i}`} day={0} isEmpty />);
      } else if (i - firstDay + 1 <= daysInMonth) {
        // Days of the month
        const day = i - firstDay + 1;
        days.push(<DayCell key={day} day={day} />);
      } else {
        // Empty cells after last day to complete the grid
        days.push(<DayCell key={`empty-end-${i}`} day={0} isEmpty />);
      }
    }

    // Group days into weeks (always 7 days per week)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
        <View key={`week-${i / 7}`} style={styles.weekRow}>
          {days.slice(i, i + 7)}
        </View>
      );
    }

    return weeks;
  };

  return (
    <View style={[styles.container, { padding: config.padding }]}>
      {/* Month Header */}
      {showMonthNavigation && (
        <View style={styles.header}>
          <MonthNavButton 
            direction="prev" 
            onPress={() => navigateMonth('prev')} 
          />
          <Text style={[styles.monthTitle, { fontSize: config.headerFontSize + 4 }]}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <MonthNavButton 
            direction="next" 
            onPress={() => navigateMonth('next')} 
          />
        </View>
      )}

      {/* Days of Week Header */}
      <View style={styles.daysHeader}>
        {DAYS_SHORT.map((day) => (
          <Text 
            key={day} 
            style={[
              styles.dayHeaderText,
              { fontSize: config.fontSize - 2 }
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {renderCalendarDays()}
      </View>

      {/* Selected Date Display */}
      {showSelectedDate && selectedDay && (
        <View style={styles.selectedDateContainer}>
          <Text style={[styles.selectedDateText, { fontSize: config.fontSize }]}>
            Selected: {selectedDay.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dayHeaderText: {
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  calendarGrid: {
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  dayCell: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dayText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedDateContainer: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  selectedDateText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
});

export default StyledCalendar;
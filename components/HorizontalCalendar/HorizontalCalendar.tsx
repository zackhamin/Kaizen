import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DAYS_SHORT } from '@/constants/components.constants';
import { colors, theme } from '@/constants/theme';
import { CalendarBarProps, SizeConfig } from './types';

const AnimatedPressable = Animated.createAnimatedComponent(View);

const { width: screenWidth } = Dimensions.get('window');

const HorizontalCalendar: React.FC<CalendarBarProps> = ({
  selectedDate = new Date(),
  onDateChange,
  hasDataForDate,
  getDataIndicator,
  theme: themeMode = 'dark',
  size = 'medium',
  disabled = false,
}) => {
  const [selectedDay, setSelectedDay] = useState<Date>(selectedDate);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(selectedDate));
  const [displayMonth, setDisplayMonth] = useState<Date>(selectedDate);
  const scrollViewRef = useRef<ScrollView>(null);

  // Size configurations
  const sizeConfig: Record<string, SizeConfig> = {
    small: { daySize: 40, fontSize: 14, dayLetterSize: 10, indicatorSize: 4, spacing: 0, padding: theme.spacing.sm },
    medium: { daySize: 48, fontSize: 16, dayLetterSize: 12, indicatorSize: 5, spacing: 0, padding: theme.spacing.md },
    large: { daySize: 56, fontSize: 18, dayLetterSize: 14, indicatorSize: 6, spacing: 0, padding: theme.spacing.lg }
  };

  const config = sizeConfig[size];
  const dayWidth = screenWidth / 7; // Equal width for each day

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(d.setDate(diff));
  }

  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function isSameDay(date1: Date, date2: Date): boolean {
    // Check if both parameters are valid Date objects
    if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) {
      return false;
    }
    
    // Check if dates are valid (not Invalid Date)
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      return false;
    }
    
    return date1.toDateString() === date2.toDateString();
  }

  function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  const handleDateSelect = (date: Date) => {
    if (disabled || !date) return;
    
    // Ensure we're working with a valid Date object
    const selectedDate = new Date(date.getTime());
    console.log('Selected date:', selectedDate);
    
    setSelectedDay(selectedDate);
    onDateChange?.(selectedDate);
  };

  const getIndicatorColor = (date: Date): string => {
    if (!getDataIndicator) return colors.calendar.indicator.default;
    
    const indicator = getDataIndicator(date);
    switch (indicator) {
      case 'partial': return colors.calendar.indicator.partial;
      case 'complete': return colors.calendar.indicator.complete;
      case 'mood': return colors.calendar.indicator.mood;
      default: return colors.calendar.indicator.default;
    }
  };

  // Generate weeks for infinite scroll
  const generateWeeks = (): Date[][] => {
    const weeks: Date[][] = [];
    
    // Generate 21 weeks: 10 before current, current, 10 after for smooth infinite scroll
    for (let weekOffset = -10; weekOffset <= 10; weekOffset++) {
      const weekStart = addDays(currentWeekStart, weekOffset * 7);
      const week: Date[] = [];
      
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        week.push(addDays(weekStart, dayOffset));
      }
      
      weeks.push(week);
    }
    
    return weeks;
  };

  const DayCell: React.FC<{ date: Date; index: number }> = ({ date, index }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    
    const isSelected = isSameDay(date, selectedDay);
    const isDayToday = isToday(date);
    const hasData = hasDataForDate?.(date) || getDataIndicator?.(date) !== 'none';
    
    const tapGesture = Gesture.Tap()
      .onBegin(() => {
        scale.value = withSpring(0.85);
        opacity.value = withTiming(0.7);
      })
      .onEnd(() => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
        runOnJS(handleDateSelect)(date);
      })
      .enabled(!disabled);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const backgroundColor = isSelected 
      ? colors.calendar.selected[themeMode]
      : isDayToday
        ? colors.primary.light // Highlight today's date
        : colors.calendar.cardBackground[themeMode];
    
    const textColor = isSelected 
      ? colors.accent.white 
      : isDayToday
        ? colors.accent.white // White text for today
        : colors.text.primary[themeMode];

    return (
      <View style={[styles.dayContainer, { width: dayWidth }]}>
        {/* Day Letter */}
        <Text style={[
          styles.dayLetter,
          {
            fontSize: config.dayLetterSize,
            color: colors.text.secondary[themeMode],
            marginBottom: theme.spacing.xs,
            fontWeight: '600',
          }
        ]}>
          {DAYS_SHORT[index]}
        </Text>
        
        {/* Day Cell - Floating Square */}
        <GestureDetector gesture={tapGesture}>
          <AnimatedPressable
            style={[
              styles.dayCell,
              {
                width: config.daySize,
                height: config.daySize,
                backgroundColor,
                borderRadius: theme.borderRadius.medium,
                marginHorizontal: (dayWidth - config.daySize) / 2,
              },
              animatedStyle
            ]}
          >
            <Text style={[
              styles.dayText,
              {
                fontSize: config.fontSize,
                color: textColor,
                fontWeight: isSelected 
                  ? '700'
                  : isDayToday  
                    ?   '600'
                    : '500',
              }
            ]}>
              {date.getDate()}
            </Text>
            
            {/* Data Indicator */}
            {hasData && (
              <View style={[
                styles.indicator,
                {
                  width: config.indicatorSize,
                  height: config.indicatorSize,
                  borderRadius: config.indicatorSize / 2,
                  backgroundColor: getIndicatorColor(date),
                  bottom: 2,
                }
              ]} />
            )}
          </AnimatedPressable>
        </GestureDetector>
      </View>
    );
  };

  const WeekRow: React.FC<{ week: Date[]; weekIndex: number }> = ({ week, weekIndex }) => {
    return (
      <View style={[styles.weekRow, { width: screenWidth }]}>
        {week.map((date, dayIndex) => (
          <DayCell key={date.toISOString()} date={date} index={dayIndex} />
        ))}
      </View>
    );
  };

  const weeks = generateWeeks();

  // Ensure selectedDay is always a valid Date object
  useEffect(() => {
    const isValidDate = selectedDay && selectedDay instanceof Date && !isNaN(selectedDay.getTime());
    if (!isValidDate) {
      const newDate = new Date(selectedDate.getTime());
      setSelectedDay(newDate);
    }
  }, [selectedDate, selectedDay]);

  useEffect(() => {
    // Scroll to center week (index 10) on mount
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: screenWidth * 10,
        animated: false,
      });
    }, 100);
  }, []);

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const weekIndex = Math.round(contentOffset.x / screenWidth);
    
    // Update current week based on scroll position
    if (weekIndex >= 0 && weekIndex < weeks.length) {
      const newWeekStart = weeks[weekIndex][0];
      if (newWeekStart && !isSameDay(newWeekStart, currentWeekStart)) {
        const validWeekStart = new Date(newWeekStart);
        setCurrentWeekStart(validWeekStart);
        
        // Update display month based on the middle of the current week
        const midWeekDate = addDays(validWeekStart, 3); // Wednesday of the week
        setDisplayMonth(new Date(midWeekDate));
      }
    }
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: 'transparent',
      paddingVertical: config.padding,
    }]}>
      {/* Month Header */}
      <View style={styles.header}>
        <Text style={[styles.monthText, { 
          color: colors.text.primary[themeMode],
          fontSize: config.fontSize + 2,
          fontWeight: '600',
        }]}>
          {displayMonth && displayMonth instanceof Date && !isNaN(displayMonth.getTime()) 
            ? displayMonth.toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric'
              })
            : new Date().toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric'
              })
          }
        </Text>
      </View>

      {/* Scrollable Week View - Full Width */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        decelerationRate="fast"
        snapToInterval={screenWidth}
        snapToAlignment="start"
      >
        {weeks.map((week, weekIndex) => (
          <WeekRow key={`week-${weekIndex}`} week={week} weekIndex={weekIndex} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  monthText: {
    textAlign: 'left',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    alignItems: 'flex-start',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLetter: {
    textAlign: 'center',
  },
  dayCell: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  dayText: {
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
  },
});

export { HorizontalCalendar };

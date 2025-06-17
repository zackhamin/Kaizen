import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { DAYS_SHORT } from '@/constants/components.constants';
import { colors, theme } from '@/constants/theme';
import { CalendarBarProps, SizeConfig } from './types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
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

  // Size configurations
  const sizeConfig: Record<string, SizeConfig> = {
    small: { daySize: 40, fontSize: 14, dayLetterSize: 10, indicatorSize: 4, spacing: 0, padding: theme.spacing.sm },
    medium: { daySize: 48, fontSize: 16, dayLetterSize: 12, indicatorSize: 5, spacing: 0, padding: theme.spacing.md },
    large: { daySize: 56, fontSize: 18, dayLetterSize: 14, indicatorSize: 6, spacing: 0, padding: theme.spacing.lg }
  };

  const config = sizeConfig[size];
  const dayWidth = screenWidth / 7; // Equal width for each day

  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function isSameDay(date1: Date, date2: Date): boolean {
    if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) {
      return false;
    }
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      return false;
    }
    return date1.toDateString() === date2.toDateString();
  }

  function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  const handleDateSelect = useCallback((date: Date) => {
    if (disabled || !date) return;
    
    const selectedDate = new Date(date.getTime());
    setSelectedDay(selectedDate);
    onDateChange?.(selectedDate);
  }, [disabled, onDateChange]);

  const getIndicatorColor = useCallback((date: Date): string => {
    if (!getDataIndicator) return colors.calendar.indicator.default;
    
    const indicator = getDataIndicator(date);
    switch (indicator) {
      case 'partial': return colors.calendar.indicator.partial;
      case 'complete': return colors.calendar.indicator.complete;
      case 'mood': return colors.calendar.indicator.mood;
      default: return colors.calendar.indicator.default;
    }
  }, [getDataIndicator]);

  // Generate just the current week (7 days starting from today)
  const dates = useMemo(() => {
    const today = new Date();
    const dateArray: Date[] = [];
    
    // Start from today and show next 7 days
    for (let i = 0; i < 7; i++) {
      dateArray.push(addDays(today, i));
    }
    
    return dateArray;
  }, []); // Only calculate once on mount

  const DayCell: React.FC<{ date: Date; index: number }> = ({ date, index }) => {
    const scale = useSharedValue(1);
    
    const isSelected = isSameDay(date, selectedDay);
    const isDayToday = isToday(date);
    const hasData = hasDataForDate?.(date) || getDataIndicator?.(date) !== 'none';
    
    const onPress = useCallback(() => {
      if (disabled) return;
      
      scale.value = withSpring(0.9, { duration: 150 }, () => {
        scale.value = withSpring(1, { duration: 150 });
      });
      
      handleDateSelect(date);
    }, [date, disabled]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const backgroundColor = isSelected 
      ? (disabled ? colors.calendar.disabled?.background?.[themeMode] : colors.calendar.selected[themeMode])
      : isDayToday
        ? (disabled ? colors.calendar.disabled?.background?.[themeMode] : colors.secondary.light) // Use secondary.light for today
        : (disabled ? colors.calendar.disabled?.background?.[themeMode] : colors.ui.surface[themeMode]); // Box around all dates
    
    const borderColor = isSelected
      ? (disabled ? colors.calendar.disabled?.border?.[themeMode] : colors.calendar.selected[themeMode])
      : isDayToday
        ? (disabled ? colors.calendar.disabled?.border?.[themeMode] : colors.secondary.light)
        : (disabled ? colors.calendar.disabled?.border?.[themeMode] : colors.ui.border[themeMode]);
    
    const textColor = isSelected || isDayToday
      ? (disabled ? colors.text.disabled?.[themeMode] : colors.accent.white)
      : (disabled ? colors.text.disabled?.[themeMode] : colors.text.primary[themeMode]);

    return (
      <View style={[styles.dayContainer, { width: dayWidth }]}>
        {/* Day Letter */}
        <Text style={[
          styles.dayLetter,
          {
            fontSize: config.dayLetterSize,
            color: disabled ? colors.text.disabled?.[themeMode] : colors.text.secondary[themeMode],
            marginBottom: theme.spacing.xs,
            fontWeight: '600',
          }
        ]}>
          {DAYS_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1]}
        </Text>
        
        {/* Day Cell with Box */}
        <AnimatedPressable
          onPress={onPress}
          style={[
            styles.dayCell,
            {
              width: config.daySize,
              height: config.daySize,
              backgroundColor,
              borderRadius: theme.borderRadius.medium,
              borderWidth: 1,
              borderColor,
              marginHorizontal: (dayWidth - config.daySize) / 2,
              opacity: disabled ? 0.4 : 1,
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
                  ? '600'
                  : '500',
            }
          ]}>
            {date.getDate()}
          </Text>
          
          {/* Data Indicator */}
          {hasData && !disabled && (
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
      </View>
    );
  };

  // Get current month for header
  const currentMonth = selectedDay.toLocaleDateString('en-US', { 
    month: 'long',
    year: 'numeric'
  });

  return (
    <View style={[styles.container, { 
      backgroundColor: 'transparent',
      paddingVertical: config.padding,
      opacity: disabled ? 0.6 : 1,
    }]}>
      {/* Month Header */}
      <View style={styles.header}>
        <Text style={[styles.monthText, { 
          color: disabled ? colors.text.disabled?.[themeMode] : colors.text.primary[themeMode],
          fontSize: config.fontSize + 2,
          fontWeight: '600',
        }]}>
          {currentMonth}
        </Text>
      </View>

      {/* Single Row of 7 Days */}
      <View style={styles.weekRow}>
        {dates.map((date, index) => (
          <DayCell key={date.toISOString()} date={date} index={index} />
        ))}
      </View>
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
  weeksContainer: {
    paddingHorizontal: 0,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 70,
  },
  dayLetter: {
    textAlign: 'center',
    height: 16,
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

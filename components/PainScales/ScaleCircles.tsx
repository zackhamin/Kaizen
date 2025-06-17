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

interface PainScaleCirclesProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
  showLabels?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'grid';
}

interface SizeConfig {
  circleSize: number;
  fontSize: number;
  padding: number;
  spacing: number;
}

interface ColorScheme {
  bg: string;
  text: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(View);

export const PainScaleCircles: React.FC<PainScaleCirclesProps> = ({ 
  initialValue = 0,
  onValueChange,
  showLabels = false,
  disabled = false,
  size = 'medium',
  layout = 'horizontal'
}) => {
  const [currentValue, setCurrentValue] = useState<number>(initialValue);
  
  // Size configurations
  const sizeConfig: Record<string, SizeConfig> = {
    small: { circleSize: 24, fontSize: 10, padding: 15, spacing: 2 },
    medium: { circleSize: 28, fontSize: 12, padding: 20, spacing: 3 },
    large: { circleSize: 32, fontSize: 14, padding: 25, spacing: 4 }
  };
  
  const config = sizeConfig[size];

  // Color scheme based on rating level
  const getColorScheme = (value: number): ColorScheme => {
    if (value === 0) return { bg: '#4CAF50', text: '#FFFFFF' }; // Great - Green
    if (value <= 2) return { bg: '#8BC34A', text: '#FFFFFF' }; // Good - Light Green
    if (value <= 4) return { bg: '#FF9800', text: '#FFFFFF' }; // Okay - Orange
    return { bg: '#F44336', text: '#FFFFFF' }; // Shit - Red
  };

  const updateValue = (newValue: number) => {
    if (newValue !== currentValue && newValue >= 0 && newValue <= 6 && !disabled) {
      setCurrentValue(newValue);
      onValueChange?.(newValue);
    }
  };

  // Update current value when initialValue changes
  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  const CircleItem: React.FC<{ index: number }> = ({ index }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const colorScheme = getColorScheme(index);
    
    const isSelected = currentValue === index;
    const isActive = currentValue >= index;
    
    const backgroundColor = isActive ? colorScheme.bg : '#E8E8E8';
    const textColor = isActive ? colorScheme.text : '#666';
    const borderColor = isSelected ? colorScheme.bg : '#DDD';
    const borderWidth = isSelected ? 3 : 1;

    const tapGesture = Gesture.Tap()
      .onBegin(() => {
        scale.value = withSpring(0.9);
        opacity.value = withTiming(0.8);
      })
      .onEnd(() => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
        runOnJS(updateValue)(index);
      })
      .enabled(!disabled);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <GestureDetector gesture={tapGesture}>
        <AnimatedPressable
          style={[
            styles.circle,
            {
              width: config.circleSize,
              height: config.circleSize,
              borderRadius: config.circleSize / 2,
              backgroundColor,
              borderWidth,
              borderColor,
              marginHorizontal: 2,
              opacity: disabled ? 0.5 : 1,
            },
            animatedStyle
          ]}
        >
          <Text 
            style={[
              styles.circleText, 
              { 
                fontSize: config.fontSize,
                color: textColor,
                fontWeight: isSelected ? 'bold' : '600'
              }
            ]}
          >
            {index}
          </Text>
        </AnimatedPressable>
      </GestureDetector>
    );
  };

  const renderCircles = (): React.JSX.Element[] => {
    return Array.from({ length: 7 }, (_, index) => (
      <CircleItem key={index} index={index} />
    ));
  };

  return (
    <View style={[styles.container, { padding: config.padding }]}>
      <View style={[
        styles.circlesContainer,
        layout === 'grid' ? styles.gridLayout : styles.horizontalLayout
      ]}>
        {renderCircles()}
      </View>
      
      {showLabels && (
        <View style={styles.labelsContainer}>
          <Text style={[styles.endLabel, { 
            fontSize: config.fontSize - 2,
            opacity: disabled ? 0.5 : 1 
          }]}>
            😊 Great
          </Text>
          <Text style={[styles.endLabel, { 
            fontSize: config.fontSize - 2,
            opacity: disabled ? 0.5 : 1 
          }]}>
            💩 Shit
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
    overflow: 'hidden',
  },
  circlesContainer: {
    marginBottom: 0,
  },
  horizontalLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  gridLayout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  circleText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  endLabel: {
    color: '#666',
    fontWeight: '500',
  },
});

export default PainScaleCircles;
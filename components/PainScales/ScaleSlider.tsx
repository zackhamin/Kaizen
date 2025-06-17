
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface PainScaleSliderProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
  showLabels?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

interface SizeConfig {
  height: number;
  thumbSize: number;
  fontSize: number;
  padding: number;
}

interface ColorScheme {
  bg: string;
  text: string;
}

export const PainScaleSlider: React.FC<PainScaleSliderProps> = ({ 
  initialValue = 0,
  onValueChange,
  showLabels = false,
  disabled = false,
  size = 'medium',
}) => {
  const [currentValue, setCurrentValue] = useState<number>(initialValue);
  const [sliderWidth, setSliderWidth] = useState<number>(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Size configurations
  const sizeConfig: Record<string, SizeConfig> = {
    small: { height: 40, thumbSize: 16, fontSize: 14, padding: 15 },
    medium: { height: 50, thumbSize: 20, fontSize: 16, padding: 20 },
    large: { height: 60, thumbSize: 24, fontSize: 18, padding: 25 }
  };
  
  const config = sizeConfig[size];

  // Color scheme based on pain level
  const getColorScheme = (value: number): ColorScheme => {
    if (value === 0) return { bg: '#4CAF50', text: '#FFFFFF' }; // Green for no pain
    if (value <= 3) return { bg: '#8BC34A', text: '#FFFFFF' }; // Light green for mild
    if (value <= 6) return { bg: '#FF9800', text: '#FFFFFF' }; // Orange for moderate
    if (value <= 8) return { bg: '#F44336', text: '#FFFFFF' }; // Red for severe
    return { bg: '#B71C1C', text: '#FFFFFF' }; // Dark red for worst pain
  };

  const getPainLabel = (value: number): string => {
    if (value === 0) return 'No Pain';
    if (value <= 3) return 'Mild Pain';
    if (value <= 6) return 'Moderate Pain';
    if (value <= 8) return 'Severe Pain';
    return 'Worst Possible Pain';
  };

  const updateValue = (newValue: number) => {
    if (newValue !== currentValue && newValue >= 0 && newValue <= 10) {
      setCurrentValue(newValue);
      onValueChange?.(newValue);
    }
  };

  // Modern gesture handler using Gesture API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      const clampedX = Math.max(0, Math.min(event.x, sliderWidth));
      translateX.value = clampedX;
      
      const percentage = clampedX / sliderWidth;
      const newValue = Math.round(percentage * 10);
      runOnJS(updateValue)(newValue);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      // Snap to exact position
      const targetX = (currentValue / 10) * sliderWidth;
      translateX.value = withSpring(targetX);
    })
    .enabled(!disabled);

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
    };
  });

  const activeTrackAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      translateX.value,
      [0, sliderWidth],
      [0, 100],
      'clamp'
    );
    return {
      width: `${width}%`,
    };
  });

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    const trackWidth = width - config.thumbSize;
    setSliderWidth(trackWidth);
    
    // Initialize thumb position
    const initialX = (currentValue / 10) * trackWidth;
    translateX.value = initialX;
  };

  const handleNumberPress = (value: number) => {
    if (!disabled) {
      updateValue(value);
      const targetX = (value / 10) * sliderWidth;
      translateX.value = withSpring(targetX);
    }
  };

  const colorScheme = getColorScheme(currentValue);

  return (
    <View style={[styles.container, { padding: config.padding }]}>
      {showLabels && (
        <View style={styles.headerContainer}>
          <Text style={[styles.currentValue, { 
            fontSize: config.fontSize + 8,
            color: colorScheme.bg 
          }]}>
            {currentValue}/10
          </Text>
          <View style={[styles.labelBadge, { backgroundColor: colorScheme.bg }]}>
            <Text style={[styles.painLabel, { 
              color: colorScheme.text,
              fontSize: config.fontSize - 2 
            }]}>
              {getPainLabel(currentValue)}
            </Text>
          </View>
        </View>
      )}
      
      <View 
        style={[styles.sliderContainer, { height: config.height }]}
        onLayout={handleLayout}
      >
        {/* Background Track */}
        <View style={[styles.track, { height: 8 }]}>
          {/* Active Track */}
          <Animated.View 
            style={[
              styles.activeTrack,
              { backgroundColor: colorScheme.bg },
              activeTrackAnimatedStyle
            ]} 
          />
        </View>
        
        {/* Gesture Detector for Thumb */}
        {sliderWidth > 0 && (
          <GestureDetector gesture={panGesture}>
            <Animated.View 
              style={[
                styles.thumbContainer,
                {
                  width: config.thumbSize,
                  height: config.thumbSize,
                },
                thumbAnimatedStyle
              ]}
            >
              <View style={[
                styles.thumb,
                {
                  backgroundColor: colorScheme.bg,
                  width: config.thumbSize,
                  height: config.thumbSize,
                  borderRadius: config.thumbSize / 2,
                  opacity: disabled ? 0.5 : 1,
                }
              ]}>
                <Text style={[styles.thumbText, { 
                  fontSize: config.fontSize - 6,
                  color: colorScheme.text 
                }]}>
                  {currentValue}
                </Text>
              </View>
            </Animated.View>
          </GestureDetector>
        )}
      </View>
      
      {/* Number Scale - Now Pressable */}
      <View style={styles.numbersContainer}>
        {[...Array(11)].map((_, index) => (
          <Pressable
            key={index}
            style={styles.numberWrapper}
            onPress={() => handleNumberPress(index)}
            disabled={disabled}
          >
            <Text 
              style={[
                styles.numberLabel, 
                { 
                  fontSize: config.fontSize - 4,
                  color: currentValue === index ? colorScheme.bg : '#666',
                  fontWeight: currentValue === index ? 'bold' : 'normal',
                  transform: [{ scale: currentValue === index ? 1.2 : 1 }],
                  opacity: disabled ? 0.5 : 1,
                }
              ]}
            >
              {index}
            </Text>
          </Pressable>
        ))}
      </View>
      
      {showLabels && (
        <View style={styles.labelsContainer}>
          <Text style={[styles.endLabel, { 
            fontSize: config.fontSize - 4,
            opacity: disabled ? 0.5 : 1 
          }]}>
            😌 No Pain
          </Text>
          <Text style={[styles.endLabel, { 
            fontSize: config.fontSize - 4,
            opacity: disabled ? 0.5 : 1 
          }]}>
            😵 Worst Pain
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  currentValue: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  labelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  painLabel: {
    fontWeight: '600',
  },
  sliderContainer: {
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTrack: {
    height: '100%',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbContainer: {
    position: 'absolute',
    top: '50%',
    marginTop: -10,
  },
  thumb: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  thumbText: {
    fontWeight: 'bold',
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  numberWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    minHeight: 24,
    borderRadius: 12,
  },
  numberLabel: {
    fontWeight: '600',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  endLabel: {
    color: '#666',
    fontWeight: '500',
  },
});
import { PainLevel, PainScaleProps } from '@/types/PainScale';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PainScaleBar: React.FC<PainScaleProps> = ({ 
  value = 0, 
  onValueChange, 
  showLabels = true,
  activeColor = '#FF6B6B',
  inactiveColor = '#E8E8E8',
  textColor = '#333'
}) => {
  const [selectedValue, setSelectedValue] = useState<number>(value);

  const handlePress = (newValue: number): void => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
  };

  const getPainLabel = (value: number): PainLevel => {
    if (value === 0) return 'No Pain';
    if (value <= 3) return 'Mild';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Severe';
    return 'Worst Pain';
  };

  const getBarWidth = (index: number): number => {
    return selectedValue >= index ? 100 : 0;
  };

  const renderScaleNumbers = (): React.JSX.Element[] => {
    return Array.from({ length: 11 }, (_, index) => (
      <TouchableOpacity
        key={index}
        style={styles.barContainer}
        onPress={() => handlePress(index)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Pain level ${index}`}
        accessibilityHint={`Select pain level ${index} out of 10`}
      >
        <View style={[styles.barBackground, { backgroundColor: inactiveColor }]}>
          <View 
            style={[
              styles.barFill, 
              { 
                backgroundColor: activeColor,
                width: getBarWidth(index) as number
              }
            ]} 
          />
        </View>
        <Text style={[styles.numberLabel, { color: textColor }]}>
          {index}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.headerContainer}>
          <Text style={[styles.currentValue, { color: textColor }]}>
            Pain Level: {selectedValue}
          </Text>
          <Text style={[styles.painLabel, { color: activeColor }]}>
            {getPainLabel(selectedValue)}
          </Text>
        </View>
      )}
      
      <View style={styles.scaleContainer}>
        {renderScaleNumbers()}
      </View>
      
      {showLabels && (
        <View style={styles.labelsContainer}>
          <Text style={[styles.endLabel, { color: textColor }]}>No Pain</Text>
          <Text style={[styles.endLabel, { color: textColor }]}>Worst Pain</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  painLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  barBackground: {
    width: '100%',
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  numberLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  endLabel: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default PainScaleBar;
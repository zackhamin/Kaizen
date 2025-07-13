import { colors, theme } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NumberScaleProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 6;

export const NumberScale: React.FC<NumberScaleProps> = ({ value, onChange, min = DEFAULT_MIN, max = DEFAULT_MAX, disabled }) => {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      {numbers.map((num) => (
        <TouchableOpacity
          key={num}
          style={[styles.number, value === num && styles.selected, disabled && styles.disabled]}
          onPress={() => !disabled && onChange(num)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text style={[styles.numberText, value === num && styles.selectedText]}>{num}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  number: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass.buttonDefault,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: colors.accent.copper,
    borderColor: colors.accent.copper,
  },
  disabled: {
    opacity: 0.5,
  },
  numberText: {
    color: colors.glass.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedText: {
    color: colors.accent.white,
    fontWeight: 'bold',
  },
});

export default NumberScale; 
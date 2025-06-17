import { colors, theme } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  transparent = false,
  style,
  title,
  subtitle,
}) => {
  return (
    <View style={[
      styles.container,
      {
        backgroundColor: transparent ? 'transparent' : colors.ui.surface.light,
      },
      style
    ]}>
      {title && (
        <Text style={[styles.title, { color: colors.text.primary.light }]}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.text.secondary.light }]}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
}); 
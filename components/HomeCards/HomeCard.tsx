import { colors, theme } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface HomeCardProps {
  title: string;
  subtitle?: string;
  count?: number;
  maxCount?: number;
  icon?: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const HomeCard: React.FC<HomeCardProps> = ({
  title,
  subtitle,
  count,
  maxCount,
  icon,
  onPress,
  style,
  disabled = false,
}) => {
  const getProgressColor = () => {
    if (!maxCount || count === undefined) return colors.glass.text.primary;
    
    const percentage = count / maxCount;
    if (percentage >= 0.8) return colors.success.main;
    if (percentage >= 0.5) return colors.warning.main;
    return colors.glass.text.primary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          {icon && (
            <Text style={[styles.icon, { color: getProgressColor() }]}>
              {icon}
            </Text>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={3}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass.conversationCard,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.conversationBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 100,
    flex: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
    marginTop: 2,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  count: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  maxCount: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    marginLeft: 4,
  },
});
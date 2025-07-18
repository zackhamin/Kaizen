import { colors, theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, LayoutAnimation, Platform, StyleSheet, TouchableOpacity, UIManager, View, ViewStyle } from 'react-native';

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  initialCollapsed?: boolean;
  icon?: React.ReactNode;
  onToggle?: (collapsed: boolean) => void;
  containerStyle?: ViewStyle;
}

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  children,
  initialCollapsed = true,
  icon,
  onToggle,
  containerStyle,
}) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((prev) => {
      const next = !prev;
      onToggle?.(next);
      return next;
    });
  };

  return (
    <View style={[styles.container, containerStyle]}>  
      <TouchableOpacity style={styles.header} activeOpacity={0.8} onPress={handleToggle}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <View style={styles.titleContainer}>
          <Animated.Text style={styles.title}>{title}</Animated.Text>
        </View>
        <Ionicons
          name={collapsed ? 'chevron-down' : 'chevron-up'}
          size={22}
          color={colors.glass.text.primary}
          style={styles.chevron}
        />
      </TouchableOpacity>
      {!collapsed && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    marginVertical: theme.spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: colors.glass.overlay,
  },
  icon: {
    marginRight: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.glass.text.primary,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  chevron: {
    marginLeft: theme.spacing.md,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: colors.glass.overlay,
  },
});

export default CollapsibleCard; 
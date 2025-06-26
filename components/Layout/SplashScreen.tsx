import { colors, theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface SplashScreenProps {
  message?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.accent.slate, colors.background.dark]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        {/* Kaizen Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>改善</Text>
          <Text style={styles.logoSubtext}>Kaizen</Text>
        </View>
        
        {/* Japanese Motto */}
        <View style={styles.mottoContainer}>
          <Text style={styles.mottoText}>継続は力なり</Text>
          <Text style={styles.mottoTranslation}>"Continuity is strength"</Text>
        </View>
        
        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.copper} />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoText: {
    fontSize: 72,
    fontWeight: '700',
    color: colors.accent.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: theme.spacing.sm,
  },
  logoSubtext: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.accent.copper,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mottoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  mottoText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mottoTranslation: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.glass.text.secondary,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.glass.text.secondary,
    marginTop: theme.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
}); 
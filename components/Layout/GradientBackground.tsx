import { colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Header from './Header';

interface Props {
  children: React.ReactNode;
  showHeader?: boolean;
} 

export default function GradientBackground({ children, showHeader = true }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.accent.slate, colors.background.dark]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.content}>
        {showHeader && <Header />}
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
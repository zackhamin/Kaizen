import { colors, theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ConnectionStatusProps {
  isConnected: boolean;
  showWhenConnected?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  showWhenConnected = false
}) => {
  // Only show when disconnected or when explicitly asked to show connected state
  if (isConnected && !showWhenConnected) return null;

  return (
    <View style={[
      styles.container,
      isConnected ? styles.connected : styles.disconnected
    ]}>
      <Ionicons 
        name={isConnected ? "wifi" : "wifi-outline"} 
        size={12} 
        color={isConnected ? colors.success.main : colors.error.main} 
      />
      <Text style={[
        styles.text,
        { color: isConnected ? colors.success.main : colors.error.main }
      ]}>
        {isConnected ? 'Live' : 'Connecting...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.medium,
    alignSelf: 'flex-start',
    gap: 4,
  },
  connected: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  disconnected: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
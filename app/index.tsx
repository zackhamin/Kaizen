import { SplashScreen } from '@/components/Layout/SplashScreen';
import { colors, theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setHasSession(true);
        // Auto-redirect to tabs after a brief delay
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      } else {
        setHasSession(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setHasSession(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleContinue = () => {
    router.push('/(auth)/sign-in');
  };

  if (isChecking) {
    return <SplashScreen message="Checking session..." />;
  }

  return (
    <SplashScreen message={hasSession ? "Welcome back!" : "Ready to continue"}>
      {!hasSession && (
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </SplashScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent.copper,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: colors.accent.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 
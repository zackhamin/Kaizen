import GradientBackground from '@/components/Layout/GradientBackground';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetPassword = async () => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'exp://192.168.1.100:8081/--/(auth)/sign-in',
      });

      if (error) throw error;
      
      setMessage('Check your email for the password reset link');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    // Implementation for resending code
  };

  return (
    <GradientBackground showHeader={false}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
          </Text>
        </View>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={colors.glass.text.placeholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.mainButton, loading && styles.mainButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>
              {loading ? 'Sending...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.muted.dark,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  form: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: colors.glass.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.glass.inputBorder,
    color: colors.glass.text.primary,
  },
  message: {
    color: colors.glass.text.primary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: colors.glass.buttonDefault,
    padding: 12,
    borderRadius: 8,
  },
  mainButton: {
    backgroundColor: colors.glass.buttonDefault,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  mainButtonDisabled: {
    backgroundColor: colors.glass.buttonDisabled,
    opacity: 0.6,
  },
  mainButtonText: {
    color: colors.glass.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.glass.overlay,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.glass.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'solace://reset-password',
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
        </Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.resetButtonText]}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.primary.dark,
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.ui.muted.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  message: {
    color: colors.primary.main,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  resetButton: {
    backgroundColor: colors.primary.main,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonText: {
    color: colors.background.light,
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    color: colors.primary.main,
    fontSize: 16,
    textAlign: 'center',
  },
}); 
import GradientBackground from '@/components/Layout/GradientBackground';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { UserService } from '../../services/user.service';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

const userService = new UserService();

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'exp://192.168.1.100:8081/--/(tabs)',
        },
      });

      if (error) throw error;
      console.log('OAuth sign in successful');
    } catch (error: any) {
      console.error('OAuth sign in error:', error);
      Alert.alert('Error', `Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to', isSignUp ? 'sign up' : 'sign in', 'with email:', email);
      
      if (isSignUp) {
        // Sign up with user metadata
        console.log('Attempting sign up with full name:', fullName);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });

        console.log('Sign up response:', {
          success: !signUpError,
          userId: signUpData?.user?.id,
          error: signUpError ? {
            message: signUpError.message,
            status: signUpError.status,
            code: signUpError.code
          } : null
        });

        if (signUpError) throw signUpError;

        if (signUpData?.user) {
          console.log('Sign up successful, user created:', signUpData.user.id);
          Alert.alert(
            'Success',
            'Please check your email for the confirmation link before signing in.'
          );
          // Clear form and switch to sign in mode
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
          setIsSignUp(false);
        }
      } else {
        // Sign in flow
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('Sign in response:', {
          success: !signInError,
          userId: signInData?.user?.id,
          error: signInError ? {
            message: signInError.message,
            status: signInError.status,
            code: signInError.code
          } : null
        });

        if (signInError) throw signInError;

        if (signInData?.user) {
          console.log('Sign in successful, user:', signInData.user.id);
          
          // Wait a moment for the session to fully establish
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Ensure user profile exists
          try {
            console.log('Ensuring user profile exists...');
            const profile = await userService.ensureUserRecord();
            console.log('User profile ensured successfully:', profile.id);
            router.replace('/(tabs)');
          } catch (userError) {
            console.error('Error ensuring user profile:', userError);
            
            // If it's a permission error, try again after a longer delay
            if (userError.code === '42501') {
              console.log('Permission denied, waiting and retrying...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              try {
                const profile = await userService.ensureUserRecord();
                console.log('Retry successful:', profile.id);
                router.replace('/(tabs)');
              } catch (retryError) {
                console.error('Retry failed:', retryError);
                Alert.alert(
                  'Error',
                  'There was an issue setting up your profile. Please sign out and sign in again.'
                );
              }
            } else {
              Alert.alert(
                'Warning',
                'Signed in successfully but there was an issue setting up your profile. Please try refreshing the app.'
              );
              router.replace('/(tabs)');
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Detailed error in email auth:', {
        message: error.message,
        status: error.status,
        name: error.name,
        code: error.code,
        stack: error.stack
      });
      
      // Try to get more specific error information
      if (error.status === 500) {
        console.error('Database error details:', {
          originalError: error.originalError,
          details: error.details,
          hint: error.hint
        });
      }
      
      Alert.alert(
        'Error',
        isSignUp 
          ? `Failed to create account: ${error.message}`
          : `Failed to sign in: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
      <GradientBackground
        showHeader={false}
      >
        <View style={styles.content}>
          {/* Logo/Icon Section */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Kaizen</Text>
          </View>

          {/* Header Text */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome to Kaizen</Text>
            <Text style={styles.title}>改善</Text>
          </View>

          {/* Sign In/Register Form */}
          <View style={styles.form}>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.accent.slate}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={colors.accent.slate}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.accent.slate}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.accent.slate}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="password"
              />
            )}
            {!isSignUp && (
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgotten Password? Reset it here</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => handleEmailAuth(isSignUp)}
              disabled={loading}
            >
              <Text style={styles.mainButtonText}>
                {loading ? 'Please wait...' : isSignUp ? 'Register' : 'Login'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.toggleButtonText}>
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Register"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontFamily: 'LeagueSpartan',
    fontSize: 40,
    color: colors.text.muted.dark,
    marginBottom: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.muted.dark,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  form: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 24,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.ui.muted.light,
    color: colors.text.primary.light,
  },
  forgotPassword: {
    color: colors.text.primary.dark,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 16,
  },
  mainButton: {
    backgroundColor: colors.text.primary.light,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    padding: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: colors.text.primary.dark,
    fontSize: 14,
    textAlign: 'center',
  },
});
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
import { userService } from '../../services/user.service.modern';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [alias, setAlias] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSignIn = async (provider: 'google' | 'apple') => {
    try {
      setOauthLoading(true);
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
      setOauthLoading(false);
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

    if (isSignUp && !alias.trim()) {
      Alert.alert('Error', 'Please enter an alias');
      return;
    }

    if (isSignUp && alias.trim().length < 3) {
      Alert.alert('Error', 'Alias must be at least 3 characters long');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to', isSignUp ? 'sign up' : 'sign in', 'with email:', email);
      
      if (isSignUp) {
        // Sign up with user metadata
        console.log('Attempting sign up with full name:', fullName, 'and alias:', alias);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              alias: alias.trim()
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
          
          // Check if email confirmation is required
          if (signUpData.session) {
            // User is automatically signed in (email confirmation not required)
            console.log('User automatically signed in, creating profile...');
            
            // Wait a moment for the session to fully establish
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Ensure user profile exists
            try {
              console.log('Ensuring user profile exists...');
              const profile = await userService.getCurrentUser();
              console.log('User profile ensured successfully:', profile.id);
              router.replace('/(tabs)');
            } catch (userError: any) {
              console.error('Error ensuring user profile:', userError);
              Alert.alert(
                'Warning',
                'Account created successfully but there was an issue setting up your profile. Please try signing in again.'
              );
              // Clear form and switch to sign in mode
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setFullName('');
              setAlias('');
              setIsSignUp(false);
            }
          } else {
            // Email confirmation is required
            Alert.alert(
              'Success',
              'Please check your email for the confirmation link before signing in.'
            );
            // Clear form and switch to sign in mode
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setFullName('');
            setAlias('');
            setIsSignUp(false);
          }
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
            const profile = await userService.getCurrentUser();
            console.log('User profile ensured successfully:', profile.id);
            router.replace('/(tabs)');
          } catch (userError: any) {
            console.error('Error ensuring user profile:', userError);
            
            // If it's a permission error, try again after a longer delay
            if (userError.code === '42501') {
              console.log('Permission denied, waiting and retrying...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              try {
                const profile = await userService.getCurrentUser();
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
      <GradientBackground showHeader={false}>
        <View style={styles.content}>
          {/* Header Text */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome to Kaizen</Text>
            <Text style={styles.subtitle}>改善</Text>
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={[styles.oauthButton, oauthLoading && styles.oauthButtonDisabled]}
              onPress={() => handleSignIn('google')}
              disabled={oauthLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.oauthButtonText}>🔍 Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign In/Register Form */}
          <View style={styles.form}>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.glass.text.placeholder}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
              />
            )}
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Alias (Anonymous Name)"
                placeholderTextColor={colors.glass.text.placeholder}
                value={alias}
                onChangeText={setAlias}
                autoCapitalize="words"
                autoComplete="username"
                maxLength={20}
              />
            )}
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
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.glass.text.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.glass.text.placeholder}
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
              style={[styles.mainButton, loading && styles.mainButtonDisabled]}
              onPress={() => handleEmailAuth(isSignUp)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.mainButtonText}>
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.toggleButtonText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
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
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text.primary.dark,
  },
  form: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 24,
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
  forgotPassword: {
    color: colors.glass.text.secondary,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 16,
  },
  mainButton: {
    backgroundColor: colors.glass.buttonDefault,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
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
  toggleButton: {
    padding: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: colors.glass.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  oauthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  oauthButton: {
    backgroundColor: colors.glass.buttonDefault,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 8,
  },
  oauthButtonDisabled: {
    backgroundColor: colors.glass.buttonDisabled,
    opacity: 0.6,
  },
  oauthButtonText: {
    color: colors.glass.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glass.overlay,
  },
  dividerText: {
    color: colors.glass.text.secondary,
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 16,
  },
});
import { LinearGradient } from 'expo-linear-gradient';
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
import { colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { UserService } from '../../services/user.service';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

const userService = new UserService();

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignIn = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) throw error;

      // Profile will be created automatically when getCurrentUser is called
    } catch (error) {
      console.error('Error signing in:', error);
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to', isSignUp ? 'sign up' : 'sign in', 'with email:', email);
      
      if (isSignUp) {
        // Try sign up with minimal data first
        console.log('Attempting sign up with minimal data...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {} // Empty data object
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
            'Please check your email for the confirmation link'
          );
        }
      } else {
        // Sign in flow remains the same
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
          router.replace('/(tabs)');
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
      <LinearGradient
        colors={[colors.background.light, colors.primary.main]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo/Icon Section */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Solace</Text>
          </View>

          {/* Header Text */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome to Solace</Text>
          </View>

          {/* Sign In/Register Form */}
          <View style={styles.form}>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.ui.muted.light}
                value={fullName}
                onChangeText={setFullName}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={colors.ui.muted.light}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.ui.muted.light}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.ui.muted.light}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
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
      </LinearGradient>
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
    color: colors.text.primary.dark,
    marginBottom: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary.dark,
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
    color: colors.text.primary.dark,
  },
  forgotPassword: {
    color: colors.text.primary.dark,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 16,
  },
  mainButton: {
    backgroundColor: colors.text.primary.dark,
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
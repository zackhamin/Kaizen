import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.light, '#F3F4F6']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo/Icon Section */}
          <View style={styles.logoContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="heart" size={40} color={colors.primary.main} />
            </View>
            <View style={styles.decorativeCircle} />
            <View style={styles.decorativeCircleSmall} />
          </View>

          {/* Header Text */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome to Solace</Text>
            <Text style={styles.subtitle}>
              Join a compassionate community where your health journey matters
            </Text>
          </View>

          {/* Feature Pills */}
          <View style={styles.featuresContainer}>
            <View style={styles.featurePill}>
              <Ionicons name="people" size={16} color={colors.primary.main} />
              <Text style={styles.featureText}>Supportive Community</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="shield-checkmark" size={16} color={colors.accent.green} />
              <Text style={styles.featureText}>Safe Space</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="chatbubbles" size={16} color={colors.accent.blue} />
              <Text style={styles.featureText}>Share & Connect</Text>
            </View>
          </View>

          {/* Sign In Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {!isSignUp && (
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.emailButton]}
              onPress={() => handleEmailAuth(isSignUp)}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.emailButtonText]}>
                {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
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

          {/* Sign In Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={() => handleSignIn('google')}
            >
              <Text style={styles.buttonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Notice */}
          <Text style={styles.privacyText}>
            Your privacy is our priority. We'll never share your health information.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 3,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.ui.lavender,
    opacity: 0.2,
    top: -10,
    left: -10,
    zIndex: 1,
  },
  decorativeCircleSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent.blue,
    opacity: 0.15,
    top: 20,
    right: -20,
    zIndex: 2,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text.primary.dark,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.ui.muted.dark,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.ui.muted.light,
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: colors.text.primary.dark,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    marginBottom: 24,
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
  forgotPassword: {
    color: colors.primary.main,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  emailButton: {
    backgroundColor: colors.primary.main,
  },
  googleButton: {
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.ui.muted.light,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary.dark,
  },
  emailButtonText: {
    color: colors.background.light,
  },
  toggleButton: {
    padding: 16,
  },
  toggleButtonText: {
    color: colors.primary.main,
    fontSize: 14,
    textAlign: 'center',
  },
  privacyText: {
    fontSize: 12,
    color: colors.ui.muted.dark,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
  },
});
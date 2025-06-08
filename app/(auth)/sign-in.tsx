import { Ionicons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
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

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignIn = async (provider: 'google') => {
    try {
      const redirectUrl = makeRedirectUri({
        path: '/(auth)/sign-in',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === 'success') {
          const { url } = result;
          await supabase.auth.setSession({
            access_token: url.split('#')[1].split('&')[0].split('=')[1],
            refresh_token: url.split('#')[1].split('&')[1].split('=')[1],
          });
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  const handleEmailAuth = async () => {
    try {
      setLoading(true);
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Error with email auth:', error);
      alert(error.message);
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
              onPress={handleEmailAuth}
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
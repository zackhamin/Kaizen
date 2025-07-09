import { supabase } from '@/lib/supabase';
import { registerPushNotifications } from '@/utils/registerPushNotifications';
import { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Auth context interface - simplified
interface AuthContextType {
  // Essential data
  user: User | null;
  session: Session | null;
  
  // Essential actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Simplified auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();

  // Initialize auth state
  useEffect(() => {
    console.log('AuthProvider: Initializing auth state...');
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('AuthProvider: Found existing session for:', session.user.email);
          setSession(session);
          setUser(session.user);
        } else {
          console.log('AuthProvider: No existing session found');
        }
      } catch (error) {
        console.error('AuthProvider: Error during initialization:', error);
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email);
        
        switch (event) {
          case 'SIGNED_IN':
            setSession(session);
            setUser(session?.user || null);
            break;
            
          case 'SIGNED_OUT':
            // Clear React Query cache when user signs out
            console.log('Clearing React Query cache on sign out...');
            queryClient.clear();
            setSession(null);
            setUser(null);
            break;
            
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            setSession(session);
            setUser(session?.user || null);
            break;
            
          default:
            console.log('AuthProvider: Unhandled auth event:', event);
        }
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    if(user) {
      const getToken = async () => {
        const token = await registerPushNotifications();
        console.log('AuthProvider: Push notification token:', token);
      };
      getToken();
    }
  }, [user]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('AuthProvider: Sign in error:', error);
      return { error };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('AuthProvider: Sign up error:', error);
      return { error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('AuthProvider: Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthProvider: Sign out error:', error);
        throw error;
      }
      
      // State will be updated by the auth state change listener
    } catch (error) {
      console.error('AuthProvider: Unexpected sign out error:', error);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      console.error('AuthProvider: Reset password error:', error);
      return { error };
    }
  };

  // Context value - simplified
  const value: AuthContextType = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Default export for Expo Router
export default AuthProvider; 
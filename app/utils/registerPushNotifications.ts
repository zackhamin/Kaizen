import { supabase } from '@/lib/supabase';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

/**
 * Registers the device for Expo push notifications, retrieves the Expo push token,
 * and updates the current user's profile in Supabase with the token (fcm_token column).
 * Returns the Expo push token, or null if registration fails or user is not logged in.
 */
export const registerPushNotifications = async (): Promise<string | null> => {
  try {
    if (!Device.isDevice) {
      alert('Must use physical device for Push Notifications');
      return null;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return null;
    }
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenData.data;
    if (!expoPushToken) return null;

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('registerPushNotifications: Error fetching user:', userError);
      return expoPushToken;
    }
    if (!user) return expoPushToken;

    // Update profile with token
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ fcm_token: expoPushToken })
      .eq('id', user.id);
    if (updateError) {
      console.error('registerPushNotifications: Error updating profile:', updateError);
    }
    return expoPushToken;
  } catch (error) {
    console.error('registerPushNotifications: Unexpected error:', error);
    return null;
  }
};

export default registerPushNotifications;
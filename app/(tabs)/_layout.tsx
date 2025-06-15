import { SOSModal } from '@/components/Modals';
import { colors } from '@/constants/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const [sosModalVisible, setSosModalVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent.copper,
          tabBarInactiveTintColor: colors.accent.steel,
          tabBarStyle: {  
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            backgroundColor: colors.primary.dark,
            position: 'absolute',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="pods"
          options={{
            title: 'Pods',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />

        {/* SOS Button - Custom tab button that shows modal */}
        <Tabs.Screen
          name="create-placeholder"
          options={{
            title: '',
            tabBarButton: () => (
              <TouchableOpacity
                onPress={() => setSosModalVisible(true)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: -20,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: colors.error.main,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: colors.text.primary.dark,
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.5,
                    elevation: 8,
                  }}
                >
                  <MaterialIcons name="sos" size={28} color={colors.background.light} />
                </View>
              </TouchableOpacity>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setSosModalVisible(true);
            },
          }}
        />

        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="mail" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="about"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* SOS Modal */}
      <SOSModal 
        visible={sosModalVisible} 
        onClose={() => setSosModalVisible(false)} 
      />
    </>
  );
}
import React, { useState } from 'react';
import { Alert, Linking, Modal, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    FadeIn,
    runOnJS,
    SlideInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { emergencyServices } from './support-services';
import { EmergencyService, SizeConfig, USASOSModalProps } from './types';


const AnimatedPressable = Animated.createAnimatedComponent(View);

const USASOSModal: React.FC<USASOSModalProps> = ({
  visible,
  onClose,
  theme = 'light',
  size = 'medium',
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Size configurations
  const sizeConfig: Record<string, SizeConfig> = {
    small: { fontSize: 14, buttonHeight: 44, spacing: 12, padding: 16 },
    medium: { fontSize: 16, buttonHeight: 48, spacing: 16, padding: 20 },
    large: { fontSize: 18, buttonHeight: 52, spacing: 20, padding: 24 }
  };

  const config = sizeConfig[size];

  // Theme colors
  const colors = theme === 'dark' ? {
    background: '#1A1A1A',
    cardBackground: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#404040',
    overlay: 'rgba(0,0,0,0.8)',
  } : {
    background: '#FFFFFF',
    cardBackground: '#FAFAFA',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
    overlay: 'rgba(0,0,0,0.5)',
  };

  const handleCall = async (number: string, name: string) => {
    try {
      const phoneNumber = number.includes('741741') 
        ? `sms:741741&body=HOME` // For texting Crisis Text Line
        : `tel:${number}`;
      
      const canOpen = await Linking.canOpenURL(phoneNumber);
      
      if (canOpen) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert(
          'Unable to Call',
          `Please dial ${number} manually`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Unable to call ${name}. Please dial ${number} manually.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const ServiceButton: React.FC<{ service: EmergencyService }> = ({ service }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const tapGesture = Gesture.Tap()
      .onBegin(() => {
        scale.value = withSpring(0.95);
        opacity.value = withTiming(0.8);
      })
      .onEnd(() => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
        runOnJS(handleCall)(service.number, service.name);
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <GestureDetector gesture={tapGesture}>
        <AnimatedPressable
          style={[
            styles.serviceButton,
            {
              backgroundColor: colors.cardBackground,
              borderColor: service.color,
              borderWidth: 2,
              height: config.buttonHeight + 20,
              marginBottom: config.spacing,
              padding: config.padding - 4,
            },
            animatedStyle
          ]}
        >
          <View style={styles.serviceContent}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { 
                  color: colors.text,
                  fontSize: config.fontSize 
                }]}>
                  {service.name}
                </Text>
                <Text style={[styles.serviceNumber, { 
                  color: service.color,
                  fontSize: config.fontSize + 2 
                }]}>
                  {service.number}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: service.color }]}>
                <Text style={styles.priorityText}>
                  {service.priority === 'high' ? '🔴' : service.priority === 'medium' ? '🟡' : '🟢'}
                </Text>
              </View>
            </View>
            <Text style={[styles.serviceDescription, { 
              color: colors.textSecondary,
              fontSize: config.fontSize - 2 
            }]}>
              {service.description}
            </Text>
          </View>
        </AnimatedPressable>
      </GestureDetector>
    );
  };

  const crisisServices = emergencyServices.filter(s => s.category === 'crisis');
  const specializedServices = emergencyServices.filter(s => s.category === 'specialized');
  const supportServices = emergencyServices.filter(s => s.category === 'support');

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        entering={FadeIn.duration(200)}
      >
        <GestureDetector gesture={Gesture.Tap().onEnd(() => runOnJS(handleClose)())}>
          <View style={styles.overlayTouchable} />
        </GestureDetector>
        
        <Animated.View 
          style={[styles.modal, { 
            backgroundColor: colors.background,
            padding: config.padding 
          }]}
          entering={SlideInUp.duration(300).springify()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { 
              color: colors.text,
              fontSize: config.fontSize + 8 
            }]}>
              Emergency Mental Health Support
            </Text>
            <Text style={[styles.subtitle, { 
              color: colors.textSecondary,
              fontSize: config.fontSize - 2 
            }]}>
              🇺🇸 United States Crisis Resources
            </Text>
          </View>

          {/* Crisis Services */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { 
              color: colors.text,
              fontSize: config.fontSize + 2 
            }]}>
              🆘 Immediate Crisis Support
            </Text>
            {crisisServices.map((service) => (
              <ServiceButton key={service.number} service={service} />
            ))}
          </View>

          {/* Specialized Services */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { 
              color: colors.text,
              fontSize: config.fontSize + 2 
            }]}>
              🎯 Specialized Support
            </Text>
            {specializedServices.map((service) => (
              <ServiceButton key={service.number} service={service} />
            ))}
          </View>

          {/* Support Services */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { 
              color: colors.text,
              fontSize: config.fontSize + 2 
            }]}>
              🤝 Additional Resources
            </Text>
            {supportServices.map((service) => (
              <ServiceButton key={service.number} service={service} />
            ))}
          </View>

          {/* Important Note */}
          <View style={[styles.noteContainer, { 
            backgroundColor: colors.cardBackground,
            borderColor: colors.border 
          }]}>
            <Text style={[styles.noteText, { 
              color: colors.textSecondary,
              fontSize: config.fontSize - 3 
            }]}>
              💙 All services are FREE and available 24/7. 988 connects you with trained mental health professionals nationwide. For LGBTQ+ youth, specialized counselors are available who understand your experiences.
            </Text>
          </View>

          {/* Close Button */}
          <GestureDetector gesture={Gesture.Tap().onEnd(() => runOnJS(handleClose)())}>
            <AnimatedPressable style={[styles.closeButton, { 
              backgroundColor: colors.cardBackground,
              borderColor: colors.border 
            }]}>
              <Text style={[styles.closeButtonText, { 
                color: colors.text,
                fontSize: config.fontSize 
              }]}>
                Close
              </Text>
            </AnimatedPressable>
          </GestureDetector>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export { USASOSModal };

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  serviceButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceContent: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  serviceNumber: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
  },
  serviceDescription: {
    lineHeight: 18,
    fontWeight: '400',
  },
  noteContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  noteText: {
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  closeButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    fontWeight: '600',
  },
});

export default USASOSModal;
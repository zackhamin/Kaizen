import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { aiVoiceServices } from './ai-voice-services';
import { supportServices, youngPersonServices } from './support-services';
import { SOSModalProps, SupportService } from './types';

function SOSModal({ visible, onClose }: SOSModalProps) {
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);

  const handleCall = async (phone: string, serviceName: string) => {
    try {
      const phoneUrl = `tel:${phone}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone calls on this device');
      }
    } catch (error) {
      Alert.alert('Error', `Unable to call ${serviceName}`);
    }
  };

  const renderServiceCard = (service: SupportService, isAIService = false) => (
    <TouchableOpacity
      key={`${service.name}-${service.phone}`}
      style={[
        styles.serviceCard,
        service.urgent && styles.urgentServiceCard,
        isAIService && styles.aiServiceCard
      ]}
      onPress={() => handleCall(service.phone, service.name)}
      activeOpacity={0.7}
    >
      <View style={styles.serviceHeader}>
        <View style={[
          styles.serviceIconContainer,
          isAIService && styles.aiServiceIconContainer
        ]}>
          <Ionicons 
            name={service.icon} 
            size={24} 
            color={
              isAIService 
                ? colors.accent.white 
                : service.urgent 
                  ? colors.background.light 
                  : colors.primary.main
            } 
          />
        </View>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceNameRow}>
            <Text style={[
              styles.serviceName,
              service.urgent && styles.urgentServiceName,
              isAIService && styles.aiServiceName
            ]}>
              {service.name}
            </Text>
            {isAIService && (
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={12} color={colors.accent.white} />
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            )}
            {service.specialty && (
              <View style={styles.specialtyBadge}>
                <Text style={styles.specialtyText}>{service.specialty}</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.servicePhone,
            service.urgent && styles.urgentServicePhone,
            isAIService && styles.aiServicePhone
          ]}>
            {service.phone}
          </Text>
          <Text style={[
            styles.serviceHours,
            service.urgent && styles.urgentServiceHours,
            isAIService && styles.aiServiceHours
          ]}>
            {service.hours}
          </Text>
        </View>
      </View>
      <Text style={[
        styles.serviceDescription,
        service.urgent && styles.urgentServiceDescription,
        isAIService && styles.aiServiceDescription
      ]}>
        {service.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="shield-checkmark" size={28} color={colors.error.main} />
            <Text style={styles.title}>Emergency Support</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary.light} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.emergencyNotice}>
            <Ionicons name="warning" size={20} color={colors.error.main} />
            <Text style={styles.emergencyText}>
              If you're in immediate danger, call 999
            </Text>
          </View>

          {/* AI Voice Support Section */}
          <View style={styles.aiSection}>
            <View style={styles.aiSectionHeader}>
              <Ionicons name="mic" size={20} color={colors.secondary.main} />
              <Text style={styles.aiSectionTitle}>AI Voice Support</Text>
              <View style={styles.aiSectionBadge}>
                <Ionicons name="sparkles" size={14} color={colors.accent.white} />
                <Text style={styles.aiSectionBadgeText}>24/7</Text>
              </View>
            </View>
            <Text style={styles.aiSectionDescription}>
              Instant support from our AI coaches. Just call and start talking.
            </Text>
            {aiVoiceServices.map(service => renderServiceCard(service, true))}
          </View>

          <Text style={styles.sectionTitle}>Human Support</Text>
          {supportServices
            .filter(service => service.urgent)
            .map(service => renderServiceCard(service))}

          <Text style={styles.sectionTitle}>Additional Support</Text>
          {supportServices
            .filter(service => !service.urgent)
            .map(service => renderServiceCard(service))}

          <Text style={styles.sectionTitle}>Young Person Support</Text>
          {youngPersonServices.map(service => renderServiceCard(service))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              All calls are confidential. You're not alone.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emergencyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error.main,
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    gap: 12,
  },
  emergencyText: {
    color: colors.background.light,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  
  // AI Section Styles
  aiSection: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: colors.ui.surface.light,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondary.light,
    shadowColor: colors.text.primary.light,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  aiSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary.light,
    flex: 1,
  },
  aiSectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary.main,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiSectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.white,
  },
  aiSectionDescription: {
    fontSize: 14,
    color: colors.text.secondary.light,
    marginBottom: 16,
    lineHeight: 20,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary.light,
    marginTop: 24,
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: colors.ui.surface.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ui.border.light,
    shadowColor: colors.text.primary.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  urgentServiceCard: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.dark,
  },
  aiServiceCard: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.dark,
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.ui.muted.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiServiceIconContainer: {
    backgroundColor: colors.accent.white,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary.light,
    flex: 1,
  },
  urgentServiceName: {
    color: colors.background.light,
  },
  aiServiceName: {
    color: colors.accent.white,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary.main,
  },
  specialtyBadge: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.background.light,
  },
  servicePhone: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 2,
  },
  urgentServicePhone: {
    color: colors.background.light,
  },
  aiServicePhone: {
    color: colors.accent.white,
  },
  serviceHours: {
    fontSize: 14,
    color: colors.text.secondary.light,
    fontWeight: '500',
  },
  urgentServiceHours: {
    color: colors.background.light,
    opacity: 0.9,
  },
  aiServiceHours: {
    color: colors.accent.white,
    opacity: 0.9,
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.text.secondary.light,
    lineHeight: 20,
  },
  urgentServiceDescription: {
    color: colors.background.light,
    opacity: 0.9,
  },
  aiServiceDescription: {
    color: colors.accent.white,
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 16,
    color: colors.text.secondary.light,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export { SOSModal };

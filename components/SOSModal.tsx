import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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

interface SupportService {
  name: string;
  phone: string;
  hours: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  urgent?: boolean;
  specialty?: string;
}

interface SOSModalProps {
  visible: boolean;
  onClose: () => void;
}

const supportServices: SupportService[] = [
  {
    name: 'NHS 111 Mental Health',
    phone: '111',
    hours: '24/7',
    description: 'Press option 2 for urgent mental health support',
    icon: 'medical',
    urgent: true,
  },
  {
    name: 'Samaritans',
    phone: '116 123',
    hours: '24/7',
    description: 'Free confidential emotional support for anyone',
    icon: 'heart',
    urgent: true,
  },
  {
    name: 'Crisis Text Support',
    phone: '85258',
    hours: '24/7',
    description: 'Text SHOUT for immediate crisis support',
    icon: 'chatbubble',
    specialty: 'Text Support',
  },
  {
    name: 'Mind Support',
    phone: '0300 102 1234',
    hours: '9am-6pm, Mon-Fri',
    description: 'Mental health information and support',
    icon: 'information-circle',
  },
  {
    name: 'CALM',
    phone: '0800 58 58 58',
    hours: '5pm-midnight daily',
    description: 'Support for men facing mental health challenges',
    icon: 'shield',
  },
  {
    name: 'SANEline',
    phone: '0300 304 7000',
    hours: '4:30pm-10pm daily',
    description: 'Mental health helpline and support',
    icon: 'call',
  },
];

const youngPersonServices: SupportService[] = [
  {
    name: 'Papyrus HOPELINEUK',
    phone: '0800 068 4141',
    hours: '24/7',
    description: 'Support for under 35s with suicidal feelings',
    icon: 'leaf',
    specialty: 'Under 35s',
  },
];

export default function SOSModal({ visible, onClose }: SOSModalProps) {
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

  const renderServiceCard = (service: SupportService) => (
    <TouchableOpacity
      key={service.name}
      style={[
        styles.serviceCard,
        service.urgent && styles.urgentServiceCard
      ]}
      onPress={() => handleCall(service.phone, service.name)}
      activeOpacity={0.7}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.serviceIconContainer}>
          <Ionicons 
            name={service.icon} 
            size={24} 
            color={service.urgent ? colors.background.light : colors.primary.main} 
          />
        </View>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceNameRow}>
            <Text style={[
              styles.serviceName,
              service.urgent && styles.urgentServiceName
            ]}>
              {service.name}
            </Text>
            {service.specialty && (
              <View style={styles.specialtyBadge}>
                <Text style={styles.specialtyText}>{service.specialty}</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.servicePhone,
            service.urgent && styles.urgentServicePhone
          ]}>
            {service.phone}
          </Text>
          <Text style={[
            styles.serviceHours,
            service.urgent && styles.urgentServiceHours
          ]}>
            {service.hours}
          </Text>
        </View>
      </View>
      <Text style={[
        styles.serviceDescription,
        service.urgent && styles.urgentServiceDescription
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

          <Text style={styles.sectionTitle}>Immediate Support</Text>
          {supportServices
            .filter(service => service.urgent)
            .map(renderServiceCard)}

          <Text style={styles.sectionTitle}>Additional Support</Text>
          {supportServices
            .filter(service => !service.urgent)
            .map(renderServiceCard)}

          <Text style={styles.sectionTitle}>Young Person Support</Text>
          {youngPersonServices.map(renderServiceCard)}

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
  serviceInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
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
  serviceHours: {
    fontSize: 14,
    color: colors.text.secondary.light,
    fontWeight: '500',
  },
  urgentServiceHours: {
    color: colors.background.light,
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
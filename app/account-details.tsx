  import { StackScreen } from '@/components/Layout/StackScreen';
import { colors, theme } from '@/constants/theme';
import { useCurrentUser, useSetAlias, useUpdateProfile } from '@/hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AccountDetailsScreen() {
  const router = useRouter();
  const { data: user, isLoading, error } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const setAliasMutation = useSetAlias();
  
  // State for editing different fields
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    username: '',
    full_name: '',
    alias: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize edit values when user data loads
  useEffect(() => {
    if (user) {
      setEditValues({
        username: user.username || '',
        full_name: user.full_name || '',
        alias: user.alias || '',
      });
    }
  }, [user]);

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleSave = async (field: string) => {
    const value = editValues[field as keyof typeof editValues].trim();
    
    if (!value) {
      const fieldLabel = field === 'full_name' ? 'Full name' : field === 'alias' ? 'Username' : field.charAt(0).toUpperCase() + field.slice(1);
      Alert.alert('Error', `${fieldLabel} cannot be empty`);
      return;
    }

    setIsSaving(true);
    try {
      if (field === 'alias') {
        await setAliasMutation.mutateAsync(value);
      } else {
        await updateProfileMutation.mutateAsync({ [field]: value });
      }
      setEditingField(null);
      const fieldLabel = field === 'full_name' ? 'Full name' : field === 'alias' ? 'Username' : field.charAt(0).toUpperCase() + field.slice(1);
      Alert.alert('Success', `${fieldLabel} updated successfully`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (field: string) => {
    // Reset to original value
    if (user) {
      setEditValues(prev => ({
        ...prev,
        [field]: user[field as keyof typeof user] || '',
      }));
    }
    setEditingField(null);
  };

  const renderEditableField = (field: string, label: string, value: string) => {
    const isEditing = editingField === field;
    const currentValue = editValues[field as keyof typeof editValues];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{label}</Text>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={currentValue}
              onChangeText={(text) => setEditValues(prev => ({ ...prev, [field]: text }))}
              placeholder={`Enter ${label.toLowerCase()}`}
              placeholderTextColor={colors.glass.text.placeholder}
              autoFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={() => handleSave(field)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.accent.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => handleCancel(field)}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.displayContainer}>
            <Text style={styles.displayValue}>{value || 'Not set'}</Text>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => handleEdit(field)}
            >
              <Ionicons name="pencil" size={20} color={colors.accent.copper} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <StackScreen title="Account Details">
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent.copper} />
        </View>
      </StackScreen>
    );
  }

  if (error || !user) {
    return (
      <StackScreen title="Account Details">
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load user info.</Text>
        </View>
      </StackScreen>
    );
  }

  return (
    <StackScreen title="Account Details">
      <View style={styles.container}>
        {/* Account Details Card */}
        <View style={styles.detailsCard}>


          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email</Text>
            <Text style={styles.displayValue}>{user.email}</Text>
          </View>

          <View style={styles.divider} />

          {renderEditableField('full_name', 'Full Name', user.full_name || '')}

          <View style={styles.divider} />

          {renderEditableField('alias', 'Username', user.alias || '')}

          {user.bio && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bio</Text>
                <Text style={styles.displayValue}>{user.bio}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },

  detailsCard: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    paddingVertical: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.glass.text.secondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  displayValue: {
    fontSize: 16,
    color: colors.glass.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  editIcon: {
    padding: theme.spacing.sm,
  },
  editContainer: {
    gap: theme.spacing.md,
  },
  input: {
    backgroundColor: colors.glass.overlay,
    color: colors.glass.text.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.glass.conversationBorder,
  },
  editButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  editButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.accent.copper,
  },
  cancelButton: {
    backgroundColor: colors.glass.buttonDisabled,
  },
  saveButtonText: {
    color: colors.accent.white,
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButtonText: {
    color: colors.glass.text.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glass.overlayBorder,
    marginHorizontal: theme.spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error.main,
    fontSize: 16,
    textAlign: 'center',
  },
}); 
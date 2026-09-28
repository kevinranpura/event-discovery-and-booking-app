import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { PrimaryButton } from '../../components/PrimaryButton';
import { InputField } from '../../components/InputField';
import { COLORS } from '../../constants';

import { showConfirmDialog } from '../../utils/alertPolyfill';

export default function ProfileScreen() {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const [editVisible, setEditVisible] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [nameError, setNameError] = useState('');
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    showConfirmDialog(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        try {
          await logout();
          router.replace('/(auth)/login');
        } catch (err: any) {
          Alert.alert('Error', err.message);
        }
      },
      'Sign Out'
    );
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    try {
      await updateProfile({ name: name.trim(), mobile: mobile.trim() });
      setEditVisible(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline' as const,
          label: 'Edit Profile',
          onPress: () => setEditVisible(true),
        },
        {
          icon: 'ticket-outline' as const,
          label: 'My Bookings',
          onPress: () => router.push('/(tabs)/bookings'),
        },
        {
          icon: 'heart-outline' as const,
          label: 'Saved Events',
          onPress: () => router.push('/(tabs)/favorites'),
        },
        {
          icon: 'notifications-outline' as const,
          label: 'Notifications',
          onPress: () => router.push('/notifications'),
        },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        {
          icon: 'help-circle-outline' as const,
          label: 'Help Center',
          onPress: () => Alert.alert('Help', 'Contact our support team at support@eventify.com'),
        },
        {
          icon: 'document-text-outline' as const,
          label: 'Terms of Service',
          onPress: () => {},
        },
        {
          icon: 'shield-checkmark-outline' as const,
          label: 'Privacy Policy',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setEditVisible(true)}
              style={styles.editAvatarBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={13} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  user?.role === 'organizer' ? COLORS.warningLight : COLORS.primaryLight,
              },
            ]}
          >
            <Ionicons
              name={user?.role === 'organizer' ? 'shield-checkmark' : 'person'}
              size={13}
              color={user?.role === 'organizer' ? COLORS.warning : COLORS.primary}
            />
            <Text
              style={[
                styles.roleText,
                { color: user?.role === 'organizer' ? COLORS.warning : COLORS.primary },
              ]}
            >
              {user?.role === 'organizer' ? 'Event Organizer' : 'Event Attendee'}
            </Text>
          </View>
        </View>

        {/* Member Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <Text style={styles.statValue}>
              {user?.created_at ? new Date(user.created_at).getFullYear().toString() : '2026'}
            </Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="call-outline" size={18} color={COLORS.primary} />
            <Text style={styles.statValue} numberOfLines={1}>
              {user?.mobile || 'Not added'}
            </Text>
            <Text style={styles.statLabel}>Mobile</Text>
          </View>
        </View>

        {/* Organizer Switch Banner (if organizer) */}
        {user?.role === 'organizer' && (
          <TouchableOpacity
            onPress={() => router.push('/organizer/dashboard')}
            style={styles.organizerBtn}
            activeOpacity={0.88}
          >
            <View style={styles.organizerIconCircle}>
              <Ionicons name="grid-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.organizerBtnTitle}>Organizer Dashboard</Text>
              <Text style={styles.organizerBtnSub}>Manage events, stats & attendees</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    onPress={item.onPress}
                    style={styles.menuItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconBg}>
                        <Ionicons name={item.icon} size={18} color={COLORS.primary} />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textDim} />
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && <View style={styles.menuDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconBg}>
                  <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.menuLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={notifications ? COLORS.primary : COLORS.textDim}
              />
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <PrimaryButton
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            icon={<Ionicons name="log-out-outline" size={18} color={COLORS.primary} />}
          />
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <InputField
                label="Full Name"
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setNameError('');
                }}
                placeholder="Enter full name"
                leftIcon="person-outline"
                error={nameError}
              />
              <InputField
                label="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                placeholder="+1 (555) 000-0000"
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />
              <PrimaryButton
                title="Save Changes"
                onPress={handleSaveProfile}
                isLoading={isLoading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.text,
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  userEmail: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  organizerBtn: {
    marginHorizontal: 20,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 2,
  },
  organizerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerBtnTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  organizerBtnSub: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBg: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 62,
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
    alignItems: 'center',
  },
  version: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: {
    padding: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 32,
  },
});

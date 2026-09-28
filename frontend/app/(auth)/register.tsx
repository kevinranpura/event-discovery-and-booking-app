import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS } from '../../constants';
import { RegisterData } from '../../types';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState<RegisterData>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});

  const update = (key: keyof RegisterData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Enter a valid email';
    if (!form.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Minimum 6 characters required';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Confirm your password';
    else if (form.confirmPassword !== form.password)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;
    try {
      await register(form);
      if (form.role === 'organizer') router.replace('/organizer/dashboard');
      else router.replace('/(tabs)');
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to start discovering and booking events</Text>
          </View>

          <View style={styles.card}>
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            {/* Role Selector */}
            <Text style={styles.roleLabel}>Account Type</Text>
            <View style={styles.roleRow}>
              {(['user', 'organizer'] as const).map((role) => {
                const isActive = form.role === role;
                return (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setForm((f) => ({ ...f, role }))}
                    style={[styles.roleChip, isActive && styles.roleChipActive]}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={role === 'user' ? 'person-outline' : 'briefcase-outline'}
                      size={16}
                      color={isActive ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.roleChipText,
                        isActive && styles.roleChipTextActive,
                      ]}
                    >
                      {role === 'user' ? 'Attendee' : 'Organizer'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <InputField
              label="Full Name *"
              value={form.name}
              onChangeText={(v) => update('name', v)}
              placeholder="e.g. Alex Johnson"
              leftIcon="person-outline"
              error={errors.name}
              autoCapitalize="words"
            />
            <InputField
              label="Email Address *"
              value={form.email}
              onChangeText={(v) => update('email', v)}
              placeholder="e.g. alex@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />
            <InputField
              label="Mobile Number *"
              value={form.mobile}
              onChangeText={(v) => update('mobile', v)}
              placeholder="+1 (555) 000-0000"
              keyboardType="phone-pad"
              leftIcon="call-outline"
              error={errors.mobile}
            />
            <InputField
              label="Password *"
              value={form.password}
              onChangeText={(v) => update('password', v)}
              placeholder="Min. 6 characters"
              leftIcon="lock-closed-outline"
              isPassword
              error={errors.password}
            />
            <InputField
              label="Confirm Password *"
              value={form.confirmPassword}
              onChangeText={(v) => update('confirmPassword', v)}
              placeholder="Re-enter your password"
              leftIcon="shield-checkmark-outline"
              isPassword
              error={errors.confirmPassword}
            />

            <PrimaryButton
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              size="lg"
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  roleLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roleChipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  roleChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});

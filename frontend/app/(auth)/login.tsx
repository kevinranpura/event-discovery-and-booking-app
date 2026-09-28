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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS } from '../../constants';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;
    try {
      await login(email.trim().toLowerCase(), password);
      const { user } = useAuthStore.getState();
      if (user?.role === 'organizer') {
        router.replace('/organizer/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch { }
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
          {/* Brand Mark */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="ticket" size={28} color={COLORS.white} />
            </View>
            <Text style={styles.appName}>Eventify</Text>
            <Text style={styles.tagline}>Discover, book, and organize events</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>

            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              leftIcon="lock-closed-outline"
              isPassword
              error={errors.password}
            />

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              size="lg"
            />

            {/* Quick Demo Credentials */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Quick Fill Test Accounts</Text>
              <View style={styles.demoRow}>
                <TouchableOpacity
                  onPress={() => {
                    setEmail('user@example.com');
                    setPassword('password123');
                  }}
                  style={styles.demoChip}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.demoChipText}>Attendee</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setEmail('organizer@example.com');
                    setPassword('password123');
                  }}
                  style={styles.demoChip}
                  activeOpacity={0.8}
                >
                  <Ionicons name="briefcase-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.demoChipText}>Organizer</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerLink}>Create account</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  welcomeTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 20,
    marginTop: 2,
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
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    alignItems: 'center',
  },
  demoTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  demoChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});

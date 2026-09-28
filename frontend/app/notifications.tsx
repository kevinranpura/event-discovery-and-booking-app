import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNotificationsStore } from '../store/bookingsStore';
import { NotificationCard } from '../components/NotificationCard';
import { EmptyState, LoadingIndicator } from '../components/LoadingIndicator';
import { COLORS } from '../constants';
import { Notification } from '../types';

export default function NotificationsScreen() {
  const { notifications, unreadCount, isLoading, fetchNotifications, markRead, markAllRead } = useNotificationsStore();

  useEffect(() => { fetchNotifications(); }, []);

  if (isLoading && notifications.length === 0) return <LoadingIndicator fullScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationCard notification={item} onPress={(n: Notification) => { if (!n.is_read) markRead(n.id); }} />
        )}
        contentContainerStyle={[styles.listContent, notifications.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="notifications-outline" title="No Notifications Yet" message="You'll receive booking confirmations and event reminders here." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  titleSection: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  unreadBadge: { backgroundColor: COLORS.primary, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  unreadBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  markAllBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: COLORS.primary + '15' },
  markAllText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  listContent: { padding: 20, flexGrow: 1 },
});

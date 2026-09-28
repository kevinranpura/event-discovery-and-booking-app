import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useEventsStore } from '../../store/eventsStore';
import { organizerService } from '../../services/bookingsService';
import { LoadingIndicator, EmptyState } from '../../components/LoadingIndicator';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS, CATEGORY_COLORS } from '../../constants';
import { formatDate, formatPrice } from '../../utils/helpers';
import { Event } from '../../types';
import { showConfirmDialog } from '../../utils/alertPolyfill';

interface DashboardStats {
  total_events?: number;
  totalEvents?: number;
  upcoming_events?: number;
  upcomingEvents?: number;
  total_bookings?: number;
  totalBookings?: number;
  total_attendees?: number;
  totalAttendees?: number;
  total_revenue?: number;
  totalRevenue?: number;
}

export default function OrganizerDashboard() {
  const { user, logout, loadUser } = useAuthStore();
  const { events, isLoading, fetchEvents, deleteEvent } = useEventsStore();
  const [organizerEvents, setOrganizerEvents] = useState<Event[] | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [dashRes, orgEventsRes] = await Promise.all([
        organizerService.getDashboard(),
        organizerService.getOrganizerEvents(),
        fetchEvents(),
        loadUser(),
      ]);
      if (dashRes?.data?.stats) setStats(dashRes.data.stats);
      const fetched = orgEventsRes?.data?.data?.events || orgEventsRes?.data?.events;
      if (fetched) setOrganizerEvents(fetched);
    } catch {
      await fetchEvents();
    }
  }, [fetchEvents, loadUser]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleDelete = (event: Event) => {
    showConfirmDialog(
      'Delete Event',
      `Are you sure you want to delete "${event.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteEvent(event.id);
          setOrganizerEvents((prev) => (prev ? prev.filter((e) => e.id !== event.id) : null));
          await loadData();
        } catch (err: any) {
          Alert.alert('Error', err.message);
        }
      },
      'Delete'
    );
  };

  const handleLogout = () => {
    showConfirmDialog(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        await logout();
        router.replace('/(auth)/login');
      },
      'Sign Out'
    );
  };

  const displayEvents = organizerEvents || events;

  const statCards = stats ? [
    { label: 'Total Events', value: stats.totalEvents ?? stats.total_events ?? 0, iconName: 'calendar', color: COLORS.primary },
    { label: 'Upcoming', value: stats.upcomingEvents ?? stats.upcoming_events ?? 0, iconName: 'time', color: COLORS.success },
    { label: 'Total Bookings', value: stats.totalBookings ?? stats.total_bookings ?? 0, iconName: 'ticket', color: COLORS.warning },
    { label: 'Revenue', value: `₹${Math.round(parseFloat(String(stats.totalRevenue ?? stats.total_revenue ?? 0))).toLocaleString('en-IN')}`, iconName: 'wallet', color: '#10B981' },
  ] : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Organizer Dashboard</Text>
          <Text style={styles.orgName}>{user?.name?.split(' ')[0] || 'Aryan'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={displayEvents}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListHeaderComponent={
          <View>
            {/* Stats */}
            {stats && (
              <View style={styles.statsGrid}>
                {statCards.map((stat, i) => (
                  <View key={i} style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                      <Ionicons name={stat.iconName as any} size={20} color={stat.color} />
                    </View>
                    <Text style={[styles.statValue, { color: COLORS.text }]}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.createBtnSection}>
              <PrimaryButton
                title="Create New Event"
                onPress={() => router.push('/organizer/create-event')}
                size="md"
                icon={<Ionicons name="add-circle-outline" size={18} color={COLORS.white} />}
              />
            </View>
            <Text style={styles.sectionTitle}>Your Events ({displayEvents.length})</Text>
          </View>
        }
        renderItem={({ item }) => {
          const catColor = CATEGORY_COLORS[item.category] || COLORS.primary;
          return (
            <View style={styles.eventCard}>
              <View style={[styles.eventStrip, { backgroundColor: catColor }]} />
              <View style={styles.eventContent}>
                <View style={styles.eventRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventName} numberOfLines={2}>{item.name}</Text>
                    <View style={[styles.catBadge, { backgroundColor: catColor + '15', borderColor: catColor + '30' }]}>
                      <Text style={[styles.catText, { color: catColor }]}>{item.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.eventPrice}>{formatPrice(item.ticket_price)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                  <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.metaText} numberOfLines={1}>{item.venue}</Text>
                </View>
                <View style={styles.seatsRow}>
                  <Text style={styles.seatsText}>
                    <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{item.available_seats}</Text>
                    /{item.total_seats} seats left
                  </Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/organizer/attendees', params: { eventId: item.id.toString(), eventName: item.name } } as any)} style={styles.actionBtn}>
                    <Ionicons name="people-outline" size={15} color={COLORS.primary} />
                    <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Attendees</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/organizer/create-event', params: { eventId: item.id.toString() } } as any)} style={styles.actionBtn}>
                    <Ionicons name="pencil-outline" size={15} color={COLORS.warning} />
                    <Text style={[styles.actionBtnText, { color: COLORS.warning }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)} style={[styles.actionBtn, { borderColor: COLORS.error + '40', backgroundColor: COLORS.error + '10' }]}>
                    <Ionicons name="trash-outline" size={15} color={COLORS.error} />
                    <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="calendar-outline"
              title="No Events Yet"
              message="Create your first event to start accepting bookings and selling tickets."
              action={<PrimaryButton title="Create Event" onPress={() => router.push('/organizer/create-event')} />}
            />
          ) : <LoadingIndicator message="Loading events..." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  welcomeText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  orgName: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginTop: 16, marginBottom: 20 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', fontWeight: '500' },
  createBtnSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 12 },
  listContent: { paddingBottom: 32, flexGrow: 1 },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  eventStrip: { width: 5 },
  eventContent: { flex: 1, padding: 14 },
  eventRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  eventName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 5 },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  catText: { fontSize: 11, fontWeight: '700' },
  eventPrice: { color: COLORS.primary, fontSize: 15, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  metaText: { color: COLORS.textMuted, fontSize: 12, flex: 1 },
  seatsRow: { marginBottom: 10 },
  seatsText: { color: COLORS.textMuted, fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
});

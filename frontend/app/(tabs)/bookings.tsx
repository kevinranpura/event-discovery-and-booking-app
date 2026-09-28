import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingsStore } from '../../store/bookingsStore';
import { BookingCard } from '../../components/BookingCard';
import { EmptyState, LoadingIndicator } from '../../components/LoadingIndicator';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS } from '../../constants';
import { router } from 'expo-router';
import { showConfirmDialog } from '../../utils/alertPolyfill';

const TABS = ['Upcoming', 'Completed', 'Cancelled'] as const;
type TabType = typeof TABS[number];

export default function BookingsScreen() {
  const { bookings, isLoading, fetchBookings, cancelBooking } = useBookingsStore();
  const [activeTab, setActiveTab] = useState<TabType>('Upcoming');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, []);

  const handleCancel = (id: number) => {
    showConfirmDialog(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      async () => {
        try {
          await cancelBooking(id);
          Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
        } catch (err: any) {
          Alert.alert('Error', err.message || 'Failed to cancel booking.');
        }
      },
      'Yes, Cancel'
    );
  };

  const filteredBookings = bookings.filter((b) => {
    const isPast = b.event_date ? new Date(b.event_date) < new Date() : false;
    if (activeTab === 'Upcoming') {
      return (b.status === 'confirmed' || b.status === 'pending') && !isPast;
    }
    if (activeTab === 'Completed') {
      return b.status === 'completed' || (b.status === 'confirmed' && isPast);
    }
    if (activeTab === 'Cancelled') {
      return b.status === 'cancelled';
    }
    return false;
  });

  const emptyMessages: Record<TabType, { iconName: string; title: string; msg: string }> = {
    Upcoming: {
      iconName: 'ticket-outline',
      title: 'No Upcoming Bookings',
      msg: 'Your booked event tickets will appear here with barcodes and status details.',
    },
    Completed: {
      iconName: 'checkmark-done-circle-outline',
      title: 'No Completed Events',
      msg: 'Events you have previously attended will be shown here.',
    },
    Cancelled: {
      iconName: 'close-circle-outline',
      title: 'No Cancelled Bookings',
      msg: 'Any cancelled event bookings will be listed here.',
    },
  };

  const empty = emptyMessages[activeTab];

  if (isLoading && bookings.length === 0) {
    return <LoadingIndicator fullScreen message="Loading bookings..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      {/* Segmented Tab Bar */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const count = bookings.filter((b) => {
              const isPast = b.event_date ? new Date(b.event_date) < new Date() : false;
              if (tab === 'Upcoming') return (b.status === 'confirmed' || b.status === 'pending') && !isPast;
              if (tab === 'Completed') return b.status === 'completed' || (b.status === 'confirmed' && isPast);
              if (tab === 'Cancelled') return b.status === 'cancelled';
              return false;
            }).length;
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, isActive && styles.tabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onCancel={item.status === 'confirmed' ? handleCancel : undefined}
          />
        )}
        contentContainerStyle={[styles.listContent, filteredBookings.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            iconName={empty.iconName as any}
            title={empty.title}
            message={empty.msg}
            action={
              activeTab === 'Upcoming' ? (
                <PrimaryButton
                  title="Explore Events"
                  onPress={() => router.push('/(tabs)/explore')}
                />
              ) : undefined
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabBadgeText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  tabBadgeTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});

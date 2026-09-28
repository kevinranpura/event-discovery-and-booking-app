import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { organizerService } from '../../services/bookingsService';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState, LoadingIndicator } from '../../components/LoadingIndicator';
import { COLORS, STATUS_COLORS } from '../../constants';
import { formatDate, formatCurrency } from '../../utils/helpers';

export default function AttendeesScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [attendees, setAttendees] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAttendees();
  }, [eventId]);

  const loadAttendees = async (search?: string) => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const res = await organizerService.getAttendees(parseInt(eventId), search);
      setAttendees(res.data.attendees);
      setEvent(res.data.event);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAttendees(searchText);
    setRefreshing(false);
  }, [searchText]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    loadAttendees(text);
  };

  const totalAttendees = attendees.filter((a) => a.status !== 'cancelled').reduce((sum, a) => sum + a.quantity, 0);
  const totalRevenue = attendees.filter((a) => a.status !== 'cancelled').reduce((sum, a) => sum + parseFloat(a.total_amount), 0);

  if (isLoading && attendees.length === 0) return <LoadingIndicator fullScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{event?.name || 'Attendees'}</Text>
          <Text style={styles.headerSub}>{totalAttendees} attendees</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{attendees.length}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{totalAttendees}</Text>
          <Text style={styles.statLabel}>Attendees</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{formatCurrency(totalRevenue)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <SearchBar
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search by name or email..."
          onSubmit={() => loadAttendees(searchText)}
        />
      </View>

      {/* List */}
      <FlatList
        data={attendees}
        keyExtractor={(item) => item.booking_id.toString()}
        renderItem={({ item }) => {
          const statusColor = STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || COLORS.textMuted;
          return (
            <View style={styles.card}>
              {/* Avatar */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.attendeeName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.attendeeEmail}>{item.email}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="ticket-outline" size={11} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{item.quantity} × {item.ticket_type}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="card-outline" size={11} color={COLORS.success} />
                    <Text style={[styles.metaText, { color: COLORS.success }]}>{formatCurrency(item.total_amount)}</Text>
                  </View>
                </View>
                <Text style={styles.bookedAt}>Booked {formatDate(item.booked_at)}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={[styles.listContent, attendees.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={searchText ? 'No Results Found' : 'No Attendees Yet'}
            message={searchText
              ? `No attendees match "${searchText}"`
              : 'When people book tickets, their details will appear here.'}
          />
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  headerSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 3,
  },
  statValue: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 11 },
  searchRow: { padding: 20, paddingBottom: 10 },
  listContent: { paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  avatarText: { color: COLORS.primary, fontSize: 18, fontWeight: '800' },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  attendeeName: { color: COLORS.text, fontSize: 14, fontWeight: '700', flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  attendeeEmail: { color: COLORS.textMuted, fontSize: 12, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', gap: 14, marginBottom: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textMuted, fontSize: 11 },
  bookedAt: { color: COLORS.textDim, fontSize: 11 },
});

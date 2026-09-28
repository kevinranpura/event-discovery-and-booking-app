import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types';
import { COLORS, STATUS_COLORS } from '../constants';
import { formatDate, formatTime, formatCurrency, generateBookingId } from '../utils/helpers';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: number) => void;
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const statusColor = STATUS_COLORS[booking.status] || COLORS.textMuted;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/booking/${booking.id}` as any)}
      activeOpacity={0.88}
      style={styles.card}
    >
      {/* Status strip */}
      <View style={[styles.strip, { backgroundColor: statusColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eventName} numberOfLines={1}>{booking.event_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.bookingId}>{generateBookingId(booking.id)}</Text>

        <View style={styles.metaGrid}>
          {booking.event_date && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{formatDate(booking.event_date)}</Text>
            </View>
          )}
          {booking.start_time && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{formatTime(booking.start_time)}</Text>
            </View>
          )}
          {booking.venue && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>{booking.venue}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="ticket-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{booking.quantity} × {booking.ticket_type}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.total}>{formatCurrency(booking.total_amount)}</Text>
          <View style={styles.actions}>
            {onCancel && booking.status === 'confirmed' && (
              <TouchableOpacity
                onPress={() => onCancel(booking.id)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => router.push(`/booking/${booking.id}` as any)}
              style={styles.viewBtn}
            >
              <Text style={styles.viewText}>View Ticket</Text>
              <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  strip: { width: 4 },
  content: { flex: 1, padding: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
    gap: 8,
  },
  eventName: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: '700' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  bookingId: { color: COLORS.textDim, fontSize: 11, fontWeight: '500', marginBottom: 10 },
  metaGrid: { gap: 6, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: COLORS.textMuted, fontSize: 12, flex: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  total: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.error + '25',
  },
  cancelText: { color: COLORS.error, fontSize: 12, fontWeight: '600' },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: COLORS.primaryLight,
    gap: 3,
  },
  viewText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
});

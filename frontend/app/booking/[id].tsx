import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { showConfirmDialog } from '../../utils/alertPolyfill';
import { useBookingsStore } from '../../store/bookingsStore';
import { bookingsService } from '../../services/bookingsService';
import { Booking } from '../../types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { COLORS, STATUS_COLORS } from '../../constants';
import { formatDate, formatTime, formatCurrency, generateBookingId } from '../../utils/helpers';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cancelBooking } = useBookingsStore();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await bookingsService.getBooking(parseInt(id));
      setBooking(res.data.booking);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    showConfirmDialog(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone. Refund will be processed within 3-5 business days.',
      async () => {
        try {
          await cancelBooking(parseInt(id!));
          setBooking((b) => (b ? { ...b, status: 'cancelled' } : b));
          Alert.alert('Booking Cancelled', 'Your reservation has been cancelled.');
        } catch (err: any) {
          Alert.alert('Error', err.message);
        }
      },
      'Cancel Booking'
    );
  };

  if (isLoading) return <LoadingIndicator fullScreen />;
  if (!booking) return null;

  const statusColor = STATUS_COLORS[booking.status] || COLORS.textMuted;
  const isConfirmed = booking.status === 'confirmed';
  const isFree = parseFloat(String(booking.total_amount)) === 0;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: statusColor + '15', borderColor: statusColor + '40' }]}>
            <Ionicons
              name={isConfirmed ? 'checkmark-circle' : booking.status === 'cancelled' ? 'close-circle' : 'time'}
              size={24}
              color={statusColor}
            />
            <View>
              <Text style={[styles.statusTitle, { color: statusColor }]}>
                {booking.status === 'confirmed' ? 'Booking Confirmed' : booking.status === 'cancelled' ? 'Booking Cancelled' : 'Booking Pending'}
              </Text>
              <Text style={styles.bookingId}>{generateBookingId(booking.id)}</Text>
            </View>
          </View>

          {/* Digital Ticket */}
          <View style={styles.ticket}>
            {booking.event_image && (
              <Image source={{ uri: booking.event_image }} style={styles.ticketBanner} resizeMode="cover" />
            )}
            <View style={styles.ticketBody}>
              <Text style={styles.ticketEventName}>{booking.event_name}</Text>

              <View style={styles.divider} />

              {[
                { icon: 'calendar-outline', label: 'Date', value: formatDate(booking.event_date || '') },
                { icon: 'time-outline', label: 'Time', value: formatTime(booking.start_time || '') },
                { icon: 'location-outline', label: 'Venue', value: booking.venue || '' },
                { icon: 'ticket-outline', label: 'Tickets', value: `${booking.quantity} × ${booking.ticket_type}` },
                { icon: 'person-outline', label: 'Attendee', value: booking.user_name || 'You' },
              ].map((item, i) => (
                <View key={i} style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <Ionicons name={item.icon as any} size={15} color={COLORS.textMuted} />
                    <Text style={styles.infoLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.infoValue} numberOfLines={2}>{item.value}</Text>
                </View>
              ))}

              <View style={styles.divider} />

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total {isFree ? '' : 'Paid'}</Text>
                <Text style={styles.totalValue}>{isFree ? 'Free' : formatCurrency(booking.total_amount)}</Text>
              </View>

              {/* Real QR Code Pass */}
              {isConfirmed && (
                <View style={styles.qrSection}>
                  <View style={styles.qrCard}>
                    <View style={styles.qrContainer}>
                      <Image
                        source={{
                          uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                            `EVENTIFY:${generateBookingId(booking.id)}:${booking.event_name}:${booking.user_name || 'Attendee'}`
                          )}&color=0F172A&bgcolor=FFFFFF&margin=0`,
                        }}
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                      {/* Corner Targeting Accents */}
                      <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
                      <View style={[styles.cornerBracket, styles.bracketTopRight]} />
                      <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
                      <View style={[styles.cornerBracket, styles.bracketBottomRight]} />
                    </View>
                    <Text style={styles.qrCodeText}>{generateBookingId(booking.id)}</Text>
                  </View>
                  <View style={styles.qrInfoBadge}>
                    <Ionicons name="scan-outline" size={15} color={COLORS.primary} />
                    <Text style={styles.qrLabel}>Scan this pass for instant gate entry</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          {isConfirmed && (
            <PrimaryButton
              title="Cancel Booking"
              onPress={() => handleCancel()}
              variant="danger"
              icon={<Ionicons name="close-circle-outline" size={18} color={COLORS.white} />}
            />
          )}
          <PrimaryButton
            title="Back to Bookings"
            onPress={() => router.push('/(tabs)/bookings')}
            variant="outline"
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusTitle: { fontSize: 15, fontWeight: '700' },
  bookingId: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500', marginTop: 2 },
  ticket: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ticketBanner: { width: '100%', height: 150 },
  ticketBody: { padding: 20 },
  ticketEventName: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  infoLabel: { color: COLORS.textMuted, fontSize: 13 },
  infoValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  totalValue: { color: COLORS.primary, fontSize: 22, fontWeight: '800' },
  qrSection: { alignItems: 'center', gap: 14, marginTop: 20 },
  qrCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  qrContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  qrImage: {
    width: 140,
    height: 140,
  },
  cornerBracket: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: COLORS.primary,
  },
  bracketTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  bracketTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  bracketBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  bracketBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  qrCodeText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  qrInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
  },
  qrLabel: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
});

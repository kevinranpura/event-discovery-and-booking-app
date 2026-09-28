import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useEventsStore } from '../../store/eventsStore';
import { useBookingsStore } from '../../store/bookingsStore';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { COLORS, TICKET_TYPES } from '../../constants';
import { formatDate, formatTime, formatPrice, calculateTotal, generateBookingId } from '../../utils/helpers';

export default function BookingScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { selectedEvent, fetchEvent } = useEventsStore();
  const { createBooking, isLoading } = useBookingsStore();

  const [ticketType, setTicketType] = useState<typeof TICKET_TYPES[number]>(TICKET_TYPES[0]);
  const [quantity, setQuantity] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  useEffect(() => {
    if (eventId) fetchEvent(parseInt(eventId));
  }, [eventId]);

  const event = selectedEvent;

  if (!event) return <LoadingIndicator fullScreen message="Preparing checkout..." />;

  const price = parseFloat(String(event.ticket_price));
  const { subtotal, fee, total } = calculateTotal(price, quantity);
  const isFree = price === 0;
  const maxQty = Math.min(10, event.available_seats);

  const handleBook = async () => {
    if (quantity > event.available_seats) {
      Alert.alert('Not Enough Seats', `Only ${event.available_seats} seats are available.`);
      return;
    }
    try {
      const booking = await createBooking({
        event_id: event.id,
        ticket_type: ticketType,
        quantity,
      });
      setConfirmedBooking(booking);
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message || 'Could not complete booking. Please try again.');
    }
  };

  // Confirmation screen
  if (confirmedBooking) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.confirmContent} showsVerticalScrollIndicator={false}>
            {/* Success Icon */}
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
            </View>
            <Text style={styles.confirmTitle}>Booking Confirmed</Text>
            <Text style={styles.confirmSubtitle}>
              Your ticket has been generated and saved to your Bookings tab.
            </Text>

            {/* Digital Ticket Card */}
            <View style={styles.ticket}>
              <View style={styles.ticketHeader}>
                <Image
                  source={{
                    uri:
                      event.image ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
                  }}
                  style={styles.ticketImage}
                  resizeMode="cover"
                />
                <View style={styles.ticketHeaderOverlay}>
                  <View style={styles.bookingIdBadge}>
                    <Text style={styles.bookingIdText}>
                      BK{String(confirmedBooking.id).padStart(6, '0')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.ticketBody}>
                <Text style={styles.ticketEventName}>
                  {confirmedBooking.event_name || event.name}
                </Text>

                <View style={styles.ticketDivider}>
                  <View style={styles.notchLeft} />
                  <View style={styles.dashedLine} />
                  <View style={styles.notchRight} />
                </View>

                <View style={styles.ticketGrid}>
                  <View style={styles.ticketRow}>
                    <View style={styles.ticketRowLeft}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.ticketLabel}>Date</Text>
                    </View>
                    <Text style={styles.ticketValue}>{formatDate(event.date)}</Text>
                  </View>

                  <View style={styles.ticketRow}>
                    <View style={styles.ticketRowLeft}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.ticketLabel}>Time</Text>
                    </View>
                    <Text style={styles.ticketValue}>{formatTime(event.start_time)}</Text>
                  </View>

                  <View style={styles.ticketRow}>
                    <View style={styles.ticketRowLeft}>
                      <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.ticketLabel}>Venue</Text>
                    </View>
                    <Text style={styles.ticketValue} numberOfLines={1}>
                      {event.venue}
                    </Text>
                  </View>

                  <View style={styles.ticketRow}>
                    <View style={styles.ticketRowLeft}>
                      <Ionicons name="ticket-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.ticketLabel}>Ticket Type</Text>
                    </View>
                    <Text style={styles.ticketValue}>
                      {quantity} × {ticketType}
                    </Text>
                  </View>

                  <View style={styles.ticketRow}>
                    <View style={styles.ticketRowLeft}>
                      <Ionicons name="cash-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.ticketLabel}>Total Paid</Text>
                    </View>
                    <Text style={[styles.ticketValue, { color: COLORS.text, fontWeight: '800' }]}>
                      {isFree ? 'Free' : `$${total.toFixed(2)}`}
                    </Text>
                  </View>
                </View>

                {/* QR Section */}
                <View style={styles.qrSection}>
                  <View style={styles.qrCard}>
                    <View style={styles.qrContainer}>
                      <Image
                        source={{
                          uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                            `EVENTIFY:${confirmedBooking ? generateBookingId(confirmedBooking.id) : 'EVT-CONFIRMED'}:${event.name}`
                          )}&color=0F172A&bgcolor=FFFFFF&margin=0`,
                        }}
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                      <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
                      <View style={[styles.cornerBracket, styles.bracketTopRight]} />
                      <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
                      <View style={[styles.cornerBracket, styles.bracketBottomRight]} />
                    </View>
                    <Text style={styles.qrCodeText}>
                      {confirmedBooking ? generateBookingId(confirmedBooking.id) : 'EVT-CONFIRMED'}
                    </Text>
                  </View>
                  <View style={styles.qrInfoBadge}>
                    <Ionicons name="scan-outline" size={15} color={COLORS.primary} />
                    <Text style={styles.qrLabel}>Scan for instant entry check-in</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.confirmActions}>
              <PrimaryButton
                title="View in My Bookings"
                onPress={() => router.replace('/(tabs)/bookings')}
              />
              <PrimaryButton
                title="Back to Home"
                onPress={() => router.replace('/(tabs)')}
                variant="secondary"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Booking Form
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Tickets</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Event Summary */}
          <View style={styles.eventSummary}>
            <Image
              source={{
                uri:
                  event.image ||
                  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
              }}
              style={styles.summaryImage}
              resizeMode="cover"
            />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryName} numberOfLines={2}>
                {event.name}
              </Text>
              <View style={styles.summaryMeta}>
                <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.summaryMetaText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.summaryMeta}>
                <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.summaryMetaText} numberOfLines={1}>
                  {event.venue}
                </Text>
              </View>
              <Text style={styles.summaryAvail}>
                {event.available_seats} seats remaining
              </Text>
            </View>
          </View>

          {/* Ticket Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ticket Category</Text>
            <View style={styles.typeGrid}>
              {TICKET_TYPES.map((type) => {
                const isActive = ticketType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setTicketType(type)}
                    style={[styles.typeChip, isActive && styles.typeChipActive]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        isActive && styles.typeChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Tickets</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                disabled={quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity <= 1 ? COLORS.textDim : COLORS.text}
                />
              </TouchableOpacity>
              <View style={styles.qtyDisplay}>
                <Text style={styles.qtyNumber}>{quantity}</Text>
                <Text style={styles.qtyLabel}>ticket{quantity !== 1 ? 's' : ''}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                style={[styles.qtyBtn, quantity >= maxQty && styles.qtyBtnDisabled]}
                disabled={quantity >= maxQty}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={quantity >= maxQty ? COLORS.textDim : COLORS.text}
                />
              </TouchableOpacity>
            </View>
            {maxQty <= 5 && (
              <Text style={styles.limitNote}>Only {maxQty} seats remaining</Text>
            )}
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.priceCard}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {quantity} × {ticketType} ticket{quantity > 1 ? 's' : ''}
                </Text>
                <Text style={styles.priceValue}>
                  {isFree ? 'Free' : `$${(price * quantity).toFixed(2)}`}
                </Text>
              </View>
              {!isFree && (
                <>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Processing fee (5%)</Text>
                    <Text style={styles.priceValue}>${fee.toFixed(2)}</Text>
                  </View>
                  <View style={styles.priceDivider} />
                  <View style={styles.priceRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                  </View>
                </>
              )}
              {isFree && (
                <View style={styles.freeRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
                  <Text style={styles.freeText}>Free Admission</Text>
                </View>
              )}
            </View>
          </View>

          {/* Confirm Button */}
          <View style={styles.confirmBtnSection}>
            <PrimaryButton
              title={isFree ? 'Confirm Free Booking' : `Confirm & Pay $${total.toFixed(2)}`}
              onPress={handleBook}
              isLoading={isLoading}
              size="lg"
              icon={<Ionicons name="ticket-outline" size={18} color={COLORS.white} />}
            />
            <Text style={styles.termsText}>
              By confirming, you agree to our Terms of Service and Event Cancellation Policy.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  eventSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryImage: {
    width: 100,
    height: 110,
  },
  summaryInfo: {
    flex: 1,
    padding: 12,
    gap: 4,
    justifyContent: 'space-between',
  },
  summaryName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  summaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryMetaText: {
    color: COLORS.textMuted,
    fontSize: 11,
    flex: 1,
  },
  summaryAvail: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  typeChipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 24,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.35,
  },
  qtyDisplay: {
    alignItems: 'center',
  },
  qtyNumber: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
  },
  qtyLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  limitNote: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  priceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  priceValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  freeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingTop: 4,
  },
  freeText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '700',
  },
  confirmBtnSection: {
    gap: 10,
  },
  termsText: {
    color: COLORS.textDim,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Confirmation screen styles
  confirmContent: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 30,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  confirmSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    maxWidth: 300,
  },
  ticket: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    marginBottom: 24,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketHeader: {
    height: 140,
    position: 'relative',
  },
  ticketImage: {
    width: '100%',
    height: '100%',
  },
  ticketHeaderOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bookingIdBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bookingIdText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ticketBody: {
    padding: 18,
  },
  ticketEventName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  ticketDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  notchLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginLeft: -26,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginHorizontal: 4,
  },
  notchRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginRight: -26,
  },
  ticketGrid: {
    gap: 8,
    marginBottom: 18,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  ticketValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  qrSection: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  qrContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  qrImage: {
    width: 134,
    height: 134,
  },
  cornerBracket: {
    position: 'absolute',
    width: 15,
    height: 15,
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
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  qrInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
  },
  qrLabel: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  confirmActions: {
    width: '100%',
    gap: 10,
  },
});

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useEventsStore } from '../../store/eventsStore';
import { useFavoritesStore } from '../../store/bookingsStore';
import { useAuthStore } from '../../store/authStore';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS, CATEGORY_COLORS } from '../../constants';
import { formatDate, formatTime, formatPrice } from '../../utils/helpers';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedEvent, isLoading, fetchEvent } = useEventsStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (id) fetchEvent(parseInt(id));
  }, [id]);

  const event = selectedEvent;
  const isFav = event ? isFavorite(event.id) : false;
  const isSoldOut = event ? event.available_seats === 0 : false;
  const availabilityPct = event ? (event.available_seats / event.total_seats) * 100 : 0;

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (!event) return;
    try {
      if (isFav) await removeFavorite(event.id);
      else await addFavorite(event.id);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (isSoldOut) {
      Alert.alert('Sold Out', 'This event is fully booked.');
      return;
    }
    router.push(`/event/booking?eventId=${event?.id}`);
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        title: event.name,
        message: `Check out "${event.name}" on ${formatDate(event.date)} at ${event.venue}! Tickets from ${formatPrice(event.ticket_price)}`,
      });
    } catch {}
  };

  if (isLoading || !event) {
    return <LoadingIndicator fullScreen message="Loading event details..." />;
  }

  const catColor = CATEGORY_COLORS[event.category] || COLORS.primary;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.hero}>
          <Image
            source={{
              uri:
                event.image ||
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Top Bar Actions */}
          <SafeAreaView edges={['top']} style={styles.heroActions}>
            <TouchableOpacity onPress={() => router.back()} style={styles.actionBtn}>
              <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.actionRight}>
              <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                <Ionicons name="share-outline" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFavorite} style={styles.actionBtn}>
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFav ? COLORS.error : COLORS.text}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Category Badge */}
          <View style={[styles.heroCategoryBadge, { backgroundColor: catColor }]}>
            <Text style={styles.heroCategoryText}>{event.category}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.organizer}>Organized by {event.organizer_name || 'Eventify Partner'}</Text>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <View style={[styles.infoIconCircle, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="time-outline" size={20} color={COLORS.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>
                  {formatTime(event.start_time)}
                  {event.end_time ? ` - ${formatTime(event.end_time)}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="location-outline" size={20} color={COLORS.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{event.venue}</Text>
                <Text style={styles.infoSub} numberOfLines={1}>{event.address}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIconCircle, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="people-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Availability</Text>
                <Text style={[styles.infoValue, isSoldOut && { color: COLORS.error }]}>
                  {isSoldOut ? 'Sold Out' : `${event.available_seats} of ${event.total_seats} seats left`}
                </Text>
              </View>
            </View>
          </View>

          {/* Availability progress bar */}
          {!isSoldOut && (
            <View style={styles.availabilitySection}>
              <View style={styles.availabilityBar}>
                <View
                  style={[
                    styles.availabilityFill,
                    {
                      width: `${Math.max(4, availabilityPct)}%`,
                      backgroundColor:
                        availabilityPct < 20
                          ? COLORS.error
                          : availabilityPct < 50
                          ? COLORS.warning
                          : COLORS.success,
                    },
                  ]}
                />
              </View>
              <Text style={styles.availabilityText}>
                {availabilityPct < 20
                  ? 'Few tickets remaining'
                  : `${event.available_seats} seats left`}
              </Text>
            </View>
          )}

          {/* About Event */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Location details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Venue Location</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.venueName}>{event.venue}</Text>
                <Text style={styles.venueAddress}>{event.address}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Now Bottom Bar */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Ticket Price</Text>
          <Text style={styles.footerPrice}>{formatPrice(event.ticket_price)}</Text>
        </View>
        <PrimaryButton
          title={isSoldOut ? 'Sold Out' : 'Book Tickets'}
          onPress={handleBookNow}
          disabled={isSoldOut}
          variant={isSoldOut ? 'secondary' : 'primary'}
          fullWidth={false}
          style={{ flex: 1, maxWidth: 200 }}
          icon={!isSoldOut ? <Ionicons name="ticket-outline" size={18} color={COLORS.white} /> : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  hero: {
    height: 290,
    position: 'relative',
    backgroundColor: COLORS.border,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionRight: {
    flexDirection: 'row',
    gap: 10,
  },
  heroCategoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroCategoryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  eventName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 4,
  },
  organizer: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
  },
  infoGrid: {
    gap: 10,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  infoIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  infoSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  availabilitySection: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  availabilityBar: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  availabilityFill: {
    height: '100%',
    borderRadius: 3,
  },
  availabilityText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  venueAddress: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  footerLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '500',
  },
  footerPrice: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
});

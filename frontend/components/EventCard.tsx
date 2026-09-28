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
import { useFavoritesStore } from '../store/bookingsStore';
import { Event } from '../types';
import { COLORS, CATEGORY_COLORS } from '../constants';
import { formatDate, formatPrice } from '../utils/helpers';

interface EventCardProps {
  event: Event;
  variant?: 'featured' | 'card' | 'list';
}

export function EventCard({ event, variant = 'card' }: EventCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const fav = isFavorite(event.id);
  const catColor = CATEGORY_COLORS[event.category] || COLORS.primary;
  const isSoldOut = event.available_seats === 0;

  const handleFavoritePress = async (e: any) => {
    e.stopPropagation?.();
    try {
      if (fav) await removeFavorite(event.id);
      else await addFavorite(event.id);
    } catch { }
  };

  const handlePress = () => {
    router.push(`/event/${event.id}` as any);
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.featured}>
        <View style={styles.featuredImageWrapper}>
          <Image
            source={{ uri: event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600' }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.featuredOverlay}>
            <View style={[styles.catBadge, { backgroundColor: catColor }]}>
              <Text style={styles.catBadgeText}>{event.category}</Text>
            </View>
            <TouchableOpacity onPress={handleFavoritePress} style={styles.favCircle}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={17} color={fav ? COLORS.error : COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          {isSoldOut && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>Sold Out</Text>
            </View>
          )}
        </View>

        <View style={styles.featuredBottom}>
          <Text style={styles.featuredName} numberOfLines={1}>{event.name}</Text>
          <View style={styles.featuredMetaRow}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.featuredMetaText}>{formatDate(event.date)}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.featuredMetaText} numberOfLines={1}>{event.venue}</Text>
          </View>
          <View style={styles.featuredRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>{formatPrice(event.ticket_price)}</Text>
            </View>
            <View style={styles.viewBadge}>
              <Text style={styles.viewBadgeText}>Book</Text>
              <Ionicons name="arrow-forward" size={13} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'list') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.88} style={styles.listCard}>
        <Image
          source={{ uri: event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400' }}
          style={styles.listImage}
          resizeMode="cover"
        />
        <View style={styles.listContent}>
          <View style={styles.listHeaderRow}>
            <View style={[styles.catBadgeSmall, { backgroundColor: catColor + '15', borderColor: catColor + '30' }]}>
              <Text style={[styles.catBadgeSmallText, { color: catColor }]}>{event.category}</Text>
            </View>
            <TouchableOpacity onPress={handleFavoritePress} style={styles.smallFavBtn}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={17} color={fav ? COLORS.error : COLORS.textDim} />
            </TouchableOpacity>
          </View>
          <Text style={styles.listName} numberOfLines={2}>{event.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{formatDate(event.date)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>{event.venue}</Text>
          </View>
          <View style={styles.listFooter}>
            <Text style={styles.price}>{formatPrice(event.ticket_price)}</Text>
            <Text style={styles.seatsLeft}>{event.available_seats} seats left</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Default card
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.card}>
      <View style={styles.cardImageWrapper}>
        <Image
          source={{ uri: event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <TouchableOpacity onPress={handleFavoritePress} style={styles.cardFavCircle}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={14} color={fav ? COLORS.error : COLORS.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={2}>{event.name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={11} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{formatDate(event.date)}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{formatPrice(event.ticket_price)}</Text>
          <View style={[styles.catPill, { backgroundColor: catColor + '15' }]}>
            <Text style={[styles.catPillText, { color: catColor }]}>{event.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured
  featured: {
    width: 275,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginRight: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  featuredImageWrapper: { position: 'relative' },
  featuredImage: { width: '100%', height: 145 },
  featuredOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  catBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  favCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  soldOutBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  soldOutText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  featuredBottom: { padding: 14 },
  featuredName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  featuredMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  featuredMetaText: { color: COLORS.textMuted, fontSize: 12, flexShrink: 1 },
  dotSeparator: { color: COLORS.textDim, fontSize: 12, marginHorizontal: 2 },
  featuredRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  priceLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  price: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  viewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },
  viewBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

  // List
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  listImage: { width: 105, height: 125 },
  listContent: { flex: 1, padding: 12, gap: 4, justifyContent: 'space-between' },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  catBadgeSmallText: { fontSize: 10, fontWeight: '700' },
  smallFavBtn: { padding: 2 },
  listName: { color: COLORS.text, fontSize: 14, fontWeight: '700', lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: COLORS.textMuted, fontSize: 12, flex: 1 },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  seatsLeft: { color: COLORS.textDim, fontSize: 11, fontWeight: '500' },

  // Card
  card: {
    width: 175,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardImageWrapper: { position: 'relative' },
  cardImage: { width: '100%', height: 105 },
  cardFavCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { padding: 10, gap: 4 },
  cardName: { color: COLORS.text, fontSize: 13, fontWeight: '700', lineHeight: 17 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  catPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  catPillText: { fontSize: 9, fontWeight: '700' },
});

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '../../store/bookingsStore';
import { EmptyState, LoadingIndicator } from '../../components/LoadingIndicator';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS, CATEGORY_COLORS } from '../../constants';
import { formatDate, formatPrice } from '../../utils/helpers';

export default function FavoritesScreen() {
  const { favorites, isLoading, fetchFavorites, removeFavorite } = useFavoritesStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  }, []);

  const handleRemove = async (eventId: number) => {
    await removeFavorite(eventId);
  };

  if (isLoading && favorites.length === 0) {
    return <LoadingIndicator fullScreen message="Loading saved events..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Favorites</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{favorites.length}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => (item.id || item.event_id).toString()}
        renderItem={({ item }) => {
          const eventId = item.event_id || item.id;
          const catColor = CATEGORY_COLORS[item.category] || COLORS.primary;
          return (
            <TouchableOpacity
              onPress={() => router.push(`/event/${eventId}` as any)}
              activeOpacity={0.88}
              style={styles.card}
            >
              <Image
                source={{
                  uri:
                    item.image ||
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
                }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <View
                    style={[
                      styles.catBadge,
                      { backgroundColor: catColor + '15', borderColor: catColor + '30' },
                    ]}
                  >
                    <Text style={[styles.catText, { color: catColor }]}>{item.category}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemove(eventId)}
                    style={styles.removeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="heart" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.eventName} numberOfLines={2}>
                  {item.name}
                </Text>

                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.venue}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.price}>{formatPrice(item.ticket_price)}</Text>
                  <TouchableOpacity
                    onPress={() => router.push(`/event/${eventId}` as any)}
                    style={styles.viewBtn}
                  >
                    <Text style={styles.viewText}>Book Tickets</Text>
                    <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={[styles.listContent, favorites.length === 0 && { flex: 1 }]}
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
            iconName="heart-outline"
            title="No Saved Events"
            message="Tap the heart on any event card to save it for easy access later."
            action={
              <PrimaryButton
                title="Discover Events"
                onPress={() => router.push('/(tabs)/explore')}
              />
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
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  card: {
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
    shadowRadius: 5,
    elevation: 2,
  },
  cardImage: {
    width: 105,
    height: 130,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    gap: 4,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  catText: {
    fontSize: 10,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 4,
  },
  eventName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 12,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  price: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 7,
  },
  viewText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEventsStore } from '../../store/eventsStore';
import { useFavoritesStore } from '../../store/bookingsStore';
import { EventCard } from '../../components/EventCard';
import { SearchBar } from '../../components/SearchBar';
import { FilterModal } from '../../components/FilterModal';
import { LoadingIndicator, EmptyState } from '../../components/LoadingIndicator';
import { COLORS, CATEGORIES } from '../../constants';
import { EventFilters } from '../../types';

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const { events, isLoading, fetchEvents, filters, setFilters, clearFilters } = useEventsStore();
  const { fetchFavorites } = useFavoritesStore();
  const [showFilter, setShowFilter] = useState(false);
  const [localFilters, setLocalFilters] = useState<EventFilters>(filters);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetchFavorites();
    if (params.category) {
      setActiveCategory(params.category);
      fetchEvents({ category: params.category });
    } else {
      fetchEvents();
    }
  }, [params.category]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters({ search: text });
      fetchEvents({ search: text, category: activeCategory });
    }, 400);
  }, [activeCategory]);

  const handleCategoryPress = (category: string) => {
    const newCat = activeCategory === category ? '' : category;
    setActiveCategory(newCat);
    setFilters({ category: newCat });
    fetchEvents({ category: newCat, search: searchText });
  };

  const applyFilters = () => {
    setShowFilter(false);
    setFilters(localFilters);
    fetchEvents({ ...localFilters, search: searchText });
  };

  const clearAllFilters = () => {
    setLocalFilters({ search: '', category: '', date: '', minPrice: '', maxPrice: '', location: '' });
    setActiveCategory('');
    setSearchText('');
    clearFilters();
    fetchEvents({});
    setShowFilter(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents({ search: searchText, category: activeCategory });
    setRefreshing(false);
  }, [searchText, activeCategory]);

  const hasActiveFilters = !!(activeCategory || localFilters.date || localFilters.minPrice || localFilters.maxPrice || localFilters.location);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Events</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearAllFilters} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <SearchBar
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search by title, venue, or artist..."
          onFilterPress={() => setShowFilter(true)}
          showFilter
          onSubmit={() => fetchEvents({ search: searchText, category: activeCategory })}
        />
      </View>

      {/* Categories */}
      <View style={styles.catContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATEGORIES.map((item) => {
            const isActive = item.id === 'all' ? !activeCategory : activeCategory === item.name;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleCategoryPress(item.id === 'all' ? '' : item.name)}
                style={[
                  styles.catChip,
                  isActive && styles.catChipActive,
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.iconName as any}
                  size={14}
                  color={isActive ? COLORS.primary : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.catText,
                    isActive && styles.catTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results count */}
      {!isLoading && (
        <View style={styles.resultsBar}>
          <Text style={styles.resultCount}>
            {events.length} event{events.length !== 1 ? 's' : ''} found
          </Text>
          {activeCategory && (
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>{activeCategory}</Text>
              <TouchableOpacity onPress={() => handleCategoryPress(activeCategory)}>
                <Ionicons name="close" size={13} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Events List */}
      {isLoading && events.length === 0 ? (
        <LoadingIndicator message="Finding matching events..." fullScreen />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <EventCard event={item} variant="list" />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="search-outline"
              title="No Events Found"
              message={
                searchText || hasActiveFilters
                  ? "Try adjusting your search criteria or filters to see more results."
                  : "No events available right now. Check back soon!"
              }
            />
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        filters={localFilters}
        onFiltersChange={setLocalFilters}
        onApply={applyFilters}
        onClear={clearAllFilters}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.errorLight,
    borderRadius: 8,
  },
  clearText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '600',
  },
  searchRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  catContainer: {
    marginBottom: 12,
  },
  catRow: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  catChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  catText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  catTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultCount: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeTagText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
});

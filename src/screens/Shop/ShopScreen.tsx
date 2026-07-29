/**
 * GoOne Customer App — Shop Screen
 * Browse all local businesses with search, category filter.
 *
 * NOTE: Location permission is handled globally by HomeScreen via locationStore.
 * This screen only READS the cached permission and location — it never calls
 * PermissionsAndroid.request(), which would conflict with MapView Fragment init.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  FlatList, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Search, MapPin, Star, Clock, Map as MapIcon, List as ListIcon } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { Input } from '../../components/Input';
import { catalogApi } from '../../api/client';
import { AppMapView } from '../../components/AppMapView';
import { useLocationStore } from '../../store/locationStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  { key: 'all', label: 'All', emoji: '🏪' },
  { key: 'grocery', label: 'Grocery', emoji: '🛒' },
  { key: 'restaurant', label: 'Food', emoji: '🍱' },
  { key: 'medical', label: 'Medical', emoji: '💊' },
  { key: 'milk_water', label: 'Milk/Water', emoji: '🥛' },
  { key: 'farmer', label: 'Farmer', emoji: '🌾' },
  { key: 'service', label: 'Services', emoji: '✂️' },
];

export const ShopScreen: React.FC<any> = ({ navigation, route }) => {
  // Read location from global store — never request here
  const { location: userLocation, isLoading: locationLoading, error: locationError, permissionStatus } = useLocationStore();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(route?.params?.filter || 'all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const fetchBusinesses = useCallback(async () => {
    try {
      const params: any = { limit: 30 };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const data = await catalogApi.listBusinesses(params);
      setBusinesses(data?.businesses || []);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(fetchBusinesses, 300);
    return () => clearTimeout(t);
  }, [fetchBusinesses]);

  const EMOJI_MAP: Record<string, string> = { restaurant: '🍱', medical: '💊', milk_water: '🥛', farmer: '🌾', service: '✂️', grocery: '🛒' };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Shop Local</Text>
        <View style={styles.locationRow}>
          <MapPin color={theme.colors.primary} size={14} />
          <Text style={styles.location}>Chennai, TN</Text>
        </View>
      </View>

      <View style={styles.viewToggleRow}>
        <TouchableOpacity style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]} onPress={() => setViewMode('list')}>
          <ListIcon color={viewMode === 'list' ? '#fff' : theme.colors.textMuted} size={16} />
          <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.viewToggleBtn, viewMode === 'map' && styles.viewToggleBtnActive]} onPress={() => setViewMode('map')}>
          <MapIcon color={viewMode === 'map' ? '#fff' : theme.colors.textMuted} size={16} />
          <Text style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}>Map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Input
          placeholder="Search stores, products..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search color={theme.colors.textMuted} size={18} />}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {/* Category Filter */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.key}
        contentContainerStyle={styles.catFilter}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, category === item.key && styles.catChipActive]}
            onPress={() => setCategory(item.key)}
          >
            <Text style={styles.catEmoji}>{item.emoji}</Text>
            <Text style={[styles.catLabel, category === item.key && styles.catLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <AppMapView
            isLoading={locationLoading}
            error={locationError}
            permissionStatus={permissionStatus}
            initialRegion={userLocation ? {
              latitude: userLocation.lat,
              longitude: userLocation.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            } : undefined}
            markers={businesses
              .filter((biz) => biz.location?.lat != null && biz.location?.lng != null)
              .map((biz) => ({
                lat: biz.location.lat,
                lng: biz.location.lng,
                title: biz.name,
                description: biz.category_name,
                onPress: () => navigation.navigate('BusinessDetail', { businessId: biz.id }),
              }))}
          />
        </View>
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBusinesses(); }} colors={[theme.colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
              <Text style={styles.emptyTitle}>No businesses found</Text>
              <Text style={styles.emptySub}>Try a different search or category</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bizCard}
              onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
              activeOpacity={0.85}
            >
              <View style={styles.bizEmoji}>
                <Text style={{ fontSize: 32 }}>{EMOJI_MAP[item.category_id] || '🏪'}</Text>
              </View>
              <View style={styles.bizInfo}>
                <Text style={styles.bizName}>{item.name}</Text>
                <Text style={styles.bizCategory}>{item.category_name}</Text>
                <View style={styles.bizMeta}>
                  <Star color={theme.colors.accent} size={12} fill={theme.colors.accent} />
                  <Text style={styles.bizRating}>{item.rating || '4.5'}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Clock color={theme.colors.textLight} size={12} />
                  <Text style={styles.bizTime}>{item.delivery_time || '20-35'} min</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.bizDist}>{item.distance_km ? `${item.distance_km}km` : 'Nearby'}</Text>
                </View>
                {item.is_online === false && (
                  <View style={styles.closedBadge}><Text style={styles.closedText}>CLOSED</Text></View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: 8, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border, ...theme.shadows.sm },
  title: { ...theme.typography.h2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  location: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '600' },
  searchBar: { padding: theme.spacing.md },
  catFilter: { paddingHorizontal: theme.spacing.md, paddingBottom: 12, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.full, borderWidth: 1.5, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  catChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  catEmoji: { fontSize: 14 },
  catLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted },
  catLabelActive: { color: '#fff' },
  list: { padding: theme.spacing.md, gap: 12 },
  bizCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 14, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  bizEmoji: { width: 64, height: 64, borderRadius: 18, backgroundColor: theme.colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  bizInfo: { flex: 1 },
  bizName: { ...theme.typography.h4, marginBottom: 4 },
  bizCategory: { ...theme.typography.caption, marginBottom: 6 },
  bizMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bizRating: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
  dot: { color: theme.colors.textLight, fontSize: 10 },
  bizTime: { fontSize: 12, color: theme.colors.textMuted },
  bizDist: { fontSize: 12, color: theme.colors.textMuted },
  closedBadge: { alignSelf: 'flex-start', backgroundColor: theme.colors.dangerLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  closedText: { color: theme.colors.danger, fontSize: 10, fontWeight: '800' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  emptyTitle: { ...theme.typography.h3, marginBottom: 8 },
  emptySub: { ...theme.typography.subtitle },
  viewToggleRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, paddingBottom: 12, gap: 12, justifyContent: 'flex-end' },
  viewToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceAlt },
  viewToggleBtnActive: { backgroundColor: theme.colors.primary },
  viewToggleText: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted },
  viewToggleTextActive: { color: '#fff' },
  mapContainer: { flex: 1, overflow: 'hidden', margin: theme.spacing.md, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border },
  map: { width: '100%', height: '100%' },
});

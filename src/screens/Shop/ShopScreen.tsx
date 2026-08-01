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
  FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Search, Star, Clock, Map as MapIcon, List as ListIcon } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { Input } from '../../components/Input';
import { catalogApi } from '../../api/client';
import { AppHeader } from '../../components/AppHeader';
import { AppMapView } from '../../components/AppMapView';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { useLocationStore } from '../../store/locationStore';
import { emojiForCategory } from '../../utils/categoryEmoji';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation, type TranslationKey } from '../../utils/i18n';
import type { ShopStackParamList } from '../../navigation/types';

interface Category {
  id: string;
  name: string;
  emoji: string;
}

// Used only if catalogApi.getCategories() fails — keeps the chip row from
// disappearing entirely. These ids are not real backend UUIDs, so a filter
// selection made while running on this fallback will not match real
// business rows; that's an acceptable degradation versus no chips at all.

type Props = NativeStackScreenProps<ShopStackParamList, 'Shop'>;

export const ShopScreen: React.FC<Props> = ({ navigation, route }) => {
  // Read location from global store — never request here
  const { location: userLocation, isLoading: locationLoading, error: locationError, permissionStatus } = useLocationStore();
  const { t } = useTranslation();

  const FALLBACK_CATEGORIES: Category[] = [
    { id: 'grocery', name: t('cat_grocery'), emoji: '🛒' },
    { id: 'restaurant', name: t('cat_food'), emoji: '🍱' },
    { id: 'medical', name: t('cat_medical'), emoji: '💊' },
    { id: 'milk_water', name: t('cat_milk_water'), emoji: '🥛' },
    { id: 'farmer', name: t('cat_farmer'), emoji: '🌾' },
    { id: 'service', name: t('cat_services'), emoji: '✂️' },
  ];

  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(route?.params?.filter || 'all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    catalogApi.getCategories()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data.map((c: any) => ({ id: c.id, name: c.name, emoji: emojiForCategory(c.name) })));
        }
      })
      .catch((err) => {
        console.warn('Failed to load categories, keeping fallback list', err);
      });
  }, []);

  const fetchBusinesses = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    setError(null);
    try {
      const params: any = { lat: userLocation.lat, lng: userLocation.lng, limit: 30 };
      if (category !== 'all') params.category_id = category;
      const data = await catalogApi.listBusinesses(params);
      setBusinesses(data?.businesses || []);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to load businesses.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, userLocation]);

  // No server-side `search` param exists — search filters the already
  // fetched list client-side (below), so only category/location changes
  // need to re-hit the network.
  useEffect(() => {
    if (userLocation) fetchBusinesses();
  }, [fetchBusinesses, userLocation]);

  const filteredBusinesses = search.trim()
    ? businesses.filter((b) => (b.name || '').toLowerCase().includes(search.trim().toLowerCase()))
    : businesses;

  const ALL_CATEGORY: Category = { id: 'all', name: t('cat_all'), emoji: '🏪' };
  const chips = [ALL_CATEGORY, ...categories];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />

      <AppHeader variant="main" title={t('shops_services')} />

      <View style={styles.viewToggleRow}>
        <TouchableOpacity style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]} onPress={() => setViewMode('list')}>
          <ListIcon color={viewMode === 'list' ? '#fff' : theme.colors.textMuted} size={16} />
          <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>{t('list_view')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.viewToggleBtn, viewMode === 'map' && styles.viewToggleBtnActive]} onPress={() => setViewMode('map')}>
          <MapIcon color={viewMode === 'map' ? '#fff' : theme.colors.textMuted} size={16} />
          <Text style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}>{t('map_view')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Input
          placeholder={t('search_stores')}
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search color={theme.colors.textMuted} size={18} />}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {/* Category Filter */}
      <FlatList
        data={chips}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.id}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.catFilter}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, category === item.id && styles.catChipActive]}
            onPress={() => setCategory(item.id)}
          >
            <Text style={styles.catEmoji}>{item.emoji}</Text>
            <Text style={[styles.catLabel, category === item.id && styles.catLabelActive]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {!userLocation ? (
        locationLoading ? (
          <LoadingView />
        ) : (
          <EmptyState
            icon="📍"
            title={permissionStatus === 'denied' || permissionStatus === 'blocked' ? t('location_needed') : t('waiting_location')}
            subtitle={t('location_desc')}
          />
        )
      ) : loading ? (
        <LoadingView />
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title={t('couldnt_load_biz')}
          subtitle={error}
          ctaLabel={t('retry')}
          onCtaPress={fetchBusinesses}
        />
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
            markers={filteredBusinesses
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
          data={filteredBusinesses}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBusinesses(); }} colors={[theme.colors.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="🔍" title="No businesses found" subtitle="Try a different search or category" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bizCard}
              onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
              activeOpacity={0.85}
            >
              <View style={styles.bizEmoji}>
                <Text style={{ fontSize: 32 }}>{emojiForCategory(item.category_name)}</Text>
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
  searchBar: { padding: theme.spacing.md },
  catFilter: { paddingHorizontal: theme.spacing.md, paddingBottom: 12, gap: 8, alignItems: 'center' },
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
  viewToggleRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, paddingTop: 12, paddingBottom: 12, gap: 12, justifyContent: 'flex-end' },
  viewToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceAlt },
  viewToggleBtnActive: { backgroundColor: theme.colors.primary },
  viewToggleText: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted },
  viewToggleTextActive: { color: '#fff' },
  mapContainer: { flex: 1, overflow: 'hidden', margin: theme.spacing.md, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border },
});

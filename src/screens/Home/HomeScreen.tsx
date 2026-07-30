/**
 * GoOne Customer App — Home Screen
 * TWO BIG CARD selection: "Shop Local 🛒" and "Book a Ride 🚗"
 * After selection, navigates into the relevant tab.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { ShoppingBag, Car, Star, Clock, ChevronRight, Zap, Map as MapIcon, List as ListIcon } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';
import { catalogApi } from '../../api/client';
import { AppHeader } from '../../components/AppHeader';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { AppMapView } from '../../components/AppMapView';
import { emojiForCategory } from '../../utils/categoryEmoji';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { user, language } = useAuthStore();
  const {
    requestPermissionAndLocation,
    location,
    isLoading: locationLoading,
    permissionStatus,
  } = useLocationStore();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loadingBiz, setLoadingBiz] = useState(false);
  const [bizError, setBizError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Request location permission HERE — HomeScreen has no MapView, so
  // no Google Maps Fragment transaction conflict can occur.
  useEffect(() => {
    requestPermissionAndLocation();
  }, [requestPermissionAndLocation]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const voiceText = `${greeting} ${user?.name?.split(' ')[0] || ''}. Welcome to GoOne. Choose Shop Local or Book a Ride to get started.`;

  const fetchBusinesses = useCallback(async () => {
    if (!location) return;
    setLoadingBiz(true);
    setBizError(null);
    try {
      const data = await catalogApi.listBusinesses({ lat: location.lat, lng: location.lng, limit: 10 });
      setBusinesses(data?.businesses || []);
    } catch (err: any) {
      setBizError(err?.response?.data?.error?.message || 'Unable to load nearby businesses.');
    } finally {
      setLoadingBiz(false);
    }
  }, [location]);

  // Fetch unconditionally once a location is available — no longer gated
  // behind the "Shop Local" card tap.
  useEffect(() => {
    if (location) fetchBusinesses();
  }, [location, fetchBusinesses]);

  const handleShopSelect = () => {
    navigation.navigate('ShopTab');
  };

  const handleRideSelect = () => {
    navigation.navigate('RidesTab');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />

      <AppHeader
        variant="main"
        voiceText={voiceText}
        voiceLanguage={language}
        onLocationPress={() => navigation.navigate('LocationPicker')}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting Line */}
        <Text style={styles.name}>{user?.name?.split(' ')[0] || 'Welcome'}</Text>
        <Text style={styles.subHead}>What would you like to do?</Text>

        {/* TWO BIG SELECTION CARDS */}
        <View style={styles.twoCards}>
          {/* Card 1 — Shop Local */}
          <TouchableOpacity
            style={[styles.bigCard, styles.shopCard]}
            onPress={handleShopSelect}
            activeOpacity={0.88}
            accessibilityLabel="Shop Local"
          >
            <View style={styles.cardIconBg}>
              <ShoppingBag color="#fff" size={36} />
            </View>
            <Text style={styles.bigCardTitle}>Shop Local</Text>
            <Text style={styles.bigCardSub}>Order from stores, restaurants & farms near you</Text>
            <View style={styles.cardArrow}>
              <Text style={styles.cardArrowText}>Explore →</Text>
            </View>
          </TouchableOpacity>

          {/* Card 2 — Book a Ride */}
          <TouchableOpacity
            style={[styles.bigCard, styles.rideCard]}
            onPress={handleRideSelect}
            activeOpacity={0.88}
            accessibilityLabel="Book a Ride"
          >
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Car color="#fff" size={36} />
            </View>
            <Text style={styles.bigCardTitle}>Book a Ride</Text>
            <Text style={styles.bigCardSub}>Auto, bike taxi, or cab — wherever you need to go</Text>
            <View style={styles.cardArrow}>
              <Text style={styles.cardArrowText}>Book Now →</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Access Row */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate('ShopTab', { filter: 'grocery' })}>
            <Text style={{ fontSize: 28 }}>🛒</Text>
            <Text style={styles.quickLabel}>Grocery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate('ShopTab', { filter: 'restaurant' })}>
            <Text style={{ fontSize: 28 }}>🍱</Text>
            <Text style={styles.quickLabel}>Food</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate('ShopTab', { filter: 'medical' })}>
            <Text style={{ fontSize: 28 }}>💊</Text>
            <Text style={styles.quickLabel}>Medical</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate('ShopTab', { filter: 'farmer' })}>
            <Text style={{ fontSize: 28 }}>🌾</Text>
            <Text style={styles.quickLabel}>Farmer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate('RidesTab')}>
            <Text style={{ fontSize: 28 }}>🛵</Text>
            <Text style={styles.quickLabel}>Bike Taxi</Text>
          </TouchableOpacity>
        </View>

        {/* Offers Banner */}
        <View style={styles.offerBanner}>
          <Zap color={theme.colors.accent} size={20} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.offerTitle}>🎉 Special Offer</Text>
            <Text style={styles.offerText}>Get 20% off on your first 3 orders from local stores!</Text>
          </View>
        </View>

        {/* Nearby Businesses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Businesses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ShopTab')}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewToggleRow}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <ListIcon color={viewMode === 'list' ? '#fff' : theme.colors.textMuted} size={16} />
            <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'map' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('map')}
          >
            <MapIcon color={viewMode === 'map' ? '#fff' : theme.colors.textMuted} size={16} />
            <Text style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}>Map</Text>
          </TouchableOpacity>
        </View>

        {!location ? (
          locationLoading ? (
            <LoadingView />
          ) : (
            <EmptyState
              icon="📍"
              title="Waiting for location"
              subtitle={
                permissionStatus === 'denied' || permissionStatus === 'blocked'
                  ? 'Enable location access to see nearby businesses.'
                  : 'Fetching your location…'
              }
            />
          )
        ) : loadingBiz ? (
          <LoadingView />
        ) : bizError ? (
          <EmptyState
            icon="⚠️"
            title="Couldn't load businesses"
            subtitle={bizError}
            ctaLabel="Retry"
            onCtaPress={fetchBusinesses}
          />
        ) : businesses.length === 0 ? (
          <EmptyState icon="🏪" title="No businesses nearby" subtitle="Try changing your location" />
        ) : viewMode === 'map' ? (
          <View style={styles.mapContainer}>
            <AppMapView
              initialRegion={{
                latitude: location.lat,
                longitude: location.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              markers={businesses
                .filter((biz) => biz.location?.lat != null && biz.location?.lng != null)
                .map((biz) => ({
                  lat: biz.location.lat,
                  lng: biz.location.lng,
                  title: biz.name,
                  description: biz.category_name,
                  onPress: () => navigation.navigate('ShopTab', { screen: 'BusinessDetail', params: { businessId: biz.id } }),
                }))}
            />
          </View>
        ) : (
          businesses.map((biz) => (
            <TouchableOpacity
              key={biz.id}
              style={styles.bizCard}
              onPress={() => navigation.navigate('ShopTab', { screen: 'BusinessDetail', params: { businessId: biz.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.bizEmoji}>
                <Text style={{ fontSize: 28 }}>{emojiForCategory(biz.category_name)}</Text>
              </View>
              <View style={styles.bizInfo}>
                <Text style={styles.bizName}>{biz.name}</Text>
                <Text style={styles.bizCategory}>{biz.category_name}</Text>
                <View style={styles.bizMeta}>
                  <Star color={theme.colors.accent} size={12} fill={theme.colors.accent} />
                  <Text style={styles.bizRating}>{biz.rating || '4.5'}</Text>
                  <Text style={styles.bizDot}>•</Text>
                  <Clock color={theme.colors.textLight} size={12} />
                  <Text style={styles.bizTime}>{biz.delivery_time || '20-35'} min</Text>
                </View>
              </View>
              <ChevronRight color={theme.colors.textLight} size={18} />
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md },
  name: { fontSize: 26, fontWeight: '900', color: theme.colors.text, marginBottom: 4 },
  subHead: { ...theme.typography.subtitle, marginBottom: theme.spacing.xl },
  twoCards: { flexDirection: 'row', gap: 12, marginBottom: theme.spacing.xl },
  bigCard: {
    flex: 1, borderRadius: 20, padding: 20, minHeight: 200,
    justifyContent: 'space-between', overflow: 'hidden',
    ...theme.shadows.lg,
  },
  shopCard: { backgroundColor: theme.colors.primary },
  rideCard: { backgroundColor: theme.colors.secondary },
  cardIconBg: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  bigCardTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 8 },
  bigCardSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 18, marginBottom: 16 },
  cardArrow: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  cardArrowText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: theme.spacing.xl, justifyContent: 'space-between' },
  quickItem: { alignItems: 'center', gap: 6 },
  quickLabel: { fontSize: 10, fontWeight: '600', color: theme.colors.textMuted, textAlign: 'center' },
  offerBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.accent + '18', borderRadius: theme.radius.lg,
    padding: 16, marginBottom: theme.spacing.xl,
    borderWidth: 1, borderColor: theme.colors.accent + '40',
  },
  offerTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.text, marginBottom: 2 },
  offerText: { fontSize: 12, color: theme.colors.textMuted, lineHeight: 17 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { ...theme.typography.h4 },
  viewAll: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  viewToggleRow: { flexDirection: 'row', paddingBottom: 12, gap: 12, justifyContent: 'flex-end' },
  viewToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceAlt },
  viewToggleBtnActive: { backgroundColor: theme.colors.primary },
  viewToggleText: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted },
  viewToggleTextActive: { color: '#fff' },
  mapContainer: { height: 260, overflow: 'hidden', borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md },
  bizCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm,
  },
  bizEmoji: { width: 56, height: 56, borderRadius: 16, backgroundColor: theme.colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  bizInfo: { flex: 1 },
  bizName: { ...theme.typography.bodyMedium, fontWeight: '700' },
  bizCategory: { ...theme.typography.caption, marginTop: 2 },
  bizMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  bizRating: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
  bizDot: { color: theme.colors.textLight },
  bizTime: { fontSize: 12, color: theme.colors.textMuted },
});

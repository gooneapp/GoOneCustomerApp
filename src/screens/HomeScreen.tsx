import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { theme } from '../theme/theme';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import { MapPin, ShoppingCart, Store, Pill, Droplet, Car, Bell } from 'lucide-react-native';
import { useCartStore } from '../store/cartStore';

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const user = useAuthStore(state => state.user);
  const cartItems = useCartStore(state => state.items);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNearby = async () => {
    // In real app, we would use Geolocation and hit /api/v1/business/nearby
    // Mocking for now
    setBusinesses([
      { id: 'b-1', name: 'FreshMart Erode', type: 'grocery', rating: 4.8 },
      { id: 'b-2', name: 'Annapoorna Hotel', type: 'restaurant', rating: 4.5 },
      { id: 'b-3', name: 'Apollo Pharmacy', type: 'medical', rating: 4.9 },
    ]);
  };

  useEffect(() => {
    fetchNearby();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchNearby().finally(() => setRefreshing(false));
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'}</Text>
          <View style={styles.locationContainer}>
            <MapPin color={theme.colors.primary} size={14} />
            <Text style={styles.location}>Erode, Tamil Nadu</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Bell color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart color={theme.colors.text} size={24} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* GoOne Ride Hero Banner */}
        <TouchableOpacity style={styles.rideBanner} onPress={() => navigation.navigate('BookRide')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rideBadge}>ON-DEMAND RIDES</Text>
            <Text style={styles.rideTitle}>Book Auto or Car</Text>
            <Text style={styles.rideSub}>Local drivers, safe rides, OTP security</Text>
          </View>
          <Car color="#ffffff" size={48} />
        </TouchableOpacity>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Shop & Order Nearby</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.categoryCard} onPress={() => navigation.navigate('BusinessProfile', { category: 'grocery' })}>
            <Store color={theme.colors.primary} size={32} style={styles.catIcon} />
            <Text style={styles.catName}>Groceries</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard} onPress={() => navigation.navigate('BusinessProfile', { category: 'restaurant' })}>
            <Store color={theme.colors.warning} size={32} style={styles.catIcon} />
            <Text style={styles.catName}>Hotels & Food</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard} onPress={() => navigation.navigate('BusinessProfile', { category: 'medical' })}>
            <Pill color={theme.colors.danger} size={32} style={styles.catIcon} />
            <Text style={styles.catName}>Pharmacies</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard} onPress={() => navigation.navigate('BusinessProfile', { category: 'water' })}>
            <Droplet color={theme.colors.primary} size={32} style={styles.catIcon} />
            <Text style={styles.catName}>Milk & Water</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Businesses */}
        <Text style={styles.sectionTitle}>Top Rated Near You</Text>
        {businesses.map((b) => (
          <TouchableOpacity 
            key={b.id} 
            style={styles.businessCard}
            onPress={() => navigation.navigate('BusinessProfile', { businessId: b.id })}
          >
            <View style={styles.businessImg} />
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{b.name}</Text>
              <Text style={styles.businessType}>{b.type.toUpperCase()} • ⭐ {b.rating}</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userInfo: { flex: 1 },
  greeting: { ...theme.typography.h2, fontSize: 20 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  location: { ...theme.typography.caption, color: theme.colors.primary },
  headerActions: { flexDirection: 'row', gap: 16 },
  iconBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  scroll: { padding: theme.spacing.lg },
  rideBanner: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rideBadge: { color: '#090d16', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  rideTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  rideSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  sectionTitle: { ...theme.typography.h3, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  categoryCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  catIcon: { marginBottom: 12 },
  catName: { color: theme.colors.text, fontWeight: '600', fontSize: 14 },
  businessCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  businessImg: { width: 80, height: 80, backgroundColor: theme.colors.border },
  businessInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  businessName: { ...theme.typography.h3, fontSize: 16, marginBottom: 4 },
  businessType: { ...theme.typography.caption },
});

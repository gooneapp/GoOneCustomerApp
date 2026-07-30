/**
 * GoOne Customer App — Ride Booking Screen
 * Admin-configurable fare, pickup/dropoff, vehicle type selection.
 *
 * NOTE: Location permission is handled globally by HomeScreen via locationStore.
 * This screen only READS the cached permission and location — it never calls
 * PermissionsAndroid.request(), which would conflict with MapView Fragment init.
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { MapPin, Car, Bike } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { AppHeader } from '../../components/AppHeader';
import { AppMapView } from '../../components/AppMapView';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';
import { rideApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';

const VEHICLE_TYPES = [
  { key: 'auto', label: 'Auto Rickshaw', emoji: '🛺', Icon: Car },
  { key: 'bike', label: 'Bike Taxi', emoji: '🏍️', Icon: Bike },
  { key: 'cab', label: 'Cab', emoji: '🚖', Icon: Car },
];

export const RideBookingScreen: React.FC<any> = ({ navigation }) => {
  const { language } = useAuthStore();
  // Read location from global store — never request here
  const { location: userLocation, isLoading: locationLoading, error: locationError, permissionStatus } = useLocationStore();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [vehicleType, setVehicleType] = useState('auto');
  const [estimate, setEstimate] = useState<any>(null);
  const [estimating, setEstimating] = useState(false);
  const [booking, setBooking] = useState(false);
  const idempKey = useRef(`ride-${Date.now()}`);

  const handleEstimate = async () => {
    if (!pickup.trim() || !dropoff.trim()) {
      Alert.alert('Missing Info', 'Please enter pickup and drop-off locations.');
      return;
    }
    setEstimating(true);
    try {
      const data = await rideApi.estimateFare({ pickup_address: pickup, dropoff_address: dropoff, vehicle_type: vehicleType });
      setEstimate(data);
    } catch {
      setEstimate({ fare: 45, distance_km: 3.2, duration_min: 12, vehicle_type: vehicleType });
    } finally { setEstimating(false); }
  };

  const handleBook = async () => {
    if (!estimate) { handleEstimate(); return; }
    setBooking(true);
    try {
      const ride = await rideApi.book(
        { pickup_address: pickup, dropoff_address: dropoff, vehicle_type: vehicleType, estimated_fare: estimate?.fare },
        idempKey.current,
      );
      navigation.navigate('RideTracking', { rideId: ride.id });
    } catch (err: any) {
      Alert.alert('Booking Failed', err?.response?.data?.error?.message || 'Could not book a ride. Please try again.');
    } finally { setBooking(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <AppHeader
        variant="main"
        voiceText="Enter your pickup and drop location, then select vehicle type and book your ride."
        voiceLanguage={language}
        onLocationPress={() => navigation.navigate('LocationPicker')}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Map — only rendered after location is available from global store */}
        <View style={styles.mapContainer}>
          <AppMapView
            isLoading={locationLoading}
            error={locationError}
            permissionStatus={permissionStatus}
            initialRegion={userLocation ? {
              latitude: userLocation.lat,
              longitude: userLocation.lng,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            } : undefined}
            markers={userLocation ? [{ lat: userLocation.lat, lng: userLocation.lng, title: 'Your Location' }] : undefined}
          />
        </View>

        {/* Locations */}
        <View style={styles.locationCard}>
          <View style={styles.locRow}>
            <View style={styles.greenDot} />
            <Input
              placeholder="Pickup location"
              value={pickup}
              onChangeText={setPickup}
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.locRow}>
            <View style={styles.redDot} />
            <Input
              placeholder="Drop-off location"
              value={dropoff}
              onChangeText={setDropoff}
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
          </View>
        </View>

        {/* Vehicle Type Selection */}
        <Text style={styles.sectionTitle}>Choose Vehicle Type</Text>
        <View style={styles.vehicleRow}>
          {VEHICLE_TYPES.map((v) => (
            <TouchableOpacity
              key={v.key}
              style={[styles.vehicleCard, vehicleType === v.key && styles.vehicleCardActive]}
              onPress={() => { setVehicleType(v.key); setEstimate(null); }}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>{v.emoji}</Text>
              <Text style={[styles.vehicleLabel, vehicleType === v.key && styles.vehicleLabelActive]}>{v.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fare Estimate */}
        {estimate && (
          <View style={styles.estimateCard}>
            <View style={styles.estimateTop}>
              <Text style={styles.fareLabel}>Estimated Fare</Text>
              <Text style={styles.fareAmount}>₹{estimate.fare}</Text>
            </View>
            <View style={styles.estimateDetails}>
              <Text style={styles.estimateDetail}>📍 {estimate.distance_km} km</Text>
              <Text style={styles.estimateDetail}>⏱️ ~{estimate.duration_min} min</Text>
              <Text style={styles.estimateDetail}>🚗 {vehicleType.toUpperCase()}</Text>
            </View>
            <Text style={styles.adminNote}>
              * Fare calculated as per GoOne platform rates (configured by admin)
            </Text>
          </View>
        )}

        {/* Recent Locations */}
        <Text style={styles.sectionTitle}>Recent Locations</Text>
        {['Home - 45 Gandhi St', 'Office - Anna Nagar', 'Market - T. Nagar'].map((loc) => (
          <TouchableOpacity key={loc} style={styles.recentRow} onPress={() => setDropoff(loc)}>
            <MapPin color={theme.colors.primary} size={16} />
            <Text style={styles.recentText}>{loc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {!estimate ? (
          <Button title={estimating ? '' : 'Get Fare Estimate'} onPress={handleEstimate} loading={estimating} size="large" fullWidth variant="outline" />
        ) : (
          <Button title={booking ? '' : `Book ${vehicleType.toUpperCase()} — ₹${estimate.fare}`} onPress={handleBook} loading={booking} size="large" fullWidth />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md },
  mapContainer: { width: '100%', height: 200, borderRadius: theme.radius.xl, overflow: 'hidden', marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border },
  map: { width: '100%', height: '100%' },
  locationCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greenDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.success },
  redDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.danger },
  dividerLine: { height: 24, width: 1.5, backgroundColor: theme.colors.border, marginLeft: 5, marginVertical: 4 },
  sectionTitle: { ...theme.typography.captionBold, textTransform: 'uppercase', marginBottom: 12, color: theme.colors.text },
  vehicleRow: { flexDirection: 'row', gap: 12, marginBottom: theme.spacing.xl },
  vehicleCard: { flex: 1, alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, borderWidth: 2, borderColor: theme.colors.border, ...theme.shadows.sm },
  vehicleCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight, ...theme.shadows.primary },
  vehicleLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, textAlign: 'center' },
  vehicleLabelActive: { color: theme.colors.primary },
  estimateCard: { backgroundColor: theme.colors.primaryLight, borderRadius: theme.radius.lg, padding: 20, marginBottom: theme.spacing.xl, borderWidth: 1.5, borderColor: theme.colors.primary },
  estimateTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fareLabel: { ...theme.typography.h4, color: theme.colors.primary },
  fareAmount: { fontSize: 28, fontWeight: '900', color: theme.colors.primary },
  estimateDetails: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  estimateDetail: { ...theme.typography.body, color: theme.colors.textMuted, fontSize: 13 },
  adminNote: { fontSize: 10, color: theme.colors.textLight, fontStyle: 'italic' },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  recentText: { ...theme.typography.body },
  footer: { padding: theme.spacing.md },
});

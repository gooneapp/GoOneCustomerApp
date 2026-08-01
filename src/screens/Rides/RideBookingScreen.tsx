/**
 * GoOne Customer App — Ride Booking Screen
 * Admin-configurable fare, pickup/dropoff, vehicle type selection.
 *
 * Pickup is now user-selectable via three modes (Auto Detect / Search /
 * Map) instead of being permanently locked to the device's current
 * position — see PickupOptionsSheet. "Auto Detect" still reads its
 * coordinate from the global locationStore (per the read-only invariant
 * documented there); Search/Map push their own screens and hand the
 * chosen coordinate back via route.params, same as drop-off already did.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  TouchableOpacity, ScrollView, Alert, Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { History, Calendar, Zap, ChevronRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { AppHeader } from '../../components/AppHeader';
import { AppMapView } from '../../components/AppMapView';
import { PickupOptionsSheet } from '../../components/PickupOptionsSheet';
import { Speakable } from '../../components/Speakable';
import { useLocationStore } from '../../store/locationStore';
import { rideApi, EstimateFareRequest, RideEstimate } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RidesStackParamList } from '../../navigation/types';

const VEHICLE_TYPES: { key: 'auto' | 'car'; label: string; emoji: string; hint?: string }[] = [
  { key: 'auto', label: 'Auto Rickshaw', emoji: '🛺' },
  { key: 'car', label: 'Car', emoji: '🚖', hint: 'Min. 15 km trips' },
];

type Coords = { lat: number; lng: number };
type BookingType = 'instant' | 'scheduled';

type Props = NativeStackScreenProps<RidesStackParamList, 'RideBooking'>;

export const RideBookingScreen: React.FC<Props> = ({ navigation, route }) => {
  // Read location from global store — never request here
  const { location: userLocation, address: userAddress, isLoading: locationLoading, error: locationError, permissionStatus } = useLocationStore();

  const [pickupMode, setPickupMode] = useState<'auto' | 'custom'>('auto');
  const [pickup, setPickup] = useState('');
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropoff, setDropoff] = useState('');
  const [dropCoords, setDropCoords] = useState<Coords | null>(null);
  const [vehicleType, setVehicleType] = useState<'auto' | 'car'>('auto');
  const [estimate, setEstimate] = useState<RideEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showPickupSheet, setShowPickupSheet] = useState(false);

  const [bookingType, setBookingType] = useState<BookingType>('instant');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [pickerStage, setPickerStage] = useState<'none' | 'date' | 'time'>('none');
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const idempKey = useRef(`ride-${Date.now()}`);

  // Receives the picked drop-off location back from LocationPickerScreen /
  // MapSelectionScreen (pushed with returnTo: {screen:'RideBooking', field:'dropoff'}).
  useEffect(() => {
    const dropoffParam = route.params?.dropoff;
    if (dropoffParam) {
      setDropoff(dropoffParam.address);
      setDropCoords({ lat: dropoffParam.lat, lng: dropoffParam.lng });
      setEstimate(null);
      navigation.setParams({ dropoff: undefined });
    }
  }, [route.params?.dropoff, navigation]);

  // Same hand-off, for pickup (Search / Map Selection options in PickupOptionsSheet).
  useEffect(() => {
    const pickupParam = route.params?.pickup;
    if (pickupParam) {
      setPickupMode('custom');
      setPickup(pickupParam.address);
      setPickupCoords({ lat: pickupParam.lat, lng: pickupParam.lng });
      setEstimate(null);
      navigation.setParams({ pickup: undefined });
    }
  }, [route.params?.pickup, navigation]);

  // Auto-detect mode mirrors the global location store's resolved
  // address/coordinate — only while pickupMode is 'auto', so a Search/Map
  // selection isn't silently overwritten the next time GPS updates.
  useEffect(() => {
    if (pickupMode === 'auto') {
      if (userAddress) setPickup(userAddress);
      if (userLocation) setPickupCoords(userLocation);
    }
  }, [pickupMode, userAddress, userLocation]);

  const handleAutoDetect = () => {
    setPickupMode('auto');
    if (userAddress) setPickup(userAddress);
    if (userLocation) setPickupCoords(userLocation);
    setEstimate(null);
    setShowPickupSheet(false);
  };

  const handlePickupSearch = () => {
    setShowPickupSheet(false);
    navigation.navigate('LocationPicker', { returnTo: { screen: 'RideBooking', field: 'pickup' } });
  };

  const handlePickupMap = () => {
    setShowPickupSheet(false);
    navigation.navigate('MapSelection', { returnTo: { screen: 'RideBooking', field: 'pickup' } });
  };

  // Android has no reliable inline date+time widget — the standard pattern
  // is two sequential native dialogs (date, then time), chained through
  // onChange rather than rendered together.
  const openSchedulePicker = () => {
    setPendingDate(scheduledAt ?? new Date(Date.now() + 30 * 60 * 1000));
    setPickerStage('date');
  };

  const handlePickerChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') setPickerStage('none');
    if (event.type === 'dismissed' || !selected) {
      if (Platform.OS !== 'android') setPickerStage('none');
      return;
    }

    if (pickerStage === 'date') {
      const merged = new Date(pendingDate ?? selected);
      merged.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setPendingDate(merged);
      setPickerStage('time');
    } else {
      const merged = new Date(pendingDate ?? selected);
      merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      if (merged.getTime() <= Date.now()) {
        Alert.alert('Invalid Time', 'Please choose a future date and time for your scheduled ride.');
        setPickerStage('none');
        return;
      }
      setScheduledAt(merged);
      setPickerStage('none');
    }
  };

  const handleEstimate = async () => {
    if (!pickupCoords || !dropCoords) {
      Alert.alert('Missing Location', 'Please set a pickup and drop-off location.');
      return;
    }
    if (bookingType === 'scheduled' && !scheduledAt) {
      Alert.alert('Pick a Time', 'Please choose a date & time for your scheduled ride.');
      return;
    }
    setEstimating(true);
    try {
      const payload: EstimateFareRequest = {
        vehicle_type: vehicleType,
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        drop_lat: dropCoords.lat,
        drop_lng: dropCoords.lng,
      };
      const data = await rideApi.estimateFare(payload);
      setEstimate(data);
    } catch (err: any) {
      Alert.alert('Estimate Unavailable', err?.response?.data?.error?.message || 'Please try again.');
    } finally { setEstimating(false); }
  };

  const handleBook = async () => {
    if (!estimate) { handleEstimate(); return; }
    if (!pickupCoords || !dropCoords) {
      Alert.alert('Missing Location', 'Please set a pickup and drop-off location.');
      return;
    }
    if (bookingType === 'scheduled' && !scheduledAt) {
      Alert.alert('Pick a Time', 'Please choose a date & time for your scheduled ride.');
      return;
    }
    setBooking(true);
    try {
      const payload: EstimateFareRequest = {
        vehicle_type: vehicleType,
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        drop_lat: dropCoords.lat,
        drop_lng: dropCoords.lng,
        booking_type: bookingType,
        scheduled_at: bookingType === 'scheduled' ? scheduledAt!.toISOString() : undefined,
      };
      const result = await rideApi.book(payload, idempKey.current);
      if (bookingType === 'scheduled') {
        Alert.alert(
          'Ride Scheduled',
          `Your ${vehicleType.toUpperCase()} is scheduled for ${scheduledAt!.toLocaleString()}. We'll match a driver closer to your pickup time.`,
        );
        navigation.navigate('RideHistory');
        return;
      }
      // `ride` is legitimately null when unmatched — navigate using
      // ride_request.id in that case, never ride.id (this was the original
      // null-crash bug from finding A; fixed here as a byproduct of the
      // typed response).
      navigation.navigate('RideTracking', { requestId: result.ride_request.id });
    } catch (err: any) {
      Alert.alert('Booking Failed', err?.response?.data?.error?.message || 'Could not book a ride. Please try again.');
    } finally { setBooking(false); }
  };

  const mapRegion = pickupCoords ? {
    latitude: dropCoords ? (pickupCoords.lat + dropCoords.lat) / 2 : pickupCoords.lat,
    longitude: dropCoords ? (pickupCoords.lng + dropCoords.lng) / 2 : pickupCoords.lng,
    latitudeDelta: dropCoords ? Math.max(0.02, Math.abs(pickupCoords.lat - dropCoords.lat) * 1.8) : 0.02,
    longitudeDelta: dropCoords ? Math.max(0.02, Math.abs(pickupCoords.lng - dropCoords.lng) * 1.8) : 0.02,
  } : undefined;

  const mapMarkers = [
    ...(pickupCoords ? [{ lat: pickupCoords.lat, lng: pickupCoords.lng, title: 'Pickup', color: theme.colors.success }] : []),
    ...(dropCoords ? [{ lat: dropCoords.lat, lng: dropCoords.lng, title: 'Drop-off', color: theme.colors.danger }] : []),
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <AppHeader
        variant="main"
        onLocationPress={() => navigation.navigate('LocationPicker')}
      />

      <View style={styles.actionsRow}>
        <Speakable text="Book a Ride" textStyle={styles.actionsTitle} />
        <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('RideHistory')}>
          <History color={theme.colors.primary} size={18} />
          <Text style={styles.historyBtnText}>Ride History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Map — only rendered after a pickup location is available */}
        <View style={styles.mapContainer}>
          <AppMapView
            isLoading={pickupMode === 'auto' && locationLoading}
            error={pickupMode === 'auto' ? locationError : null}
            permissionStatus={pickupMode === 'auto' ? permissionStatus : undefined}
            region={mapRegion}
            showsUserLocation={permissionStatus === 'granted'}
            routeCoords={estimate?.polyline ?? undefined}
            markers={mapMarkers.length ? mapMarkers : undefined}
          />
        </View>

        {/* Locations */}
        <View style={styles.locationCard}>
          <View style={styles.locRow}>
            <View style={styles.greenDot} />
            <TouchableOpacity
              style={styles.dropoffTouchable}
              activeOpacity={0.7}
              onPress={() => setShowPickupSheet(true)}
            >
              <Text style={pickup ? styles.dropoffText : styles.dropoffPlaceholder} numberOfLines={1}>
                {pickup || 'Set pickup location'}
              </Text>
              <ChevronRight color={theme.colors.textLight} size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.locRow}>
            <View style={styles.redDot} />
            <TouchableOpacity
              style={styles.dropoffTouchable}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('LocationPicker', { returnTo: { screen: 'RideBooking', field: 'dropoff' } })}
            >
              <Text style={dropoff ? styles.dropoffText : styles.dropoffPlaceholder} numberOfLines={1}>
                {dropoff || 'Drop-off location'}
              </Text>
              <ChevronRight color={theme.colors.textLight} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle Type Selection */}
        <Speakable text="Choose Vehicle Type" textStyle={styles.sectionTitle} containerStyle={styles.sectionTitleRow} />
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
              {v.hint ? <Text style={styles.vehicleHint}>{v.hint}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* Instant vs Schedule Booking */}
        <Speakable text="When do you need this ride?" textStyle={styles.sectionTitle} containerStyle={styles.sectionTitleRow} />
        <View style={styles.bookingTypeRow}>
          <TouchableOpacity
            style={[styles.bookingTypeChip, bookingType === 'instant' && styles.bookingTypeChipActive]}
            onPress={() => { setBookingType('instant'); setEstimate(null); }}
            activeOpacity={0.85}
          >
            <Zap size={16} color={bookingType === 'instant' ? theme.colors.primary : theme.colors.textMuted} />
            <Text style={[styles.bookingTypeLabel, bookingType === 'instant' && styles.bookingTypeLabelActive]}>Instant</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bookingTypeChip, bookingType === 'scheduled' && styles.bookingTypeChipActive]}
            onPress={() => { setBookingType('scheduled'); setEstimate(null); }}
            activeOpacity={0.85}
          >
            <Calendar size={16} color={bookingType === 'scheduled' ? theme.colors.primary : theme.colors.textMuted} />
            <Text style={[styles.bookingTypeLabel, bookingType === 'scheduled' && styles.bookingTypeLabelActive]}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {bookingType === 'scheduled' && (
          <TouchableOpacity style={styles.scheduleRow} activeOpacity={0.8} onPress={openSchedulePicker}>
            <Calendar color={theme.colors.primary} size={18} />
            <Text style={styles.scheduleText}>
              {scheduledAt ? scheduledAt.toLocaleString() : 'Pick a date & time'}
            </Text>
            <ChevronRight color={theme.colors.textLight} size={16} />
          </TouchableOpacity>
        )}

        {pickerStage !== 'none' && (
          <DateTimePicker
            value={pendingDate ?? new Date()}
            mode={pickerStage}
            is24Hour={false}
            minimumDate={new Date()}
            onChange={handlePickerChange}
          />
        )}

        {/* Fare Estimate */}
        {estimate && (
          <View style={styles.estimateCard}>
            <View style={styles.estimateTop}>
              <Text style={styles.fareLabel}>Estimated Fare</Text>
              <Text style={styles.fareAmount}>₹{estimate.fare}</Text>
            </View>
            <View style={styles.estimateDetails}>
              <Text style={styles.estimateDetail}>📍 {estimate.distance_km.toFixed(1)} km</Text>
              <Text style={styles.estimateDetail}>⏱️ ~{estimate.duration_min} min</Text>
              <Text style={styles.estimateDetail}>🚗 {vehicleType.toUpperCase()}</Text>
            </View>
            <Text style={styles.adminNote}>
              * Fare calculated as per GoOne platform rates (configured by admin)
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!estimate ? (
          <Button title={estimating ? '' : 'Get Fare Estimate'} onPress={handleEstimate} loading={estimating} size="large" fullWidth variant="outline" />
        ) : (
          <Button
            title={booking ? '' : bookingType === 'scheduled'
              ? `Schedule ${vehicleType.toUpperCase()} — ₹${estimate.fare}`
              : `Book ${vehicleType.toUpperCase()} NOW — ₹${estimate.fare}`}
            onPress={handleBook}
            loading={booking}
            size="large"
            fullWidth
          />
        )}
      </View>

      <PickupOptionsSheet
        visible={showPickupSheet}
        onClose={() => setShowPickupSheet(false)}
        onAutoDetect={handleAutoDetect}
        onSearch={handlePickupSearch}
        onMapSelect={handlePickupMap}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md },
  mapContainer: { width: '100%', height: 200, borderRadius: theme.radius.xl, overflow: 'hidden', marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border },
  locationCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greenDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.success },
  redDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.danger },
  dividerLine: { height: 24, width: 1.5, backgroundColor: theme.colors.border, marginLeft: 5, marginVertical: 4 },
  sectionTitle: { ...theme.typography.captionBold, textTransform: 'uppercase', color: theme.colors.text },
  sectionTitleRow: { marginBottom: 12 },
  vehicleRow: { flexDirection: 'row', gap: 12, marginBottom: theme.spacing.xl },
  vehicleCard: { flex: 1, alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, borderWidth: 2, borderColor: theme.colors.border, ...theme.shadows.sm },
  vehicleCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight, ...theme.shadows.primary },
  vehicleLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, textAlign: 'center' },
  vehicleLabelActive: { color: theme.colors.primary },
  bookingTypeRow: { flexDirection: 'row', gap: 12, marginBottom: theme.spacing.md },
  bookingTypeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  bookingTypeChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  bookingTypeLabel: { ...theme.typography.bodyMedium, color: theme.colors.textMuted },
  bookingTypeLabelActive: { color: theme.colors.primary },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.border, padding: 14, marginBottom: theme.spacing.xl },
  scheduleText: { ...theme.typography.bodyMedium, flex: 1, color: theme.colors.text },
  estimateCard: { backgroundColor: theme.colors.primaryLight, borderRadius: theme.radius.lg, padding: 20, marginBottom: theme.spacing.xl, borderWidth: 1.5, borderColor: theme.colors.primary },
  estimateTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fareLabel: { ...theme.typography.h4, color: theme.colors.primary },
  fareAmount: { fontSize: 28, fontWeight: '900', color: theme.colors.primary },
  estimateDetails: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  estimateDetail: { ...theme.typography.body, color: theme.colors.textMuted, fontSize: 13 },
  adminNote: { fontSize: 10, color: theme.colors.textLight, fontStyle: 'italic' },
  footer: { padding: theme.spacing.md },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
  actionsTitle: { ...theme.typography.h2 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.primaryLight, backgroundColor: theme.colors.primaryLight },
  historyBtnText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  dropoffTouchable: { flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, paddingHorizontal: 14 },
  dropoffText: { fontSize: 15, color: theme.colors.text, flex: 1 },
  dropoffPlaceholder: { fontSize: 15, color: theme.colors.textLight, flex: 1 },
  vehicleHint: { fontSize: 10, color: theme.colors.textLight, marginTop: 4, textAlign: 'center' },
});

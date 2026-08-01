/**
 * GoOne Customer App — Map Selection
 * The 3rd pickup/drop-off option (alongside Auto Detect / Search): a
 * fixed center pin over a draggable map ("drag the map, not the pin" —
 * avoids needing a native-draggable Marker, which is flaky on Android
 * Fabric). Reverse-geocodes the map center as it settles and hands the
 * chosen coordinate back via the same `returnTo` pattern LocationPicker
 * uses, so any screen (RideBooking pickup/dropoff, Checkout, ...) can
 * push this screen without bespoke wiring.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MapPin, LocateFixed } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Region } from 'react-native-maps';
import { theme } from '../../theme/theme';
import { AppHeader } from '../../components/AppHeader';
import { AppMapView, AppMapViewHandle } from '../../components/AppMapView';
import { Button } from '../../components/Button';
import { TouchableOpacity } from 'react-native';
import { placesApi } from '../../api/client';
import { useLocationStore } from '../../store/locationStore';
import type { LocationPickerParams } from '../../navigation/types';

const DEFAULT_REGION: Region = { latitude: 12.9716, longitude: 77.5946, latitudeDelta: 0.02, longitudeDelta: 0.02 };
const GEOCODE_DEBOUNCE_MS = 500;

interface MapSelectionRoute {
  params?: LocationPickerParams;
}

export const MapSelectionScreen: React.FC<{ navigation: any; route: MapSelectionRoute }> = ({ navigation, route }) => {
  const { location: currentLocation } = useLocationStore();
  const mapRef = useRef<AppMapViewHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialRegion: Region = currentLocation
    ? { latitude: currentLocation.lat, longitude: currentLocation.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : DEFAULT_REGION;

  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: initialRegion.latitude, lng: initialRegion.longitude });
  const [address, setAddress] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const resolveAddress = useCallback((lat: number, lng: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsResolving(true);
      try {
        const result = await placesApi.reverseGeocode(lat, lng);
        setAddress(result?.formattedAddress ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } catch {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } finally {
        setIsResolving(false);
      }
    }, GEOCODE_DEBOUNCE_MS);
  }, []);

  const handleRegionChangeComplete = (region: Region) => {
    const next = { lat: region.latitude, lng: region.longitude };
    setCenter(next);
    resolveAddress(next.lat, next.lng);
  };

  const handleRecenter = () => {
    if (!currentLocation) return;
    mapRef.current?.animateToRegion({
      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      let finalAddress = address;
      if (!finalAddress) {
        const result = await placesApi.reverseGeocode(center.lat, center.lng);
        finalAddress = result?.formattedAddress ?? `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`;
      }

      const returnTo = route?.params?.returnTo;
      const picked = { address: finalAddress, lat: center.lat, lng: center.lng };
      if (returnTo) {
        navigation.navigate(returnTo.screen, { [returnTo.field]: picked });
      } else {
        navigation.goBack();
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader variant="sub" title="Choose on Map" />

      <View style={styles.mapWrap}>
        <AppMapView
          ref={mapRef}
          initialRegion={initialRegion}
          showsUserLocation
          onRegionChangeComplete={handleRegionChangeComplete}
        />

        {/* Fixed center pin — the map moves underneath it, not the other way round */}
        <View pointerEvents="none" style={styles.pinWrap}>
          <MapPin color={theme.colors.primary} size={40} fill={theme.colors.primary} fillOpacity={0.15} />
        </View>

        {currentLocation && (
          <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter} activeOpacity={0.8}>
            <LocateFixed color={theme.colors.primary} size={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.addressRow}>
          <MapPin color={theme.colors.textMuted} size={16} />
          {isResolving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 8 }} />
          ) : (
            <Text style={styles.addressText} numberOfLines={2}>{address || 'Move the map to select a location'}</Text>
          )}
        </View>
        <Button
          title={confirming ? '' : 'Confirm Location'}
          onPress={handleConfirm}
          loading={confirming}
          size="large"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  mapWrap: { flex: 1 },
  pinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
  },
  recenterBtn: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  addressText: { ...theme.typography.body, flex: 1 },
});

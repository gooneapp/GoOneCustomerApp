/**
 * GoOne Customer App — AppMapView
 * Thin wrapper around react-native-maps' MapView. Centralizes the
 * Android/iOS provider split and gives a consistent loading /
 * permission-denied state instead of every screen silently falling
 * back to a hardcoded coordinate.
 *
 * Also owns: the "blue dot" current-location layer, an optional route
 * polyline (pickup → drop), and an imperative `animateToRegion` handle so
 * callers can drive a "recenter" button without reaching into MapView
 * internals themselves.
 */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import { theme } from '../theme/theme';
import type { PermissionStatus } from '../store/locationStore';

export interface AppMapMarker {
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  color?: string;
  onPress?: () => void;
}

export interface AppMapViewHandle {
  animateToRegion: (region: Region, durationMs?: number) => void;
}

interface AppMapViewProps {
  region?: Region;
  initialRegion?: Region;
  markers?: AppMapMarker[];
  /** Route path (already-decoded lat/lng points) drawn between pickup and drop. */
  routeCoords?: { lat: number; lng: number }[];
  isLoading?: boolean;
  error?: string | null;
  permissionStatus?: PermissionStatus;
  /** Shows the native "blue dot" — only meaningful once location permission is granted. */
  showsUserLocation?: boolean;
  onRegionChangeComplete?: (region: Region) => void;
  onMapPress?: (coord: { lat: number; lng: number }) => void;
  style?: any;
  children?: React.ReactNode;
}

export const AppMapView = forwardRef<AppMapViewHandle, AppMapViewProps>(({
  region,
  initialRegion,
  markers,
  routeCoords,
  isLoading,
  error,
  permissionStatus,
  showsUserLocation,
  onRegionChangeComplete,
  onMapPress,
  style,
  children,
}, ref) => {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (r: Region, durationMs = 400) => mapRef.current?.animateToRegion(r, durationMs),
  }));

  if (isLoading) {
    return (
      <View style={[styles.messageContainer, style]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (permissionStatus === 'denied' || permissionStatus === 'blocked') {
    return (
      <View style={[styles.messageContainer, style]}>
        <MapPin color={theme.colors.textLight} size={32} />
        <Text style={styles.messageText}>
          Location access is needed to show the map. Enable it in Settings.
        </Text>
      </View>
    );
  }

  if (error && !region && !initialRegion) {
    return (
      <View style={[styles.messageContainer, style]}>
        <MapPin color={theme.colors.textLight} size={32} />
        <Text style={styles.messageText}>{error}</Text>
      </View>
    );
  }

  if (!region && !initialRegion) {
    return (
      <View style={[styles.messageContainer, style]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      style={[styles.map, style]}
      region={region}
      initialRegion={initialRegion}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      zoomEnabled
      scrollEnabled
      rotateEnabled
      pitchEnabled
      loadingEnabled
      onRegionChangeComplete={onRegionChangeComplete}
      onPress={onMapPress ? (e) => onMapPress({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude }) : undefined}
    >
      {routeCoords && routeCoords.length > 1 && (
        <Polyline
          coordinates={routeCoords.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
          strokeColor={theme.colors.primary}
          strokeWidth={4}
        />
      )}
      {markers?.map((marker, idx) => (
        <Marker
          key={idx}
          coordinate={{ latitude: marker.lat, longitude: marker.lng }}
          title={marker.title}
          description={marker.description}
          pinColor={marker.color}
          onCalloutPress={marker.onPress}
        />
      ))}
      {children}
    </MapView>
  );
});

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
  messageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.spacing.lg,
    gap: 8,
  },
  messageText: {
    ...theme.typography.caption,
    textAlign: 'center',
  },
});

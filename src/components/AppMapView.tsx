/**
 * GoOne Customer App — AppMapView
 * Thin wrapper around react-native-maps' MapView. Centralizes the
 * Android/iOS provider split and gives a consistent loading /
 * permission-denied state instead of every screen silently falling
 * back to a hardcoded coordinate.
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import { theme } from '../theme/theme';
import type { PermissionStatus } from '../store/locationStore';

export interface AppMapMarker {
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  onPress?: () => void;
}

interface AppMapViewProps {
  region?: Region;
  initialRegion?: Region;
  markers?: AppMapMarker[];
  isLoading?: boolean;
  error?: string | null;
  permissionStatus?: PermissionStatus;
  style?: any;
  children?: React.ReactNode;
}

export const AppMapView: React.FC<AppMapViewProps> = ({
  region,
  initialRegion,
  markers,
  isLoading,
  error,
  permissionStatus,
  style,
  children,
}) => {
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
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      style={[styles.map, style]}
      region={region}
      initialRegion={initialRegion}
    >
      {markers?.map((marker, idx) => (
        <Marker
          key={idx}
          coordinate={{ latitude: marker.lat, longitude: marker.lng }}
          title={marker.title}
          description={marker.description}
          onCalloutPress={marker.onPress}
        />
      ))}
      {children}
    </MapView>
  );
};

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

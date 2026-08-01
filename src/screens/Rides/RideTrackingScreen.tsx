import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { AppMapView } from '../../components/AppMapView';
import { useLocationStore } from '../../store/locationStore';
import { rideApi, ActiveRideDto } from '../../api/client';
import { SpeakerIcon } from '../../components/Speakable';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RidesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RidesStackParamList, 'RideTracking'>;

export const RideTrackingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { requestId } = route.params || {};
  const [ride, setRide] = useState<ActiveRideDto | null>(null);
  const [loading, setLoading] = useState(true);
  // Read-only — RideTrackingScreen never requests location permission itself.
  const { location: riderLocation, isLoading: locationLoading, error: locationError, permissionStatus } = useLocationStore();

  useEffect(() => {
    // Async-unmount-safety (finding P): guard every setState triggered by an
    // in-flight poll response with isMounted, mirroring the pattern in
    // GoOnePartnerApp's ActiveRideScreen.tsx — a request kicked off just
    // before this screen unmounts must not call setState afterwards.
    let isMounted = true;

    rideApi.getActive()
      .then((r) => { if (isMounted) setRide(r); })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading(false); });

    const t = setInterval(() => {
      rideApi.getActive()
        .then((r) => { if (isMounted) setRide(r); })
        .catch(() => {});
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(t);
    };
  }, [requestId]);

  const markers = [
    ...(riderLocation ? [{ lat: riderLocation.lat, lng: riderLocation.lng, title: 'Your Location' }] : []),
  ];

  const handleCancel = () => {
    const idToCancel = ride?.request_id || requestId;
    rideApi.cancel(idToCancel, 'customer_cancelled').then(() => navigation.goBack());
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ArrowLeft color="#fff" size={24} /></TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Live Tracking</Text>
          <SpeakerIcon text="Live Tracking. Your ride is on the way." color="#fff" />
        </View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.mapContainer}>
        <AppMapView
          isLoading={locationLoading}
          error={locationError}
          permissionStatus={permissionStatus}
          initialRegion={riderLocation ? {
            latitude: riderLocation.lat,
            longitude: riderLocation.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          } : undefined}
          markers={markers}
        />
      </View>
      <View style={styles.rideCard}>
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : (
          <>
            <Text style={styles.status}>{(ride?.status || 'searching').replace(/_/g, ' ').toUpperCase()}</Text>
            {ride?.partner && <Text style={styles.driver}>🚗 {ride.partner.name} is on the way ({ride.partner.phone})</Text>}
            {ride?.otp_code && <Text style={styles.otp}>Share OTP with driver: {ride.otp_code}</Text>}
            <Text style={styles.fare}>Fare: ₹{ride?.fare_amount ?? '—'}</Text>
            <Button title="Cancel Ride" variant="danger" onPress={() => Alert.alert('Cancel Ride', 'Cancel this ride?', [{ text: 'No' }, { text: 'Yes', onPress: handleCancel }])} style={{ marginTop: 16 }} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingVertical: 12, backgroundColor: theme.colors.secondary, ...theme.shadows.sm },
  backBtn: { padding: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { ...theme.typography.h3, color: '#fff' },
  mapContainer: { flex: 1, backgroundColor: theme.colors.secondary },
  rideCard: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl, ...theme.shadows.lg },
  status: { fontSize: 18, fontWeight: '900', color: theme.colors.secondary, marginBottom: 8 },
  driver: { ...theme.typography.h4, marginBottom: 8 },
  otp: { ...theme.typography.bodyMedium, color: theme.colors.primary, marginBottom: 8 },
  fare: { ...theme.typography.subtitle },
});

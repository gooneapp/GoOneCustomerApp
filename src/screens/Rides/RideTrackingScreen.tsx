import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { AppMapView } from '../../components/AppMapView';
import { useLocationStore } from '../../store/locationStore';
import { rideApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
export const RideTrackingScreen: React.FC<any> = ({ route, navigation }) => {
  const { rideId } = route.params || {};
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Read-only — RideTrackingScreen never requests location permission itself.
  const { location: riderLocation, isLoading: locationLoading, error: locationError, permissionStatus } = useLocationStore();
  useEffect(() => {
    rideApi.getActive().then(setRide).catch(() => { }).finally(() => setLoading(false));
    const t = setInterval(() => rideApi.getActive().then(setRide).catch(() => { }), 10000);
    return () => clearInterval(t);
  }, [rideId]);

  const driverLocation = ride?.driver?.location;
  const markers = [
    ...(riderLocation ? [{ lat: riderLocation.lat, lng: riderLocation.lng, title: 'Your Location' }] : []),
    ...(driverLocation?.lat != null && driverLocation?.lng != null
      ? [{ lat: driverLocation.lat, lng: driverLocation.lng, title: 'Driver' }]
      : []),
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ArrowLeft color="#fff" size={24} /></TouchableOpacity>
        <Text style={styles.title}>Live Tracking</Text>
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
            {ride?.driver && <Text style={styles.driver}>🚗 {ride.driver.name} is on the way</Text>}
            <Text style={styles.fare}>Fare: ₹{ride?.estimated_fare || '—'}</Text>
            <Button title="Cancel Ride" variant="danger" onPress={() => Alert.alert('Cancel Ride', 'Cancel this ride?', [{ text: 'No' }, { text: 'Yes', onPress: () => rideApi.cancel(rideId, 'customer_cancelled').then(() => navigation.goBack()) }])} style={{ marginTop: 16 }} />
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
  title: { ...theme.typography.h3, color: '#fff' },
  mapContainer: { flex: 1, backgroundColor: theme.colors.secondary },
  rideCard: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl, ...theme.shadows.lg },
  status: { fontSize: 18, fontWeight: '900', color: theme.colors.secondary, marginBottom: 8 },
  driver: { ...theme.typography.h4, marginBottom: 8 },
  fare: { ...theme.typography.subtitle },
});

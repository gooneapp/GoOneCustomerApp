import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { Button } from '../../components/index';
import { rideApi } from '../../api/client';
const STEPS = ['searching','driver_found','arriving','in_ride','completed'];
export const RideTrackingScreen: React.FC<any> = ({ route, navigation }) => {
  const { rideId } = route.params || {};
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    rideApi.getActive().then(setRide).catch(() => {}).finally(() => setLoading(false));
    const t = setInterval(() => rideApi.getActive().then(setRide).catch(() => {}), 10000);
    return () => clearInterval(t);
  }, [rideId]);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ArrowLeft color="#fff" size={24} /></TouchableOpacity>
        <Text style={styles.title}>Live Tracking</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.mapPlaceholder}><Navigation color="#fff" size={60} /><Text style={styles.mapText}>Map View</Text><Text style={styles.mapSub}>(Requires Maps Integration)</Text></View>
      <View style={styles.rideCard}>
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : (
          <>
            <Text style={styles.status}>{(ride?.status || 'searching').replace(/_/g,' ').toUpperCase()}</Text>
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
  mapPlaceholder: { flex: 1, backgroundColor: theme.colors.secondary, justifyContent: 'center', alignItems: 'center' },
  mapText: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 16 },
  mapSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  rideCard: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl, ...theme.shadows.lg },
  status: { fontSize: 18, fontWeight: '900', color: theme.colors.secondary, marginBottom: 8 },
  driver: { ...theme.typography.h4, marginBottom: 8 },
  fare: { ...theme.typography.subtitle },
});

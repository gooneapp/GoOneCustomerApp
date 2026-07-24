import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, Phone, MapPin, Search } from 'lucide-react-native';
import { Button } from '../components/Button';

export const RideTrackingScreen: React.FC<any> = ({ route, navigation }) => {
  const { rideType, dropLocation } = route.params || {};
  const [status, setStatus] = useState('searching'); // searching, matched, arriving, started, completed
  const [driver, setDriver] = useState<any>(null);

  useEffect(() => {
    // Mock ride progression
    const t1 = setTimeout(() => {
      setStatus('matched');
      setDriver({ name: 'Kumar V.', vehicle: 'TN 55 CX 9901', rating: '4.8', otp: '4912' });
    }, 4000);
    
    return () => clearTimeout(t1);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MainTabs')}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapMockup}>
        <Text style={styles.mapText}>Live Tracking Map</Text>
      </View>

      <View style={styles.bottomSheet}>
        {status === 'searching' ? (
          <View style={styles.searchingContainer}>
            <Search color={theme.colors.primary} size={48} style={{ marginBottom: 16 }} />
            <Text style={styles.searchingTitle}>Finding your ride...</Text>
            <Text style={styles.searchingSub}>Contacting nearby {rideType?.replace('_', ' ')} partners</Text>
            <Button title="Cancel Request" onPress={() => navigation.goBack()} variant="outline" style={{ marginTop: 24, width: '100%' }} />
          </View>
        ) : (
          <View style={styles.matchedContainer}>
            <Text style={styles.statusTitle}>Driver is on the way</Text>
            
            <View style={styles.driverCard}>
              <View style={styles.driverAvatar} />
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver?.name}</Text>
                <Text style={styles.driverVehicle}>{driver?.vehicle} • ⭐ {driver?.rating}</Text>
              </View>
              <TouchableOpacity style={styles.phoneBtn}>
                <Phone color={theme.colors.background} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.otpBox}>
              <Text style={styles.otpLabel}>Give this PIN to driver</Text>
              <Text style={styles.otpValue}>{driver?.otp}</Text>
            </View>

            <View style={styles.locationBox}>
              <View style={styles.locRow}>
                <View style={styles.dot} />
                <Text style={styles.locText} numberOfLines={1}>Current Location</Text>
              </View>
              <View style={styles.locLine} />
              <View style={styles.locRow}>
                <MapPin color={theme.colors.danger} size={14} />
                <Text style={styles.locText} numberOfLines={1}>{dropLocation}</Text>
              </View>
            </View>

            <Button 
              title="Share Trip Details" 
              onPress={() => {}} 
              variant="outline" 
              style={{ marginTop: 16 }} 
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'rgba(9, 13, 22, 0.8)',
  },
  backBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  headerTitle: { ...theme.typography.h3 },
  mapMockup: {
    flex: 1,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: { color: theme.colors.textMuted, fontSize: 18, fontWeight: '600' },
  bottomSheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  searchingContainer: { alignItems: 'center', paddingVertical: 20 },
  searchingTitle: { ...theme.typography.h2, marginBottom: 8 },
  searchingSub: { ...theme.typography.body, color: theme.colors.textMuted },
  matchedContainer: {},
  statusTitle: { ...theme.typography.h2, marginBottom: 20, textAlign: 'center' },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  driverAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, marginRight: 12 },
  driverInfo: { flex: 1 },
  driverName: { ...theme.typography.body, fontWeight: '700', fontSize: 16 },
  driverVehicle: { ...theme.typography.caption, marginTop: 4 },
  phoneBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center'
  },
  otpBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: 16,
  },
  otpLabel: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600', marginBottom: 4 },
  otpValue: { fontSize: 32, fontWeight: '800', color: theme.colors.text, letterSpacing: 4 },
  locationBox: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  locRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary, marginLeft: 1 },
  locText: { ...theme.typography.body, marginLeft: 12, flex: 1 },
  locLine: { width: 2, height: 20, backgroundColor: theme.colors.border, marginLeft: 6, marginVertical: 4 },
});

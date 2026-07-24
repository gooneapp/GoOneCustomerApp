import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, MapPin, Navigation, Car, Users } from 'lucide-react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const BookRideScreen: React.FC<any> = ({ navigation }) => {
  const [pickup, setPickup] = useState('Current Location (Erode)');
  const [drop, setDrop] = useState('');
  const [selectedRide, setSelectedRide] = useState('auto'); // auto, car_mini, car_sedan

  const rideOptions = [
    { id: 'auto', name: 'GoOne Auto', desc: 'Affordable, quick rides', time: '3 min', price: '₹65', minKm: 5, icon: <Car color={theme.colors.primary} size={32} /> },
    { id: 'car_mini', name: 'GoOne Mini', desc: 'Comfy hatchbacks', time: '5 min', price: '₹140', minKm: 15, icon: <Car color={theme.colors.warning} size={32} /> },
    { id: 'car_sedan', name: 'GoOne Sedan', desc: 'Spacious sedans', time: '7 min', price: '₹180', minKm: 15, icon: <Car color={theme.colors.success} size={32} /> },
  ];

  const handleBook = () => {
    if (!drop) return;
    navigation.navigate('RideTracking', { rideType: selectedRide, dropLocation: drop });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Map Placeholder */}
        <View style={styles.mapMockup}>
          <Text style={styles.mapText}>Select Location on Map</Text>
        </View>

        {/* Location Inputs */}
        <View style={styles.card}>
          <Input 
            placeholder="Pickup Location"
            value={pickup}
            onChangeText={setPickup}
            leftIcon={<Navigation color={theme.colors.primary} size={18} />}
          />
          <View style={styles.divider} />
          <Input 
            placeholder="Where to? (Drop Location)"
            value={drop}
            onChangeText={setDrop}
            leftIcon={<MapPin color={theme.colors.danger} size={18} />}
            autoFocus
          />
        </View>

        {/* Ride Options */}
        <Text style={styles.sectionTitle}>Available Rides</Text>
        <View style={styles.rideOptions}>
          {rideOptions.map((ride) => (
            <TouchableOpacity 
              key={ride.id} 
              style={[styles.rideCard, selectedRide === ride.id && styles.rideCardSelected]}
              onPress={() => setSelectedRide(ride.id)}
            >
              <View style={styles.rideIconBox}>
                {ride.icon}
              </View>
              <View style={styles.rideInfo}>
                <Text style={styles.rideName}>{ride.name}</Text>
                <Text style={styles.rideDesc}>{ride.desc}</Text>
                {ride.id === 'auto' ? (
                  <Text style={styles.rideRules}>Min {ride.minKm}km</Text>
                ) : (
                  <Text style={styles.rideRules}>Min {ride.minKm}km outstation</Text>
                )}
              </View>
              <View style={styles.ridePriceCol}>
                <Text style={styles.ridePrice}>{ride.price}</Text>
                <Text style={styles.rideTime}>{ride.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={`Confirm ${rideOptions.find(r => r.id === selectedRide)?.name}`} 
          onPress={handleBook} 
          size="large"
          disabled={!drop}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { ...theme.typography.h3 },
  scroll: { padding: theme.spacing.md, gap: theme.spacing.md },
  mapMockup: {
    height: 180,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapText: { color: theme.colors.textMuted, fontSize: 16, fontWeight: '600' },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  divider: { height: 1, backgroundColor: theme.colors.border, marginBottom: 16, marginLeft: 36 },
  sectionTitle: { ...theme.typography.h3, marginTop: 8, marginBottom: 8 },
  rideOptions: { gap: 12 },
  rideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
  },
  rideCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  rideIconBox: { width: 48, alignItems: 'center' },
  rideInfo: { flex: 1, marginLeft: 12 },
  rideName: { ...theme.typography.body, fontWeight: '700' },
  rideDesc: { ...theme.typography.caption, marginTop: 2 },
  rideRules: { ...theme.typography.caption, color: theme.colors.warning, marginTop: 2 },
  ridePriceCol: { alignItems: 'flex-end' },
  ridePrice: { ...theme.typography.h3, fontSize: 18 },
  rideTime: { ...theme.typography.caption, color: theme.colors.primary, marginTop: 4 },
  footer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  }
});

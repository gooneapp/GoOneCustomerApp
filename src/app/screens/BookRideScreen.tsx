import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';

export const BookRideScreen: React.FC<{ onRideBooked: (rideId: string) => void }> = ({ onRideBooked }) => {
  const [vehicleType, setVehicleType] = useState<'auto' | 'car'>('auto');
  const [pickup, setPickup] = useState('Erode Bus Stand');
  const [drop, setDrop] = useState('Perundurai Road, Erode');

  const minDistanceKm = vehicleType === 'auto' ? 5 : 15;
  const estimatedFare = vehicleType === 'auto' ? 140 : 380;

  const handleConfirmBooking = () => {
    if (!pickup || !drop) {
      Alert.alert('Incomplete Address', 'Please specify both pickup and drop-off locations.');
      return;
    }

    Alert.alert(
      'Ride Request Broadcast',
      `Looking for nearby ${vehicleType.toUpperCase()} drivers within minimum distance (${minDistanceKm} km)...`,
      [
        {
          text: 'Proceed to Live Tracking',
          onPress: () => onRideBooked(`RIDE-${Date.now().toString().slice(-6)}`),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book a Ride (GoOne Ride)</Text>
      <Text style={styles.subtitle}>
        On-demand Auto & Car rides connecting rural clusters to towns with verified local drivers.
      </Text>

      {/* Vehicle Type Selection */}
      <View style={styles.vehicleGroup}>
        <TouchableOpacity
          style={[styles.vehicleBtn, vehicleType === 'auto' && styles.vehicleBtnActive]}
          onPress={() => setVehicleType('auto')}
        >
          <Text style={styles.vehicleIcon}>🛺</Text>
          <Text style={[styles.vehicleTitle, vehicleType === 'auto' && styles.textActive]}>Auto Rickshaw</Text>
          <Text style={styles.vehicleSub}>Min 5 km threshold</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.vehicleBtn, vehicleType === 'car' && styles.vehicleBtnActive]}
          onPress={() => setVehicleType('car')}
        >
          <Text style={styles.vehicleIcon}>🚗</Text>
          <Text style={[styles.vehicleTitle, vehicleType === 'car' && styles.textActive]}>Car / Taxi</Text>
          <Text style={styles.vehicleSub}>Min 15 km threshold</Text>
        </TouchableOpacity>
      </View>

      {/* Locations */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Pickup Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pickup point"
          placeholderTextColor="#6b7280"
          value={pickup}
          onChangeText={setPickup}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Drop-off Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter drop destination"
          placeholderTextColor="#6b7280"
          value={drop}
          onChangeText={setDrop}
        />
      </View>

      {/* Fare Breakdown */}
      <View style={styles.fareCard}>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Vehicle Type:</Text>
          <Text style={styles.fareVal}>{vehicleType.toUpperCase()}</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Min Distance Threshold:</Text>
          <Text style={styles.fareVal}>{minDistanceKm} Km</Text>
        </View>
        <View style={[styles.fareRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
          <Text style={styles.totalLabel}>Estimated Fare:</Text>
          <Text style={styles.totalVal}>₹{estimatedFare}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.bookBtn} onPress={handleConfirmBooking}>
        <Text style={styles.bookBtnText}>Book {vehicleType.toUpperCase()} Ride</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#9ca3af', marginBottom: 20, lineHeight: 18 },
  vehicleGroup: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  vehicleBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  vehicleBtnActive: { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.12)' },
  vehicleIcon: { fontSize: 32, marginBottom: 8 },
  vehicleTitle: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  vehicleSub: { color: '#9ca3af', fontSize: 11, marginTop: 2 },
  textActive: { color: '#60a5fa' },
  formGroup: { marginBottom: 14 },
  label: { color: '#9ca3af', fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
  },
  fareCard: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  fareLabel: { color: '#9ca3af', fontSize: 13 },
  fareVal: { color: '#ffffff', fontWeight: '600', fontSize: 13 },
  totalLabel: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  totalVal: { color: '#34d399', fontWeight: 'bold', fontSize: 20 },
  bookBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  bookBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});

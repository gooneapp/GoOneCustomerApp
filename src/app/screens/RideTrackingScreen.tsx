import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export const RideTrackingScreen: React.FC<{ rideId: string; onTripFinished: () => void }> = ({
  rideId,
  onTripFinished,
}) => {
  const [otp] = useState('4829'); // Ride OTP to share with driver
  const [driverName] = useState('Senthil Kumar (Auto)');
  const [driverPhone] = useState('+91 98123 45671');
  const [vehiclePlate] = useState('TN 38 CD 5678');
  const [rideStatus, setRideStatus] = useState<'driver_assigned' | 'trip_started' | 'completed'>('driver_assigned');

  const handleTriggerSos = () => {
    Alert.alert(
      '🚨 EMERGENCY SOS TRIGGERED',
      'An emergency signal has been broadcast to GoOne Support, local contacts, and admin hotline with your GPS coordinates.',
      [{ text: 'Acknowledge', style: 'destructive' }],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Ride Tracking</Text>
      <Text style={styles.subtitle}>Ride ID: {rideId}</Text>

      {/* Driver Card */}
      <View style={styles.card}>
        <View style={styles.driverRow}>
          <Text style={styles.driverAvatar}>🛺</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{driverName}</Text>
            <Text style={styles.vehiclePlate}>{vehiclePlate}</Text>
            <Text style={styles.driverPhone}>{driverPhone}</Text>
          </View>
        </View>

        {/* Ride OTP Display Box */}
        <View style={styles.otpBox}>
          <Text style={styles.otpLabel}>SHARE THIS RIDE OTP WITH DRIVER TO START TRIP:</Text>
          <Text style={styles.otpCode}>{otp}</Text>
        </View>
      </View>

      {/* Ride Status Progress */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Trip Status:</Text>
        <Text style={styles.statusVal}>
          {rideStatus === 'driver_assigned' && 'Driver Arriving at Pickup'}
          {rideStatus === 'trip_started' && 'Trip In Progress — En Route to Destination'}
          {rideStatus === 'completed' && 'Trip Completed Successfully'}
        </Text>
      </View>

      {/* Emergency SOS Button */}
      <TouchableOpacity style={styles.sosBtn} onPress={handleTriggerSos}>
        <Text style={styles.sosBtnText}>🚨 EMERGENCY SOS</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() => {
          setRideStatus('completed');
          onTripFinished();
        }}
      >
        <Text style={styles.doneBtnText}>Complete & Finish Ride</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#9ca3af', marginBottom: 20 },
  card: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  driverAvatar: { fontSize: 36 },
  driverName: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  vehiclePlate: { color: '#38bdf8', fontWeight: 'bold', fontSize: 14, marginVertical: 2 },
  driverPhone: { color: '#9ca3af', fontSize: 13 },
  otpBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  otpLabel: { color: '#60a5fa', fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  otpCode: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', letterSpacing: 6 },
  statusBox: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusTitle: { color: '#9ca3af', fontSize: 12, marginBottom: 4 },
  statusVal: { color: '#34d399', fontWeight: 'bold', fontSize: 15 },
  sosBtn: {
    backgroundColor: '#be123c',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  sosBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  doneBtn: {
    backgroundColor: '#374151',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
});

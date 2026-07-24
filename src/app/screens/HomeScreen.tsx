import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export const HomeScreen: React.FC<{
  onBookRidePress: () => void;
  onSelectMerchant: (merchantId: string) => void;
}> = ({ onBookRidePress, onSelectMerchant }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Welcome to GoOne</Text>
      <Text style={styles.location}>📍 Erode, Tamil Nadu</Text>

      {/* GoOne Ride Hero Banner */}
      <TouchableOpacity style={styles.rideBanner} onPress={onBookRidePress}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rideBadge}>ON-DEMAND RIDES</Text>
          <Text style={styles.rideTitle}>Book Auto or Car</Text>
          <Text style={styles.rideSub}>Local drivers, min distance check, OTP security</Text>
        </View>
        <Text style={styles.rideIcon}>🛺</Text>
      </TouchableOpacity>

      {/* Business Category Cards */}
      <Text style={styles.sectionTitle}>Shop & Order Nearby</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.categoryCard} onPress={() => onSelectMerchant('m-1')}>
          <Text style={styles.catIcon}>🛒</Text>
          <Text style={styles.catName}>Groceries</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryCard} onPress={() => onSelectMerchant('m-2')}>
          <Text style={styles.catIcon}>🍲</Text>
          <Text style={styles.catName}>Hotels & Food</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryCard} onPress={() => onSelectMerchant('m-3')}>
          <Text style={styles.catIcon}>💊</Text>
          <Text style={styles.catName}>Pharmacies</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryCard} onPress={() => onSelectMerchant('m-4')}>
          <Text style={styles.catIcon}>🥛</Text>
          <Text style={styles.catName}>Milk & Water</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  location: { fontSize: 13, color: '#38bdf8', marginBottom: 20, marginTop: 2 },
  rideBanner: {
    backgroundColor: 'linear-gradient(135deg, #1e3a8a, #111827)',
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rideBadge: { color: '#fbbf24', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  rideTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  rideSub: { color: '#bfdbfe', fontSize: 12, marginTop: 2 },
  rideIcon: { fontSize: 40, marginLeft: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: {
    width: '47%',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  catIcon: { fontSize: 32, marginBottom: 8 },
  catName: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
});

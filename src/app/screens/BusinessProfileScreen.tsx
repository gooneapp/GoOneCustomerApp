import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export const BusinessProfileScreen: React.FC<{ merchantId: string; onAddToCart: (item: Product) => void }> = ({
  merchantId,
  onAddToCart,
}) => {
  const merchantName = merchantId === 'm-2' ? 'Annapoorna Hotel & Sweets' : 'Kavitha Grocery Store';
  const category = merchantId === 'm-2' ? 'Hotel & Restaurant (KOT)' : 'Grocery & Provisions';

  const products: Product[] =
    merchantId === 'm-2'
      ? [
          { id: 'p-1', name: 'Special South Indian Meals', price: 120, unit: 'Plate' },
          { id: 'p-2', name: 'Ghee Roast Dosa', price: 70, unit: 'Piece' },
          { id: 'p-3', name: 'Filter Coffee', price: 20, unit: 'Cup' },
        ]
      : [
          { id: 'p-10', name: 'Ponni Rice 5kg', price: 320, unit: 'Bag' },
          { id: 'p-11', name: 'Sunflower Oil 1L', price: 130, unit: 'Packet' },
        ];

  return (
    <View style={styles.container}>
      {/* Merchant Header */}
      <View style={styles.headerCard}>
        <Text style={styles.shopName}>{merchantName}</Text>
        <Text style={styles.category}>{category} • 📍 1.2 km away</Text>
        <Text style={styles.statusText}>🟢 Open Now • Accepts Cash & UPI</Text>
      </View>

      <Text style={styles.sectionTitle}>Browse Items / Menu</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.prodName}>{item.name}</Text>
              <Text style={styles.prodPrice}>₹{item.price} / {item.unit}</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                onAddToCart(item);
                Alert.alert('Added to Cart', `${item.name} added to your cart.`);
              }}
            >
              <Text style={styles.addBtnText}>+ ADD</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  headerCard: {
    backgroundColor: '#111827',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  shopName: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  category: { color: '#38bdf8', fontSize: 13, marginTop: 4 },
  statusText: { color: '#34d399', fontSize: 12, marginTop: 6, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#111827',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  prodName: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
  prodPrice: { color: '#34d399', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  addBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: '#60a5fa', fontWeight: 'bold', fontSize: 13 },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { useCartStore } from '../store/cartStore';
import { ArrowLeft, Trash2, MapPin, CreditCard } from 'lucide-react-native';
import { Button } from '../components/Button';

export const CartScreen: React.FC<any> = ({ navigation }) => {
  const { items, removeItem, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    setLoading(true);
    // Mock checkout flow
    setTimeout(() => {
      setLoading(false);
      clearCart();
      navigation.navigate('OrderTracking', { orderId: 'ORD-' + Math.floor(Math.random() * 10000) });
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Button title="Browse Businesses" onPress={() => navigation.navigate('MainTabs')} style={{ marginTop: 16 }} />
        </View>
      </View>
    );
  }

  const subtotal = getTotal();
  const deliveryFee = 35;
  const total = subtotal + deliveryFee;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <TouchableOpacity style={styles.backBtn} onPress={clearCart}>
          <Trash2 color={theme.colors.danger} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price} x {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.row}>
            <MapPin color={theme.colors.primary} size={20} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.deliverTo}>Deliver to Home</Text>
              <Text style={styles.addressText}>123, Sample Street, Erode 638001</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billText}>Item Total</Text>
            <Text style={styles.billText}>₹{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billText}>Delivery Fee</Text>
            <Text style={styles.billText}>₹{deliveryFee}</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalText}>To Pay</Text>
            <Text style={styles.totalText}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={`Pay ₹${total}`} 
          onPress={handleCheckout} 
          size="large" 
          loading={loading}
          icon={<CreditCard color="#090d16" size={20} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  emptyContainer: { flex: 1, backgroundColor: theme.colors.background },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  emptyText: { ...theme.typography.h2, color: theme.colors.textMuted },
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: { ...theme.typography.h3, fontSize: 16, marginBottom: 12 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemLeft: { flex: 1 },
  itemName: { ...theme.typography.body, fontWeight: '600' },
  itemPrice: { ...theme.typography.caption, marginTop: 2 },
  itemTotal: { ...theme.typography.body, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center' },
  deliverTo: { ...theme.typography.body, fontWeight: '600' },
  addressText: { ...theme.typography.caption, marginTop: 2 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billText: { ...theme.typography.body, color: theme.colors.textMuted },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  totalText: { ...theme.typography.h3, fontSize: 18 },
  footer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  }
});

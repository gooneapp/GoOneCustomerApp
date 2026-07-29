import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { ordersApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
const PAYMENT_METHODS = [{ key: 'cash', label: 'Cash on Delivery', emoji: '💵' }, { key: 'upi', label: 'UPI', emoji: '📱' }, { key: 'wallet', label: 'GoOne Wallet', emoji: '💳' }];
export const CheckoutScreen: React.FC<any> = ({ navigation }) => {
  const { items, businessId, businessName, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [address, setAddress] = useState('Home - 45 Gandhi St');
  const [loading, setLoading] = useState(false);
  const idempKey = useRef(`order-${Date.now()}`);
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const order = await ordersApi.place({
        business_id: businessId,
        items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
        delivery_address: address,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
      }, idempKey.current);
      clearCart();
      Alert.alert('✓ Order Placed!', `Order #${order.id?.slice(-6).toUpperCase()} from ${businessName}`, [
        { text: 'Track Order', onPress: () => navigation.replace('OrderTracking', { orderId: order.id }) },
      ]);
    } catch (err: any) {
      Alert.alert('Order Failed', err?.response?.data?.error?.message || 'Please try again.');
    } finally { setLoading(false); }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ArrowLeft color={theme.colors.text} size={24} /></TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.section}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} × {item.qty}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
          <Text style={styles.section}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>{address}</Text>
            <TouchableOpacity><Text style={styles.changeText}>Change</Text></TouchableOpacity>
          </View>
          <Text style={styles.section}>Payment Method</Text>
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity key={pm.key} style={[styles.pmCard, paymentMethod === pm.key && styles.pmCardActive]} onPress={() => setPaymentMethod(pm.key)}>
              <Text style={{ fontSize: 20 }}>{pm.emoji}</Text>
              <Text style={[styles.pmLabel, paymentMethod === pm.key && styles.pmLabelActive]}>{pm.label}</Text>
              {paymentMethod === pm.key && <View style={styles.pmDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <Button title={loading ? '' : `Place Order — ₹${total}`} onPress={handlePlaceOrder} loading={loading} size="large" fullWidth />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingVertical: 12, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border, ...theme.shadows.sm },
  backBtn: { padding: 8 },
  title: { ...theme.typography.h3 },
  scroll: { padding: theme.spacing.lg },
  section: { ...theme.typography.captionBold, textTransform: 'uppercase', marginBottom: 10, marginTop: theme.spacing.lg, color: theme.colors.text },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  itemName: { ...theme.typography.body },
  itemPrice: { ...theme.typography.bodyMedium, color: theme.colors.primary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  totalLabel: { ...theme.typography.h4 },
  totalAmount: { fontSize: 20, fontWeight: '900', color: theme.colors.primary },
  addressCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14, borderWidth: 1, borderColor: theme.colors.border },
  addressText: { ...theme.typography.body },
  changeText: { color: theme.colors.primary, fontWeight: '700' },
  pmCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: theme.colors.border },
  pmCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  pmLabel: { ...theme.typography.bodyMedium, flex: 1 },
  pmLabelActive: { color: theme.colors.primary },
  pmDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  footer: { padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface },
});

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Plus, Minus, ShoppingCart } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../../components/Button';
import { Speakable } from '../../components/Speakable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import type { ShopStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ShopStackParamList, 'Cart'>;

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const { items, businessName, total, updateQty, clearCart } = useCartStore();
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        variant="sub"
        title="Your Cart"
        rightSlot={items.length > 0 ? <TouchableOpacity onPress={clearCart}><Text style={styles.clear}>Clear</Text></TouchableOpacity> : undefined}
      />
      {items.length === 0 ? (
        <View style={styles.empty}>
          <ShoppingCart color={theme.colors.textLight} size={60} />
          <Speakable text="Your cart is empty" textStyle={styles.emptyTitle} />
          <Button title="Browse Stores" onPress={() => navigation.navigate('Shop')} style={{ marginTop: 16 }} />
        </View>
      ) : (
        <>
          <Text style={styles.bizName}>From: {businessName}</Text>
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.cartRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemUnit}>₹{item.price} × {item.qty}</Text>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}><Minus color={theme.colors.primary} size={14} /></TouchableOpacity>
                  <Text style={styles.qty}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}><Plus color={theme.colors.primary} size={14} /></TouchableOpacity>
                  <Text style={styles.itemTotal}>₹{item.price * item.qty}</Text>
                </View>
              </View>
            )}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₹{total.toLocaleString('en-IN')}</Text>
            </View>
            <Button title={`Proceed to Checkout — ₹${total}`} onPress={() => navigation.navigate('Checkout')} size="large" fullWidth />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  clear: { color: theme.colors.danger, fontWeight: '700' },
  bizName: { padding: theme.spacing.md, ...theme.typography.caption },
  list: { padding: theme.spacing.md },
  cartRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  itemName: { ...theme.typography.bodyMedium },
  itemUnit: { ...theme.typography.caption, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  qty: { width: 28, textAlign: 'center', fontWeight: '800', color: theme.colors.text },
  itemTotal: { ...theme.typography.h4, color: theme.colors.primary, minWidth: 60, textAlign: 'right' },
  footer: { padding: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { ...theme.typography.h4 },
  totalAmount: { fontSize: 22, fontWeight: '900', color: theme.colors.primary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  emptyTitle: { ...theme.typography.h3, marginTop: 20 },
});

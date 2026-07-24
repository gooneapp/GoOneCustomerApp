import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme/theme';
import { useCartStore } from '../store/cartStore';
import { ArrowLeft, Star, Clock, Plus, Minus } from 'lucide-react-native';

export const BusinessProfileScreen: React.FC<any> = ({ route, navigation }) => {
  const { businessId, category } = route.params || {};
  const [menu, setMenu] = useState<any[]>([]);
  const { items: cartItems, addItem, removeItem, updateQuantity } = useCartStore();

  useEffect(() => {
    // Mock menu fetch based on businessId
    setMenu([
      { id: 'i-1', name: 'Fresh Milk 500ml', price: 25, type: 'veg', businessId: businessId || 'b-1' },
      { id: 'i-2', name: 'Farm Eggs (6 pcs)', price: 40, type: 'nonveg', businessId: businessId || 'b-1' },
      { id: 'i-3', name: 'Whole Wheat Bread', price: 35, type: 'veg', businessId: businessId || 'b-1' },
      { id: 'i-4', name: 'Dosa Batter 1kg', price: 50, type: 'veg', businessId: businessId || 'b-1' },
    ]);
  }, [businessId]);

  const getItemQuantity = (id: string) => {
    return cartItems.find(i => i.id === id)?.quantity || 0;
  };

  const handleAdd = (item: any) => {
    addItem({ ...item, quantity: 1 });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        {/* Business Header */}
        <View style={styles.businessHeader}>
          <Text style={styles.businessName}>FreshMart Erode</Text>
          <Text style={styles.businessTags}>Grocery • Essentials • Fast Delivery</Text>
          <View style={styles.stats}>
            <View style={styles.statBadge}>
              <Star color={theme.colors.warning} size={14} />
              <Text style={styles.statText}>4.8 (120+ ratings)</Text>
            </View>
            <View style={styles.statBadge}>
              <Clock color={theme.colors.primary} size={14} />
              <Text style={styles.statText}>15-20 mins</Text>
            </View>
          </View>
        </View>

        {/* Menu/Items List */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Available Items</Text>
          {menu.map((item) => {
            const qty = getItemQuantity(item.id);
            return (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.itemInfo}>
                  <View style={[styles.vegBadge, { borderColor: item.type === 'veg' ? theme.colors.success : theme.colors.danger }]}>
                    <View style={[styles.vegDot, { backgroundColor: item.type === 'veg' ? theme.colors.success : theme.colors.danger }]} />
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>

                {qty === 0 ? (
                  <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(item)}>
                    <Text style={styles.addBtnText}>ADD</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qtyControl}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => qty === 1 ? removeItem(item.id) : updateQuantity(item.id, -1)}>
                      <Minus color={theme.colors.primary} size={16} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                      <Plus color={theme.colors.primary} size={16} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Cart Bar */}
      {cartItems.length > 0 && (
        <View style={styles.cartBarContainer}>
          <TouchableOpacity style={styles.cartBar} onPress={() => navigation.navigate('Cart')}>
            <View>
              <Text style={styles.cartBarItems}>{cartItems.length} ITEM{cartItems.length > 1 ? 'S' : ''}</Text>
              <Text style={styles.cartBarTotal}>₹{cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.cartBarAction}>View Cart</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  backBtn: { padding: 8 },
  businessHeader: { padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  businessName: { ...theme.typography.h1, fontSize: 24, marginBottom: 4 },
  businessTags: { ...theme.typography.caption, marginBottom: 12 },
  stats: { flexDirection: 'row', gap: 12 },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statText: { ...theme.typography.caption, fontWeight: '600', color: theme.colors.text },
  menuContainer: { padding: theme.spacing.lg, paddingBottom: 100 },
  sectionTitle: { ...theme.typography.h3, marginBottom: 16 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: { flex: 1 },
  vegBadge: {
    width: 12, height: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 6, borderRadius: 2
  },
  vegDot: { width: 6, height: 6, borderRadius: 3 },
  itemName: { ...theme.typography.body, fontWeight: '600', marginBottom: 4 },
  itemPrice: { ...theme.typography.body, color: theme.colors.textMuted },
  addBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: theme.colors.primary, fontWeight: '700' },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    height: 36,
  },
  qtyBtn: { paddingHorizontal: 12, height: '100%', justifyContent: 'center' },
  qtyText: { color: theme.colors.primary, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  cartBarContainer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cartBar: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartBarItems: { color: 'rgba(9, 13, 22, 0.8)', fontSize: 12, fontWeight: '700' },
  cartBarTotal: { color: '#090d16', fontSize: 18, fontWeight: '800' },
  cartBarAction: { color: '#090d16', fontSize: 16, fontWeight: '700' }
});

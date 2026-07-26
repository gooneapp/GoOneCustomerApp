/**
 * GoOne Customer App — Business Detail Screen
 * Shows products, hours, info, add to cart.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, ShoppingCart, Star, Clock, MapPin } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { catalogApi } from '../../api/client';
import { useCartStore } from '../../store/cartStore';

export const BusinessDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const { businessId } = route.params || {};
  const [biz, setBiz] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, itemCount } = useCartStore();

  useEffect(() => {
    Promise.all([
      catalogApi.getBusinessDetail(businessId),
      catalogApi.getProducts(businessId),
    ]).then(([b, p]) => { setBiz(b); setProducts(p?.products || []); }).catch(() => {}).finally(() => setLoading(false));
  }, [businessId]);

  const handleAddToCart = (product: any) => {
    addItem({ ...product, businessId, businessName: biz?.name });
    Alert.alert('Added to Cart', `${product.name} added!`, [{ text: 'Continue Shopping' }, { text: 'View Cart →', onPress: () => navigation.navigate('Cart') }]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ArrowLeft color={theme.colors.text} size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{biz?.name || 'Business'}</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <ShoppingCart color={theme.colors.primary} size={22} />
          {itemCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{itemCount}</Text></View>}
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <View style={styles.bizInfo}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🏪</Text>
                <Text style={styles.bizName}>{biz?.name}</Text>
                <Text style={styles.bizCategory}>{biz?.category_name}</Text>
                <View style={styles.metaRow}>
                  <Star color={theme.colors.accent} size={14} fill={theme.colors.accent} />
                  <Text style={styles.metaText}>{biz?.rating || '4.5'}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Clock color={theme.colors.textLight} size={14} />
                  <Text style={styles.metaText}>{biz?.delivery_time || '20-35'} min</Text>
                  <Text style={styles.dot}>•</Text>
                  <MapPin color={theme.colors.textLight} size={14} />
                  <Text style={styles.metaText}>{biz?.city || 'Nearby'}</Text>
                </View>
              </View>
              <Text style={styles.productsTitle}>Products & Menu</Text>
            </View>
          }
          ListEmptyComponent={<View style={styles.centered}><Text style={{ fontSize: 40, marginBottom: 12 }}>📦</Text><Text style={styles.emptyText}>No products listed yet</Text></View>}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productUnit}>{item.unit || ''}</Text>
              </View>
              <View style={styles.productRight}>
                <Text style={styles.productPrice}>₹{item.price}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: theme.spacing.md, paddingVertical: 12, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border, ...theme.shadows.sm },
  backBtn: { padding: 6 },
  headerTitle: { flex: 1, ...theme.typography.h3 },
  cartBtn: { position: 'relative', padding: 6 },
  cartBadge: { position: 'absolute', top: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: theme.colors.danger, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  list: { padding: theme.spacing.md },
  bizInfo: { alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  bizName: { fontSize: 22, fontWeight: '900', color: theme.colors.text, marginBottom: 4 },
  bizCategory: { ...theme.typography.caption, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  metaText: { fontSize: 13, color: theme.colors.textMuted },
  dot: { color: theme.colors.textLight },
  productsTitle: { ...theme.typography.h4, marginBottom: 12 },
  productCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  productInfo: { flex: 1 },
  productName: { ...theme.typography.bodyMedium },
  productUnit: { ...theme.typography.caption, marginTop: 2 },
  productRight: { alignItems: 'flex-end', gap: 8 },
  productPrice: { ...theme.typography.h4, color: theme.colors.primary },
  addBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radius.md },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  emptyText: { ...theme.typography.subtitle },
});

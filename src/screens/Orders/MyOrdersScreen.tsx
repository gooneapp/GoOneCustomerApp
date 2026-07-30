import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Clock, Package } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { ordersApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
const STATUS_COLORS: any = { placed: theme.colors.warning, accepted: theme.colors.primary, preparing: theme.colors.secondary, out_for_delivery: theme.colors.info, completed: theme.colors.success, cancelled: theme.colors.danger };
export const MyOrdersScreen: React.FC<any> = ({ navigation }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchOrders = async () => { try { const d = await ordersApi.listMine({ limit: 20 }); setOrders(d?.orders || []); } catch {} finally { setLoading(false); setRefreshing(false); } };
  useEffect(() => { fetchOrders(); }, []);
  return (
    <SafeAreaView style={styles.safe}><StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <AppHeader variant="sub" title="My Orders" />
      {loading ? <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View> : (
        <FlatList data={orders} keyExtractor={(i) => i.id} contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} colors={[theme.colors.primary]} />}
          ListEmptyComponent={<View style={styles.centered}><Package color={theme.colors.textLight} size={60} /><Text style={styles.emptyText}>No orders yet</Text><TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('ShopTab')}><Text style={styles.shopBtnText}>Start Shopping →</Text></TouchableOpacity></View>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })} activeOpacity={0.85}>
              <View style={{ flex: 1 }}>
                <Text style={styles.businessName}>{item.business_name || 'Business'}</Text>
                <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                <Text style={styles.orderItems}>{item.items?.length || 0} item(s)</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.orderTotal}>₹{Number(item.total_amount).toLocaleString('en-IN')}</Text>
                <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[item.status] || theme.colors.textMuted) + '20' }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] || theme.colors.textMuted }]}>{item.status?.replace(/_/g,' ').toUpperCase()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.md, gap: 12 },
  card: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  businessName: { ...theme.typography.h4, marginBottom: 4 },
  orderDate: { ...theme.typography.caption },
  orderItems: { ...theme.typography.caption, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 8 },
  orderTotal: { fontSize: 18, fontWeight: '900', color: theme.colors.primary },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  emptyText: { ...theme.typography.h3, marginTop: 16, marginBottom: 16 },
  shopBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: theme.radius.md },
  shopBtnText: { color: '#fff', fontWeight: '700' },
});

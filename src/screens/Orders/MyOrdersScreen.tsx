import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { ordersApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import type { HomeStackParamList } from '../../navigation/types';
const STATUS_COLORS: any = { placed: theme.colors.warning, accepted: theme.colors.primary, preparing: theme.colors.secondary, out_for_delivery: theme.colors.info, completed: theme.colors.success, cancelled: theme.colors.danger };
type Props = NativeStackScreenProps<HomeStackParamList, 'MyOrders'>;
export const MyOrdersScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchOrders = async () => {
    setError(null);
    try {
      const d = await ordersApi.listMine({ limit: 20 });
      setOrders(d?.orders || []);
    } catch {
      setError('Unable to load your orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => { fetchOrders(); }, []);
  return (
    <SafeAreaView style={styles.safe}><StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <AppHeader variant="sub" title="My Orders" />
      {loading ? <LoadingView /> : error ? (
        <EmptyState icon="⚠️" title="Something went wrong" subtitle={error} ctaLabel="Retry" onCtaPress={fetchOrders} />
      ) : (
        <FlatList data={orders} keyExtractor={(i) => i.id} contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} colors={[theme.colors.primary]} />}
          ListEmptyComponent={<EmptyState icon="📦" title="No orders yet" ctaLabel="Start Shopping →" onCtaPress={() => (navigation as any).navigate('ShopTab')} />}
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
});

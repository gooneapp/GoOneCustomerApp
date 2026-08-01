import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ordersApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import type { ShopStackParamList } from '../../navigation/types';
const STEPS = ['placed','accepted','preparing','out_for_delivery','completed'];
type Props = NativeStackScreenProps<ShopStackParamList, 'OrderTracking'>;
export const OrderTrackingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Only the initial load's failure surfaces a full error state — a
  // transient failed poll tick every 15s shouldn't flash an error banner
  // over an already-loaded screen.
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchOrder = (isInitial: boolean) => {
      ordersApi.getById(orderId)
        .then((data) => {
          if (!isMounted) return;
          setOrder(data);
          if (isInitial) setError(null);
        })
        .catch(() => {
          if (!isMounted) return;
          if (isInitial) setError('Unable to load this order. Please try again.');
        })
        .finally(() => {
          if (!isMounted) return;
          if (isInitial) setLoading(false);
        });
    };

    fetchOrder(true);
    const t = setInterval(() => fetchOrder(false), 15000);
    return () => {
      isMounted = false;
      clearInterval(t);
    };
  }, [orderId, reloadKey]);
  const currentStep = STEPS.indexOf(order?.status);
  const retryInitialLoad = () => setReloadKey((k) => k + 1);
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader variant="sub" title="Track Order" />
      {loading ? <LoadingView /> : error ? (
        <EmptyState icon="⚠️" title="Something went wrong" subtitle={error} ctaLabel="Retry" onCtaPress={retryInitialLoad} />
      ) : (
        <View style={styles.content}>
          <Text style={styles.orderId}>Order #{order?.id?.slice(-6).toUpperCase()}</Text>
          <Text style={styles.bizName}>{order?.business_name || 'Business'}</Text>
          <View style={styles.track}>
            {STEPS.map((step, idx) => (
              <View key={step} style={styles.stepRow}>
                <View style={[styles.dot, idx <= currentStep && styles.dotActive, idx < currentStep && styles.dotDone]} />
                {idx < STEPS.length - 1 && <View style={[styles.line, idx < currentStep && styles.lineDone]} />}
                <Text style={[styles.stepLabel, idx <= currentStep && styles.stepLabelActive]}>{step.replace(/_/g,' ').toUpperCase()}</Text>
              </View>
            ))}
          </View>
          {order?.status !== 'cancelled' && order?.status !== 'completed' && (
            <Button title="Cancel Order" variant="danger" onPress={() => Alert.alert('Cancel Order', 'Are you sure?', [{ text: 'No' }, { text: 'Yes', onPress: () => ordersApi.cancel(orderId, 'customer_cancelled').then(() => navigation.goBack()) }])} style={{ marginTop: 32 }} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl, alignItems: 'center' },
  orderId: { ...theme.typography.h2, marginBottom: 4 },
  bizName: { ...theme.typography.subtitle, marginBottom: theme.spacing.xl },
  track: { width: '100%', gap: 0 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 0 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.border, backgroundColor: theme.colors.background, marginTop: 2 },
  dotActive: { borderColor: theme.colors.primary },
  dotDone: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  line: { position: 'absolute', left: 9, top: 22, width: 2, height: 32, backgroundColor: theme.colors.border },
  lineDone: { backgroundColor: theme.colors.primary },
  stepLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textLight, paddingBottom: 28 },
  stepLabelActive: { color: theme.colors.primary, fontWeight: '800' },
});

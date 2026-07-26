import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { Button } from '../../components/index';
import { ordersApi } from '../../api/client';
const STEPS = ['placed','accepted','preparing','out_for_delivery','completed'];
export const OrderTrackingScreen: React.FC<any> = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    ordersApi.getById(orderId).then(setOrder).catch(() => {}).finally(() => setLoading(false));
    const t = setInterval(() => ordersApi.getById(orderId).then(setOrder).catch(() => {}), 15000);
    return () => clearInterval(t);
  }, [orderId]);
  const currentStep = STEPS.indexOf(order?.status);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ArrowLeft color={theme.colors.text} size={24} /></TouchableOpacity>
        <Text style={styles.title}>Track Order</Text>
        <View style={{ width: 40 }} />
      </View>
      {loading ? <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View> : (
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingVertical: 12, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border, ...theme.shadows.sm },
  backBtn: { padding: 8 },
  title: { ...theme.typography.h3 },
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

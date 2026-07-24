import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, CheckCircle2, Clock, MapPin, Navigation } from 'lucide-react-native';

export const OrderTrackingScreen: React.FC<any> = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  const [status, setStatus] = useState(1); // 1: Placed, 2: Prepared, 3: Out for delivery, 4: Delivered

  useEffect(() => {
    // Mock progression
    const t1 = setTimeout(() => setStatus(2), 3000);
    const t2 = setTimeout(() => setStatus(3), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const steps = [
    { title: 'Order Placed', desc: 'We have received your order', icon: <CheckCircle2 color={status >= 1 ? theme.colors.success : theme.colors.border} size={24} /> },
    { title: 'Order Prepared', desc: 'Business is packing your items', icon: <Clock color={status >= 2 ? theme.colors.primary : theme.colors.border} size={24} /> },
    { title: 'Out for Delivery', desc: 'Partner is on the way', icon: <Navigation color={status >= 3 ? theme.colors.warning : theme.colors.border} size={24} /> },
    { title: 'Delivered', desc: 'Order reached your location', icon: <MapPin color={status >= 4 ? theme.colors.success : theme.colors.border} size={24} /> },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MainTabs')}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{orderId || 'ORD-123'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.mapMockup}>
          <Text style={styles.mapText}>Live Map Tracking</Text>
          {status >= 3 && (
            <View style={styles.partnerInfo}>
              <View style={styles.partnerAvatar} />
              <View>
                <Text style={styles.partnerName}>Ramesh K.</Text>
                <Text style={styles.partnerVehicle}>TN 33 AB 1234 • Bike</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Tracking Status</Text>
          <View style={styles.timeline}>
            {steps.map((step, index) => (
              <View key={index} style={styles.step}>
                <View style={styles.stepIcon}>{step.icon}</View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: status >= index + 1 ? theme.colors.text : theme.colors.textMuted }]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
                {index < steps.length - 1 && (
                  <View style={[styles.line, { backgroundColor: status >= index + 2 ? theme.colors.primary : theme.colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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
  mapMockup: {
    height: 250,
    backgroundColor: '#1e293b', // darker slate for map
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mapText: { color: theme.colors.textMuted, fontSize: 16, fontWeight: '600' },
  partnerInfo: {
    position: 'absolute',
    bottom: 16, left: 16, right: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  partnerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, marginRight: 12 },
  partnerName: { ...theme.typography.body, fontWeight: '700' },
  partnerVehicle: { ...theme.typography.caption },
  statusCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: { ...theme.typography.h3, marginBottom: 24 },
  timeline: { paddingLeft: 8 },
  step: { flexDirection: 'row', marginBottom: 32, position: 'relative' },
  stepIcon: { width: 24, alignItems: 'center' },
  stepContent: { marginLeft: 16 },
  stepTitle: { ...theme.typography.body, fontWeight: '700', marginBottom: 4 },
  stepDesc: { ...theme.typography.caption },
  line: {
    position: 'absolute',
    left: 11,
    top: 32,
    bottom: -24,
    width: 2,
  },
});

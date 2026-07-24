import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const OrderTrackingScreen: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [currentStep] = useState<number>(3); // Step 3: Out for Delivery

  const steps = [
    { title: 'Order Placed', desc: 'Sent to merchant' },
    { title: 'Accepted & Preparing', desc: 'Kitchen / Shop is packing items' },
    { title: 'Out for Delivery', desc: 'Delivery partner on the way' },
    { title: 'Completed', desc: 'Delivered to your address' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Live Order Progress</Text>
      <Text style={styles.subtitle}>Order ID: #{orderId}</Text>

      {/* Progress Steps Timeline */}
      <View style={styles.timeline}>
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep - 1;

          return (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.iconCol}>
                <View style={[styles.circle, isDone && styles.circleDone, isCurrent && styles.circleCurrent]}>
                  <Text style={styles.circleText}>{isDone ? '✓' : idx + 1}</Text>
                </View>
                {idx < steps.length - 1 && <View style={[styles.line, isDone && styles.lineDone]} />}
              </View>

              <View style={styles.contentCol}>
                <Text style={[styles.stepTitle, (isDone || isCurrent) && styles.textActive]}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#9ca3af', marginBottom: 24 },
  timeline: { paddingLeft: 10 },
  stepRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  iconCol: { alignItems: 'center' },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: { backgroundColor: '#10b981', borderColor: '#059669' },
  circleCurrent: { backgroundColor: '#2563eb', borderColor: '#3b82f6' },
  circleText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  line: { width: 2, height: 40, backgroundColor: '#374151', marginTop: 4 },
  lineDone: { backgroundColor: '#10b981' },
  contentCol: { flex: 1, paddingTop: 4 },
  stepTitle: { color: '#6b7280', fontSize: 16, fontWeight: 'bold' },
  textActive: { color: '#ffffff' },
  stepDesc: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
});

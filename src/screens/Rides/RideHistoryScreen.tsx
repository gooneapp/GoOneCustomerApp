import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Car } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { rideApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
export const RideHistoryScreen: React.FC<any> = () => {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { rideApi.listHistory({ limit: 20 }).then((d) => setRides(d?.rides || [])).catch(() => setRides([])).finally(() => setLoading(false)); }, []);
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader variant="sub" title="Ride History" />
      {loading ? <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View> : (
        <FlatList data={rides} keyExtractor={(i) => i.id} contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.centered}><Car color={theme.colors.textLight} size={60} /><Text style={styles.emptyText}>No rides yet</Text></View>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.from}>{item.pickup_address || 'Pickup'}</Text>
                <Text style={styles.to}>→ {item.dropoff_address || 'Drop'}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('en-IN')}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.fare}>₹{Number(item.fare || item.estimated_fare || 0).toLocaleString('en-IN')}</Text>
                <Text style={[styles.status, { color: item.status === 'completed' ? theme.colors.success : theme.colors.danger }]}>{item.status?.toUpperCase()}</Text>
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
  list: { padding: theme.spacing.md, gap: 10 },
  card: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  from: { ...theme.typography.bodyMedium, fontWeight: '700' },
  to: { ...theme.typography.caption, marginTop: 2 },
  date: { ...theme.typography.caption, color: theme.colors.textLight, marginTop: 4 },
  right: { alignItems: 'flex-end', gap: 6 },
  fare: { fontSize: 18, fontWeight: '900', color: theme.colors.primary },
  status: { fontSize: 10, fontWeight: '800' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  emptyText: { ...theme.typography.h3, marginTop: 16 },
});

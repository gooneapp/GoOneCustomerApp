import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { User, LogOut, Settings, Globe } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/client';
export const ProfileScreen: React.FC<any> = ({ navigation }) => {
  const { user, language, logout } = useAuthStore();
  const handleLogout = async () => { try { await authApi.logout(); } catch {} await logout(); };
  return (
    <SafeAreaView style={styles.safe}><StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backText}>← Home</Text></TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.container}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text></View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        <View style={styles.menuCard}>
          {[
            { label: 'Language & Voice', Icon: Globe, onPress: () => {} },
            { label: 'Account Settings', Icon: Settings, onPress: () => {} },
          ].map((item) => {
            const Icon = item.Icon;
            return (
              <TouchableOpacity key={item.label} style={styles.menuRow} onPress={item.onPress}>
                <Icon color={theme.colors.primary} size={20} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={{ color: theme.colors.textLight }}>→</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: handleLogout }])}>
          <LogOut color={theme.colors.danger} size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingVertical: 12, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border, ...theme.shadows.sm },
  backBtn: { padding: 8 },
  backText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },
  title: { ...theme.typography.h3 },
  container: { padding: theme.spacing.xl, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  name: { fontSize: 22, fontWeight: '900', color: theme.colors.text, marginBottom: 4 },
  phone: { ...theme.typography.subtitle, marginBottom: theme.spacing.xl },
  menuCard: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', marginBottom: theme.spacing.xl, ...theme.shadows.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  menuLabel: { ...theme.typography.body, flex: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.dangerLight, width: '100%', borderRadius: theme.radius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.danger + '40' },
  logoutText: { color: theme.colors.danger, fontWeight: '700', fontSize: 16 },
});

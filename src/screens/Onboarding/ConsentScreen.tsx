import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { authApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
export const ConsentScreen: React.FC<any> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const handleAgree = async () => {
    setLoading(true);
    try { await authApi.recordConsent('terms_of_service', '1.0'); } catch {}
    finally { setLoading(false); navigation.replace('Main'); }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Terms & Privacy</Text>
        <Text style={styles.sub}>Please read and agree to continue</Text>
        <ScrollView style={styles.box} showsVerticalScrollIndicator={false}>
          <Text style={styles.tos}>By using GoOne Customer App, you agree to our Terms of Service and Privacy Policy. We collect your location to show nearby businesses and enable ride booking. Your data is never sold to third parties. You can delete your account anytime from Profile settings.{'\n\n'}GoOne is a platform connecting local businesses with customers. Transactions are between businesses and customers directly. GoOne may take a service fee on completed rides. All payment disputes should be raised within 24 hours.{'\n\n'}Voice guidance in Tamil/English/Hindi is available and requires microphone permission for text-to-speech. This feature can be disabled from Language Settings.</Text>
        </ScrollView>
        <Button title={loading ? '' : 'I Agree & Continue'} onPress={handleAgree} loading={loading} size="large" fullWidth style={{ marginTop: 16 }} />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.xl },
  title: { fontSize: 26, fontWeight: '900', color: theme.colors.text, marginBottom: 8 },
  sub: { color: theme.colors.textMuted, marginBottom: theme.spacing.lg },
  box: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 },
  tos: { color: theme.colors.textMuted, lineHeight: 22, fontSize: 14 },
});

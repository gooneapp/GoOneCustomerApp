import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { theme } from '../../theme/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
export const OtpRequestScreen: React.FC<any> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSend = async () => {
    if (phone.length !== 10) { setError('Enter a valid 10-digit number'); return; }
    setLoading(true);
    try {
      await authApi.requestOtp(phone, 'registration');
      navigation.navigate('OtpVerify', { phone: `+91${phone}` });
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || '';
      if (msg.includes('exists') || e?.response?.status === 409) {
        navigation.navigate('Login');
      } else setError(msg || 'Failed to send OTP');
    } finally { setLoading(false); }
  };
  return (
    <SafeAreaView style={styles.safe}><StatusBar backgroundColor={theme.colors.background} barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.title}>Enter your mobile number</Text>
          <Text style={styles.sub}>We'll send you a one-time password to verify your number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.code}><Text style={styles.codeText}>🇮🇳 +91</Text></View>
            <View style={{ flex: 1 }}><Input placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={(t: string) => { setPhone(t.replace(/\D/g,'')); setError(''); }} containerStyle={{ marginBottom: 0 }} /></View>
          </View>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <Button title={loading ? '' : 'Send OTP'} onPress={handleSend} loading={loading} size="large" fullWidth style={{ marginTop: 24 }} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.login}>Already registered? Login →</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: theme.colors.text, marginBottom: 8 },
  sub: { color: theme.colors.textMuted, marginBottom: theme.spacing.xl, lineHeight: 22 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  code: { backgroundColor: theme.colors.surfaceAlt, borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 14, justifyContent: 'center' },
  codeText: { fontWeight: '700', color: theme.colors.text },
  err: { color: theme.colors.danger, marginTop: 8, fontWeight: '600' },
  login: { color: theme.colors.primary, fontWeight: '700', textAlign: 'center', marginTop: theme.spacing.xl, fontSize: 14 },
});

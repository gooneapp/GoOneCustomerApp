import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { authApi } from '../../api/client';
import { Speakable } from '../../components/Speakable';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerify'>;

export const OtpVerifyScreen: React.FC<Props> = ({ route, navigation }) => {
  // This screen is only ever reached via navigation.navigate('OtpVerify', { phone })
  // from OtpRequestScreen — phone is always supplied in practice even though
  // the param-list types it optional to allow direct/deep-link navigation.
  const { phone } = (route.params || {}) as { phone: string };
  const [otp, setOtp] = useState(['','','','','','']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<any[]>([]);
  const joined = otp.join('');
  const set = (idx: number, val: string) => {
    const v = val.replace(/\D/g,'').slice(-1);
    const n = [...otp]; n[idx] = v; setOtp(n);
    if (v && idx < 5) inputs.current[idx+1]?.focus();
  };
  const handleVerify = async () => {
    if (joined.length < 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, joined, 'registration');
      if (res.setup_token) navigation.navigate('SetPassword', { phone, setup_token: res.setup_token });
      else if (res.access_token) navigation.navigate('Consent');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Speakable text="Enter OTP" textStyle={styles.title} containerStyle={styles.titleRow} />
        <Text style={styles.sub}>Sent to {phone}</Text>
        <View style={styles.otpRow}>
          {otp.map((d, i) => (
            <TextInput key={i} ref={(r) => { inputs.current[i] = r; }} style={[styles.otpBox, d && styles.otpBoxFilled]} value={d} onChangeText={(v) => set(i, v)} keyboardType="number-pad" maxLength={1} autoFocus={i===0} />
          ))}
        </View>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <Button title={loading ? '' : 'Verify OTP'} onPress={handleVerify} loading={loading} size="large" fullWidth style={{ marginTop: 24 }} />
        <TouchableOpacity onPress={() => authApi.requestOtp(phone, 'registration')}><Text style={styles.resend}>Resend OTP</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: theme.colors.text },
  titleRow: { marginBottom: 8 },
  sub: { color: theme.colors.textMuted, marginBottom: theme.spacing.xl },
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 8 },
  otpBox: { width: 48, height: 60, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.border, textAlign: 'center', fontSize: 22, fontWeight: '800', backgroundColor: theme.colors.surface, color: theme.colors.text },
  otpBoxFilled: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  err: { color: theme.colors.danger, textAlign: 'center', fontWeight: '600' },
  resend: { color: theme.colors.primary, fontWeight: '700', textAlign: 'center', marginTop: theme.spacing.xl },
});

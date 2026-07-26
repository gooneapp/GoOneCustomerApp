/**
 * GoOne Customer App — Login Screen with Real Logo + Demo Credentials
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Image, Alert, ScrollView, Dimensions,
} from 'react-native';
import { theme } from '../theme/theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');
const LOGO = require('../Logo.png');

// ─── Demo Credentials ─────────────────────────────────────────────────────────
const DEMO_PHONE    = '9000000001';
const DEMO_PASSWORD = 'Demo@1234';
// ─────────────────────────────────────────────────────────────────────────────

export const LoginScreen: React.FC<any> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginSuccess } = useAuthStore();

  const handleLogin = async () => {
    if (phone.length !== 10 || !password) {
      setError('Enter your 10-digit phone number and password');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(`+91${phone}`, password);
      await loginSuccess(
        {
          id: res.user.id,
          name: res.user.name,
          phone: `+91${phone}`,
          preferred_language: res.user.preferred_language || 'en',
        },
        res.access_token,
        res.refresh_token,
      );
      navigation.replace('Main');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Login failed. Check your phone number and password.');
    } finally { setLoading(false); }
  };

  const fillDemo = () => {
    setPhone(DEMO_PHONE);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={s.logoWrap}>
            <Image source={LOGO} style={s.logo} resizeMode="contain" />
          </View>

          {/* Header */}
          <Text style={s.title}>Welcome Back!</Text>
          <Text style={s.sub}>Sign in to your GoOne Customer account</Text>

          {/* Form */}
          <View style={s.form}>
            <View style={s.phoneRow}>
              <View style={s.code}><Text style={s.codeText}>🇮🇳 +91</Text></View>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(t: string) => { setPhone(t.replace(/\D/g, '')); setError(''); }}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
            </View>

            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t: string) => { setPassword(t); setError(''); }}
              rightIcon={<Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁'}</Text>}
              onRightIconPress={() => setShowPassword((v) => !v)}
            />

            {error ? <Text style={s.err}>{error}</Text> : null}

            <Button
              title={loading ? '' : 'Login'}
              onPress={handleLogin}
              loading={loading}
              size="large"
              fullWidth
              style={{ marginBottom: 12 }}
            />

            {/* Demo Banner */}
            <TouchableOpacity style={s.demoBanner} onPress={fillDemo} activeOpacity={0.8}>
              <Text style={s.demoTitle}>🧪 Demo Login</Text>
              <Text style={s.demoLine}>Phone: <Text style={s.demoValue}>9000000001</Text></Text>
              <Text style={s.demoLine}>Password: <Text style={s.demoValue}>Demo@1234</Text></Text>
              <Text style={s.demoTap}>Tap to auto-fill →</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>New customer? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Language')}>
              <Text style={s.footerLink}>Register here →</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, padding: theme.spacing.xl, alignItems: 'center' },
  logoWrap: { width: '100%', alignItems: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  logo: { width: width * 0.65, height: 120 },
  title: { fontSize: 26, fontWeight: '900', color: theme.colors.text, textAlign: 'center', marginBottom: 6 },
  sub: { color: theme.colors.textMuted, textAlign: 'center', marginBottom: theme.spacing.xl, fontSize: 14 },
  form: { width: '100%' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: theme.spacing.md },
  code: {
    backgroundColor: theme.colors.surfaceAlt, borderWidth: 1.5, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, padding: 14, justifyContent: 'center',
  },
  codeText: { fontWeight: '700', color: theme.colors.text },
  err: { color: theme.colors.danger, textAlign: 'center', marginBottom: 12, fontWeight: '600' },
  demoBanner: {
    backgroundColor: '#FFF8E7', borderRadius: theme.radius.lg, padding: 16,
    borderWidth: 1.5, borderColor: '#F59E0B40', marginTop: 4,
  },
  demoTitle: { fontWeight: '800', fontSize: 14, color: '#D97706', marginBottom: 6 },
  demoLine: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 2 },
  demoValue: { fontWeight: '800', color: theme.colors.text, fontFamily: 'monospace' },
  demoTap: { color: theme.colors.primary, fontWeight: '700', fontSize: 12, marginTop: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.xl },
  footerText: { color: theme.colors.textMuted, fontSize: 14 },
  footerLink: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },
});

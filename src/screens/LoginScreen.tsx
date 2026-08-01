/**
 * GoOne Customer App — Login Screen
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, TouchableOpacity, Image, ScrollView, Dimensions, Animated, Keyboard
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../theme/theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Speakable } from '../components/Speakable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../utils/i18n';
import type { AuthStackParamList } from '../navigation/types';
import { Eye, EyeOff, Smartphone, ShieldCheck, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const LOGO = require('../Logo.png');

// ─── Demo Credentials ─────────────────────────────────────────────────────────
const DEMO_PHONE = '9000000001';
const DEMO_PASSWORD = 'Demo@1234';
// ─────────────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginSuccess } = useAuthStore();
  const { t } = useTranslation();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (phone.length !== 10 || !password) {
      setError('Enter your 10-digit phone number and password');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(phone, password);
      await loginSuccess(
        {
          id: res.user.id,
          name: res.user.name,
          phone: phone,
          preferred_language: res.user.preferred_language || 'en',
        },
        res.access_token,
        res.refresh_token,
      );
      (navigation as any).replace('Main');
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
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <Animated.View style={[s.headerArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={s.logoWrap}>
              <Image source={LOGO} style={s.logo} resizeMode="contain" />
            </View>
            <Speakable text={t('welcome_back')} textStyle={s.title} containerStyle={s.titleRow} />
            <Text style={s.sub}>{t('login_to_continue')}</Text>
          </Animated.View>

          <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={s.inputWrapper}>
              <Text style={s.inputLabel}>{t('mobile_number')}</Text>
              <View style={s.phoneRow}>
                <View style={s.codeBox}>
                  <Text style={s.codeText}>🇮🇳 +91</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder={t('phone_placeholder')}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(t: string) => { setPhone(t.replace(/\D/g, '')); setError(''); }}
                    containerStyle={{ marginBottom: 0 }}
                    leftIcon={<Smartphone color={theme.colors.textMuted} size={20} />}
                  />
                </View>
              </View>
            </View>

            <View style={s.inputWrapper}>
              <Text style={s.inputLabel}>{t('password')}</Text>
              <Input
                placeholder={t('password_placeholder')}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t: string) => { setPassword(t); setError(''); }}
                containerStyle={{ marginBottom: 0 }}
                leftIcon={<ShieldCheck color={theme.colors.textMuted} size={20} />}
                rightIcon={showPassword ? <EyeOff color={theme.colors.textMuted} size={20} /> : <Eye color={theme.colors.textMuted} size={20} />}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            </View>

            {error ? (
              <Animated.View style={s.errorContainer}>
                <Text style={s.err}>{error}</Text>
              </Animated.View>
            ) : null}

            <Button
              title={loading ? '' : t('secure_login')}
              onPress={handleLogin}
              loading={loading}
              size="large"
              fullWidth
              style={s.loginBtn}
            />

            <TouchableOpacity style={s.demoBanner} onPress={fillDemo} activeOpacity={0.8}>
              <View style={s.demoIconWrap}>
                <Text style={{ fontSize: 20 }}>🧪</Text>
              </View>
              <View style={s.demoTextWrap}>
                <Text style={s.demoTitle}>{t('quick_demo_access')}</Text>
                <Text style={s.demoDesc}>{t('tap_to_autofill')}</Text>
              </View>
              <ChevronRight color={theme.colors.primary} size={20} />
            </TouchableOpacity>
          </Animated.View>

          <View style={s.footer}>
            <Text style={s.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Language')}>
              <Text style={s.footerLink}>Register Now</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFBFF' },
  scroll: { flexGrow: 1, padding: theme.spacing.xl, alignItems: 'center', justifyContent: 'center' },
  headerArea: { width: '100%', alignItems: 'center', marginBottom: 32 },
  logoWrap: { width: 100, height: 100, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm, marginBottom: 20 },
  logo: { width: 70, height: 70 },
  title: { fontSize: 28, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.5 },
  titleRow: { marginBottom: 6 },
  sub: { color: theme.colors.textMuted, textAlign: 'center', fontSize: 15, fontWeight: '500' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24, ...theme.shadows.md, borderCurve: 'continuous' },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  phoneRow: { flexDirection: 'row', gap: 12 },
  codeBox: { backgroundColor: theme.colors.surfaceAlt, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', minHeight: 52, borderWidth: 1.5, borderColor: theme.colors.border },
  codeText: { fontWeight: '700', color: theme.colors.text, fontSize: 15 },
  errorContainer: { backgroundColor: theme.colors.dangerLight, padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FCA5A5' },
  err: { color: theme.colors.danger, textAlign: 'center', fontWeight: '600', fontSize: 13 },

  loginBtn: { height: 56, borderRadius: 16, marginBottom: 24 },
  demoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#BAE6FD' },
  demoIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm, marginRight: 14 },
  demoTextWrap: { flex: 1 },
  demoTitle: { fontWeight: '800', fontSize: 15, color: '#0369A1', marginBottom: 2 },
  demoDesc: { fontSize: 13, color: '#0EA5E9', fontWeight: '500' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  footerText: { color: theme.colors.textMuted, fontSize: 15, fontWeight: '500' },
  footerLink: { color: theme.colors.primary, fontWeight: '800', fontSize: 15 },
});

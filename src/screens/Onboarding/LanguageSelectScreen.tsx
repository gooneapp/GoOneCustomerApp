/**
 * GoOne Customer App — Language Select Screen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES = [
  { code: 'ta' as const, name: 'தமிழ்', english: 'Tamil', flag: '🇮🇳' },
  { code: 'en' as const, name: 'English', english: 'English', flag: '🇬🇧' },
  { code: 'hi' as const, name: 'हिन्दी', english: 'Hindi', flag: '🇮🇳' },
];

export const LanguageSelectScreen: React.FC<any> = ({ navigation }) => {
  const { setLanguage } = useAuthStore();
  const select = async (code: 'ta' | 'en' | 'hi') => { await setLanguage(code); navigation.navigate('OtpRequest'); };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logo}><Text style={styles.logoText}>G1</Text></View>
        <Text style={styles.title}>GoOne</Text>
        <Text style={styles.sub}>Customer App</Text>
        <Text style={styles.prompt}>Choose your language</Text>
        {LANGUAGES.map((l) => (
          <TouchableOpacity key={l.code} style={styles.langCard} onPress={() => select(l.code)} activeOpacity={0.85}>
            <Text style={{ fontSize: 28 }}>{l.flag}</Text>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.langName}>{l.name}</Text>
              <Text style={styles.langEnglish}>{l.english}</Text>
            </View>
            <Text style={{ fontSize: 20 }}>→</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.alreadyHave}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 80, height: 80, borderRadius: 24, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  title: { fontSize: 32, fontWeight: '900', color: theme.colors.text, letterSpacing: -1 },
  sub: { color: theme.colors.textMuted, marginBottom: theme.spacing.xl },
  prompt: { fontSize: 18, fontWeight: '700', marginBottom: theme.spacing.lg, color: theme.colors.text },
  langCard: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 20, marginBottom: 12, borderWidth: 1.5, borderColor: theme.colors.border, ...theme.shadows.sm },
  langName: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  langEnglish: { color: theme.colors.textMuted, marginTop: 2 },
  alreadyHave: { color: theme.colors.primary, fontWeight: '700', marginTop: theme.spacing.xl, fontSize: 14 },
});

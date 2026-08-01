import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { authApi } from '../../api/client';
import { Speakable, SpeakerIcon } from '../../components/Speakable';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackParamList } from '../../navigation/types';

const TOS_PARAGRAPHS = [
  'By using GoOne Customer App, you agree to our Terms of Service and Privacy Policy. We collect your location to show nearby businesses and enable ride booking. Your data is never sold to third parties. You can delete your account anytime from Profile settings.',
  'GoOne is a platform connecting local businesses with customers. Transactions are between businesses and customers directly. GoOne may take a service fee on completed rides. All payment disputes should be raised within 24 hours.',
  'Voice guidance in Tamil, English, or Hindi is available throughout the app. This feature can be disabled from Language Settings.',
];
const TOS_TEXT = TOS_PARAGRAPHS.join(' ');

type Props = NativeStackScreenProps<AuthStackParamList, 'Consent'>;

export const ConsentScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const handleAgree = async () => {
    setLoading(true);
    try {
      await authApi.recordConsent('terms_of_service', '1.0');
    } catch {
      setLoading(false);
      Alert.alert('Could Not Save Consent', 'Please check your connection and try again.', [
        { text: 'Retry', onPress: handleAgree },
        { text: 'Cancel' },
      ]);
      return;
    }
    setLoading(false);
    // 'Main' lives in RootStackParamList, not AuthStackParamList — this is a
    // deliberate cross-navigator jump to the parent RootStack (the same
    // pattern LoginScreen uses), so it falls outside this screen's own
    // typed navigation prop.
    (navigation as any).replace('Main');
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Speakable text="Terms & Privacy" textStyle={styles.title} containerStyle={styles.titleRow} />
        <View style={styles.subRow}>
          <Text style={styles.sub}>Please read and agree to continue</Text>
          <SpeakerIcon text={TOS_TEXT} style={styles.subSpeaker} />
        </View>
        <ScrollView style={styles.box} showsVerticalScrollIndicator={false}>
          <Text style={styles.tos}>{TOS_PARAGRAPHS.join('\n\n')}</Text>
        </ScrollView>
        <Button title={loading ? '' : 'I Agree & Continue'} onPress={handleAgree} loading={loading} size="large" fullWidth style={{ marginTop: 16 }} />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.xl },
  title: { fontSize: 26, fontWeight: '900', color: theme.colors.text },
  titleRow: { marginBottom: 8 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: theme.spacing.lg },
  sub: { color: theme.colors.textMuted },
  subSpeaker: {},
  box: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 },
  tos: { color: theme.colors.textMuted, lineHeight: 22, fontSize: 14 },
});

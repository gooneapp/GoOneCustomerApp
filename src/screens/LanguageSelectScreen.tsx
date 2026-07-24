import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { Globe } from 'lucide-react-native';

const LANGUAGES = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

export const LanguageSelectScreen: React.FC<any> = ({ navigation }) => {
  const [selected, setSelected] = useState('en');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Globe color={theme.colors.primary} size={48} />
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.subtitle}>Select the language you want to use the app in.</Text>
      </View>

      <View style={styles.list}>
        {LANGUAGES.map(lang => (
          <TouchableOpacity
            key={lang.id}
            style={[
              styles.langCard,
              selected === lang.id && styles.langCardSelected
            ]}
            onPress={() => setSelected(lang.id)}
          >
            <View style={styles.langTextContainer}>
              <Text style={styles.nativeName}>{lang.nativeName}</Text>
              <Text style={styles.englishName}>{lang.name}</Text>
            </View>
            <View style={[styles.radio, selected === lang.id && styles.radioSelected]}>
              {selected === lang.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Button 
          title="Continue" 
          onPress={() => navigation.navigate('Login')} 
          size="large"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h2,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  list: {
    flex: 1,
    gap: theme.spacing.md,
  },
  langCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  langTextContainer: {
    flex: 1,
  },
  nativeName: {
    ...theme.typography.h3,
    marginBottom: 4,
  },
  englishName: {
    ...theme.typography.caption,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
  }
});

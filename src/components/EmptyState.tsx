/**
 * GoOne Customer App — EmptyState
 * Extracted from ShopScreen's ListEmptyComponent (icon + title + subtitle +
 * optional CTA) — the best-realized empty state already in the app — so
 * every list screen can share one instead of hand-rolling its own.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  subtitle,
  ctaLabel,
  onCtaPress,
}) => (
  <View style={styles.centered}>
    <Text style={styles.emoji}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {ctaLabel && onCtaPress ? (
      <Button title={ctaLabel} onPress={onCtaPress} style={styles.cta} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { ...theme.typography.h3, marginBottom: 8, textAlign: 'center' },
  subtitle: { ...theme.typography.subtitle, textAlign: 'center' },
  cta: { marginTop: theme.spacing.lg },
});

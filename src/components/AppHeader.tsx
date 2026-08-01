/**
 * GoOne Customer App — AppHeader
 * Single reusable header replacing the hand-rolled header block that was
 * duplicated (with subtle drift) across every screen.
 *
 * variant="main": logo + tappable location + optional voice button +
 * notification bell + avatar. Used on Home/Shop/Rides/Wallet.
 * variant="sub": back arrow + title + optional right slot. Used everywhere
 * else.
 *
 * No top safe-area inset is applied here — every screen that currently owns
 * this header block renders it inside its own <SafeAreaView>, which already
 * accounts for the status bar. Adding insets here too would double-pad.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Bell, ArrowLeft } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useLocationStore } from '../store/locationStore';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { SpeakerIcon } from './Speakable';

interface AppHeaderProps {
  variant: 'main' | 'sub';
  // variant="main"
  onLocationPress?: () => void;
  // variant="sub"
  title?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  variant,
  onLocationPress,
  title,
  onBack,
  rightSlot,
}) => {
  const navigation = useNavigation<any>();

  if (variant === 'sub') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack ?? (() => navigation.goBack())}
          accessibilityLabel="Go back"
        >
          <ArrowLeft color={theme.colors.text} size={22} />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {title ? <SpeakerIcon text={title} size={14} /> : null}
        </View>
        {rightSlot ?? <View style={styles.balanceSpacer} />}
      </View>
    );
  }

  return <MainHeader onLocationPress={onLocationPress} navigation={navigation} />;
};

interface MainHeaderProps {
  onLocationPress?: () => void;
  navigation: any;
}

// Keeps the header from stretching into a second line on a long address —
// first segment (street/landmark) is what's actually useful at a glance;
// the rest is still reachable by tapping through to the full picker.
function shortenLocation(address: string): string {
  const firstSegment = address.split(',')[0]?.trim() || address;
  return firstSegment.length > 28 ? `${firstSegment.slice(0, 27)}…` : firstSegment;
}

const MainHeader: React.FC<MainHeaderProps> = ({ onLocationPress, navigation }) => {
  const { address, isLoading, permissionStatus } = useLocationStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { user } = useAuthStore();

  const locationLabel = isLoading
    ? 'Locating…'
    : address
    ? shortenLocation(address)
    : permissionStatus === 'denied' || permissionStatus === 'blocked'
    ? 'Enable location'
    : 'Select location';

  const initial = (user?.name || 'U')[0].toUpperCase();
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <View style={styles.container}>
      <Image source={require('../Logo.png')} style={styles.logo} resizeMode="contain" />

      <TouchableOpacity style={styles.locationBtn} onPress={onLocationPress} accessibilityLabel="Change location">
        <MapPin color={theme.colors.primary} size={14} />
        <Text style={styles.locationText} numberOfLines={1}>
          {locationLabel}
        </Text>
      </TouchableOpacity>

      <View style={styles.rightGroup}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('Notifications')}
          accessibilityLabel="Notifications"
        >
          <Bell color={theme.colors.text} size={22} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeLabel}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Profile"
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  // — sub variant —
  backBtn: { padding: 8 },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  title: { ...theme.typography.h3, flexShrink: 1, textAlign: 'center' },
  balanceSpacer: { width: 24 },
  // — main variant —
  logo: { width: 30, height: 30, marginRight: 10 },
  locationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginRight: theme.spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
  },
  locationText: { fontSize: 13, fontWeight: '700', color: theme.colors.text, flexShrink: 1 },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '900', color: '#fff' },
});

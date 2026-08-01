import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, ArrowLeft, MapPin, ChevronDown } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useLocationStore } from '../store/locationStore';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { SpeakerIcon } from './Speakable';

function shortenLocation(address: string): string {
  const firstSegment = address.split(',')[0]?.trim() || address;
  return firstSegment.length > 28 ? `${firstSegment.slice(0, 27)}…` : firstSegment;
}

interface AppHeaderProps {
  variant: 'main' | 'sub';
  title?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  variant,
  title,
  onBack,
  rightSlot,
}) => {
  const navigation = useNavigation<any>();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { user } = useAuthStore();
  const { address, isLoading, permissionStatus } = useLocationStore();

  const initial = (user?.name || 'U')[0].toUpperCase();
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  const locationLabel = isLoading
    ? 'Locating…'
    : address
    ? shortenLocation(address)
    : permissionStatus === 'denied' || permissionStatus === 'blocked'
    ? 'Enable location'
    : 'Select location';

  return (
    <View style={styles.container}>
      {variant === 'sub' ? (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack ?? (() => navigation.goBack())}
          accessibilityLabel="Go back"
        >
          <ArrowLeft color={theme.colors.text} size={22} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Profile"
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </TouchableOpacity>
      )}

      {variant === 'main' ? (
        <TouchableOpacity
          style={styles.locationSelector}
          onPress={() => navigation.navigate('LocationPicker')}
          accessibilityLabel="Change location"
        >
          <View style={styles.locationIconBg}>
            <MapPin color={theme.colors.primary} size={18} />
          </View>
          <View style={styles.locationTextCol}>
            <Text style={styles.locationTitle}>Current Location</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.locationValue} numberOfLines={1}>{locationLabel}</Text>
              <ChevronDown color={theme.colors.primary} size={16} />
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title || ''}
          </Text>
          {title ? <SpeakerIcon text={title} size={14} /> : null}
        </View>
      )}

      {rightSlot !== undefined ? (
        rightSlot
      ) : (
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
        </View>
      )}
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
  backBtn: { padding: 8, width: 40 },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  title: { ...theme.typography.h3, flexShrink: 1, textAlign: 'center' },
  rightGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: 40 },
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
  locationSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  locationIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  locationTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    flexShrink: 1,
  },
});

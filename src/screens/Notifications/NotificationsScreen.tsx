/**
 * GoOne Customer App — Notifications
 * Reached via the AppHeader bell (main-variant screens). Backend-only feed,
 * no push/FCM — fetch() is also called once at app start in AppNavigator so
 * the header badge is populated without this screen needing to mount first.
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { AppHeader } from '../../components/AppHeader';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { useNotificationStore, NotificationItem } from '../../store/notificationStore';

export const NotificationsScreen: React.FC<any> = () => {
  const { items, isLoading, error, fetch, markRead } = useNotificationStore();

  // Fires on mount and on every subsequent focus, so the list stays fresh
  // when the user navigates back here after reading something elsewhere.
  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch]),
  );

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const unread = item.openedAt === null;
    return (
      <TouchableOpacity
        style={[styles.row, unread && styles.rowUnread]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.7}
      >
        {unread ? <View style={styles.unreadDot} /> : <View style={styles.readSpacer} />}
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, unread && styles.rowTitleUnread]} numberOfLines={1}>
            {item.title ?? 'Notification'}
          </Text>
          <Text style={styles.rowBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.rowDate}>{new Date(item.createdAt).toLocaleString('en-IN')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // isLoading only takes over the whole screen on the very first (empty-list)
  // load — a background refetch-on-focus with existing rows already showing
  // shouldn't blank the list out from under the user.
  const showFullLoading = isLoading && items.length === 0;
  const showFullError = !!error && items.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader variant="sub" title="Notifications" />
      {showFullLoading ? (
        <LoadingView />
      ) : showFullError ? (
        <EmptyState icon="⚠️" title="Something went wrong" subtitle={error ?? undefined} ctaLabel="Retry" onCtaPress={fetch} />
      ) : (
        <>
          {error && items.length > 0 ? <Text style={styles.errorBanner}>{error}</Text> : null}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
            ListEmptyComponent={<EmptyState icon="🔔" title="No notifications yet" />}
            renderItem={renderItem}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.md },
  emptyList: { flexGrow: 1 },
  errorBanner: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.dangerLight,
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  rowUnread: { borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginTop: 6 },
  readSpacer: { width: 8 },
  rowTitle: { ...theme.typography.bodyMedium },
  rowTitleUnread: { fontWeight: '800', color: theme.colors.text },
  rowBody: { ...theme.typography.caption, marginTop: 2 },
  rowDate: { ...theme.typography.caption, color: theme.colors.textLight, marginTop: 4 },
});

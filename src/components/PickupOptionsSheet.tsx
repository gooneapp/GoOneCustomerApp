/**
 * GoOne Customer App — Pickup Location Options
 * Bottom-sheet style modal offering the three ways to set a pickup point:
 * Auto Detect (GPS, default), Manual Search (Google Places), Map Selection.
 * Used by RideBookingScreen; kept generic enough to reuse for drop-off later.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Crosshair, Search, Map as MapIcon, X } from 'lucide-react-native';
import { theme } from '../theme/theme';

interface PickupOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onAutoDetect: () => void;
  onSearch: () => void;
  onMapSelect: () => void;
}

export const PickupOptionsSheet: React.FC<PickupOptionsSheetProps> = ({
  visible,
  onClose,
  onAutoDetect,
  onSearch,
  onMapSelect,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>Set Pickup Location</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <X color={theme.colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.option} activeOpacity={0.7} onPress={onAutoDetect}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryLight }]}>
              <Crosshair color={theme.colors.primary} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Auto Detect</Text>
              <Text style={styles.optionSubtitle}>Use your current GPS location (default)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} activeOpacity={0.7} onPress={onSearch}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.secondaryLight }]}>
              <Search color={theme.colors.secondary} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Search Location</Text>
              <Text style={styles.optionSubtitle}>Type an address, area, or landmark</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} activeOpacity={0.7} onPress={onMapSelect}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.warningLight }]}>
              <MapIcon color={theme.colors.warning} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Choose on Map</Text>
              <Text style={styles.optionSubtitle}>Drag the map to pin an exact spot</Text>
            </View>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, alignSelf: 'center', marginBottom: theme.spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  title: { ...theme.typography.h3 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: theme.radius.md, justifyContent: 'center', alignItems: 'center' },
  optionTitle: { ...theme.typography.bodyMedium, fontSize: 15, marginBottom: 2 },
  optionSubtitle: { ...theme.typography.caption },
});

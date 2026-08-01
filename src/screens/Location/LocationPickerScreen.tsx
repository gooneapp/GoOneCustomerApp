/**
 * GoOne Customer App — Location Picker
 * Pushed from AppHeader's "change location" tap (main-variant screens:
 * Home/Shop/Rides/Wallet). Lets the customer search for and select a
 * location via the backend-proxied Google Places autocomplete/details
 * endpoints, or fall back to GPS via Home's existing flow.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { AppHeader } from '../../components/AppHeader';
import { Input } from '../../components/Input';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { placesApi } from '../../api/client';
import { useLocationStore } from '../../store/locationStore';
import type { LocationPickerParams } from '../../navigation/types';

interface Prediction {
  placeId: string;
  description: string;
}

// This screen is registered identically on all 4 tab stacks (Home/Shop/
// Rides/Wallet) and can `navigate()` both to an arbitrary caller-supplied
// screen (via `returnTo`) and cross-navigator to the Home tab — neither fits
// a single stack's strict NativeStackNavigationProp, so only `route` (the
// one thing whose shape is genuinely fixed here) is typed.
interface LocationPickerRoute {
  params?: LocationPickerParams;
}

const DEBOUNCE_MS = 400;

// Doesn't need to be a real UUID — just unique-enough per screen visit, and
// stable across keystrokes so autocomplete + the final details() call are
// billed by Google as a single search session instead of per-request.
const genSessionToken = () => `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

export const LocationPickerScreen: React.FC<{ navigation: any; route: LocationPickerRoute }> = ({ navigation, route }) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTokenRef = useRef<string>(genSessionToken());

  const setManualLocation = useLocationStore((s) => s.setManualLocation);

  const runSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setPredictions([]);
      setSearchError(null);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const result = await placesApi.autocomplete(text, sessionTokenRef.current);
      setPredictions(result || []);
    } catch (err: any) {
      setSearchError(
        err?.response?.status === 503
          ? 'Location search is temporarily unavailable.'
          : 'Unable to search right now. Please try again.',
      );
      setPredictions([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(text), DEBOUNCE_MS);
  };

  const handleSelect = async (prediction: Prediction) => {
    try {
      const result = await placesApi.details(prediction.placeId, sessionTokenRef.current);
      // When pushed with a `returnTo: {screen, field}` param, hand the picked
      // coordinates back to that arbitrary calling screen via navigate
      // instead of writing through the global location store — lets callers
      // like Ride Booking / Checkout capture a location (e.g. drop-off,
      // delivery address) without disturbing the app-wide "current location"
      // used by Home/Shop/Rides/Wallet's AppHeader. Default (no returnTo) is
      // unchanged: write to locationStore and go back, exactly as before.
      const returnTo = route?.params?.returnTo;
      if (returnTo) {
        navigation.navigate(returnTo.screen, {
          [returnTo.field]: { address: result.formattedAddress, lat: result.lat, lng: result.lng },
        });
      } else {
        setManualLocation({ lat: result.lat, lng: result.lng, address: result.formattedAddress });
        navigation.goBack();
      }
    } catch {
      setSearchError('Unable to load that location. Please try another.');
    }
  };

  // "Use current location": only HomeScreen is allowed to call
  // requestPermissionAndLocation() directly (see the invariant documented at
  // the top of locationStore.ts — calling it elsewhere risks a permission
  // prompt vs. Google Maps Fragment mount race). Rather than duplicate that
  // GPS-triggering call here, we simply navigate back to the Home tab —
  // HomeScreen's own existing mount/focus effect already re-requests
  // location, so the flow works correctly without touching the invariant.
  const handleUseCurrentLocation = () => {
    // navigate('HomeTab') alone is a no-op when HomeTab is already the
    // focused tab (its default behavior does not reset a nested stack back
    // to its root screen) — this screen can be pushed from any tab's own
    // stack (Home/Shop/Rides/Wallet), so explicitly target HomeTab's Home
    // screen to guarantee we actually land back on Home in every case.
    navigation.navigate('HomeTab', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader variant="sub" title="Select Location" />

      <View style={styles.searchWrap}>
        <Input
          placeholder="Search for an address, area, landmark..."
          value={query}
          onChangeText={handleChangeText}
          autoFocus
        />
      </View>

      <TouchableOpacity style={styles.currentLocationRow} onPress={handleUseCurrentLocation}>
        <View style={styles.currentLocationIcon}>
          <Navigation color={theme.colors.primary} size={18} />
        </View>
        <Text style={styles.currentLocationText}>Use current location</Text>
      </TouchableOpacity>

      {searchError ? <Text style={styles.errorBanner}>{searchError}</Text> : null}

      {isSearching ? (
        <LoadingView />
      ) : (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.placeId}
          contentContainerStyle={predictions.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            hasSearched && !searchError ? (
              <EmptyState icon="📍" title="No results" subtitle="Try a different search" />
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
              <MapPin color={theme.colors.textLight} size={18} />
              <Text style={styles.rowText} numberOfLines={2}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  searchWrap: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryLight,
  },
  currentLocationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationText: { ...theme.typography.bodyMedium, color: theme.colors.primary },
  errorBanner: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.dangerLight,
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  list: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl },
  emptyList: { flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  rowText: { ...theme.typography.body, flex: 1 },
});

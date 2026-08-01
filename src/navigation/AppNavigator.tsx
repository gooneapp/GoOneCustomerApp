/**
 * GoOne Customer App — Root Navigator
 * Home uses TWO-CARD selection (Shop Local / Book a Ride) as requested.
 * 4-tab bottom bar: Home, Shop, Rides, Wallet. There is no dedicated
 * "Orders" tab — MyOrders/OrderTracking are registered inside HomeStack
 * (and OrderTracking additionally in ShopStack, since Checkout lives there),
 * the same per-tab-stack pattern already used for LocationPicker/Notifications.
 */

import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Home, ShoppingBag, Car, BookOpen } from 'lucide-react-native';

import { theme } from '../theme/theme';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useTranslation, type TranslationKey } from '../utils/i18n';

// ── Auth
import { SplashScreen } from '../screens/SplashScreen';
import { LanguageSelectScreen } from '../screens/Onboarding/LanguageSelectScreen';
import { OtpRequestScreen } from '../screens/Onboarding/OtpRequestScreen';
import { OtpVerifyScreen } from '../screens/Onboarding/OtpVerifyScreen';
import { SetPasswordScreen } from '../screens/Onboarding/SetPasswordScreen';
import { ConsentScreen } from '../screens/Onboarding/ConsentScreen';
import { LoginScreen } from '../screens/LoginScreen';

// ── Home Tab
import { HomeScreen } from '../screens/Home/HomeScreen';

// ── Shop Tab
import { ShopScreen } from '../screens/Shop/ShopScreen';
import { BusinessDetailScreen } from '../screens/Shop/BusinessDetailScreen';
import { CartScreen } from '../screens/Shop/CartScreen';
import { CheckoutScreen } from '../screens/Shop/CheckoutScreen';

// ── Rides Tab
import { RideBookingScreen } from '../screens/Rides/RideBookingScreen';
import { RideTrackingScreen } from '../screens/Rides/RideTrackingScreen';
import { RideHistoryScreen } from '../screens/Rides/RideHistoryScreen';

// ── Orders (no dedicated tab — registered in HomeStack/ShopStack, see the
// header comment above)
import { MyOrdersScreen } from '../screens/Orders/MyOrdersScreen';
import { OrderTrackingScreen } from '../screens/Orders/OrderTrackingScreen';

// ── Credit/Wallet Tab
import { NotesScreen } from '../screens/Notes/NotesScreen';
import { ExpenseTrackerScreen } from '../screens/Wallet/ExpenseTrackerScreen';

// ── Profile
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

// ── Location + Notifications (registered on all 4 tab stacks — the
// main-variant AppHeader on Home/Shop/Rides/Wallet is the entry point to both)
import { LocationPickerScreen } from '../screens/Location/LocationPickerScreen';
import { MapSelectionScreen } from '../screens/Location/MapSelectionScreen';
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen';

import type {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  HomeStackParamList,
  ShopStackParamList,
  RidesStackParamList,
  WalletStackParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ShopStack = createNativeStackNavigator<ShopStackParamList>();
const RidesStack = createNativeStackNavigator<RidesStackParamList>();
const WalletStack = createNativeStackNavigator<WalletStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

const stackOptions = { headerShown: false };
const tabOptions = { headerShown: false };

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={stackOptions}>
    <AuthStack.Screen name="Language" component={LanguageSelectScreen} />
    <AuthStack.Screen name="OtpRequest" component={OtpRequestScreen} />
    <AuthStack.Screen name="OtpVerify" component={OtpVerifyScreen} />
    <AuthStack.Screen name="SetPassword" component={SetPasswordScreen} />
    <AuthStack.Screen name="Consent" component={ConsentScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={stackOptions}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="Profile" component={ProfileScreen} />
    <HomeStack.Screen name="LocationPicker" component={LocationPickerScreen} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    <HomeStack.Screen name="MyOrders" component={MyOrdersScreen} />
    <HomeStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
  </HomeStack.Navigator>
);

const ShopNavigator = () => (
  <ShopStack.Navigator screenOptions={stackOptions}>
    <ShopStack.Screen name="Shop" component={ShopScreen} />
    <ShopStack.Screen name="Profile" component={ProfileScreen} />
    <ShopStack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
    <ShopStack.Screen name="Cart" component={CartScreen} />
    <ShopStack.Screen name="Checkout" component={CheckoutScreen} />
    <ShopStack.Screen name="LocationPicker" component={LocationPickerScreen} />
    <ShopStack.Screen name="Notifications" component={NotificationsScreen} />
    <ShopStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
  </ShopStack.Navigator>
);

const RidesNavigator = () => (
  <RidesStack.Navigator screenOptions={stackOptions}>
    <RidesStack.Screen name="RideBooking" component={RideBookingScreen} />
    <RidesStack.Screen name="Profile" component={ProfileScreen} />
    <RidesStack.Screen name="RideTracking" component={RideTrackingScreen} />
    <RidesStack.Screen name="RideHistory" component={RideHistoryScreen} />
    <RidesStack.Screen name="LocationPicker" component={LocationPickerScreen} />
    <RidesStack.Screen name="MapSelection" component={MapSelectionScreen} />
    <RidesStack.Screen name="Notifications" component={NotificationsScreen} />
  </RidesStack.Navigator>
);

const WalletNavigator = () => (
  <WalletStack.Navigator screenOptions={stackOptions}>
    <WalletStack.Screen name="Wallet" component={NotesScreen} />
    <WalletStack.Screen name="Profile" component={ProfileScreen} />
    <WalletStack.Screen name="ExpenseTracker" component={ExpenseTrackerScreen} />
    <WalletStack.Screen name="LocationPicker" component={LocationPickerScreen} />
    <WalletStack.Screen name="Notifications" component={NotificationsScreen} />
  </WalletStack.Navigator>
);

const TABS: Array<{ name: string; labelKey: TranslationKey; Icon: any; navigator: React.ComponentType }> = [
  { name: 'HomeTab', labelKey: 'home', Icon: Home, navigator: HomeNavigator },
  { name: 'ShopTab', labelKey: 'shop', Icon: ShoppingBag, navigator: ShopNavigator },
  { name: 'RidesTab', labelKey: 'rides', Icon: Car, navigator: RidesNavigator },
  { name: 'WalletTab', labelKey: 'notes', Icon: BookOpen, navigator: WalletNavigator },
];

const GoOneTabBar = ({ state, navigation }: any) => {
  const { t } = useTranslation();
  
  return (
    <View style={tabStyles.bar}>
      {TABS.map((tab, idx) => {
        const focused = state.index === idx;
        const Icon = tab.Icon;
        return (
          <TouchableOpacity key={tab.name} style={tabStyles.item} onPress={() => navigation.navigate(tab.name)}>
            <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
              <Icon color={focused ? theme.colors.primary : theme.colors.textLight} size={22} />
            </View>
            <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{t(tab.labelKey)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const tabStyles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingVertical: 8, ...theme.shadows.md },
  item: { flex: 1, alignItems: 'center' },
  iconWrap: { width: 40, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  iconWrapActive: { backgroundColor: theme.colors.primaryLight },
  label: { fontSize: 10, fontWeight: '500', color: theme.colors.textLight },
  labelActive: { color: theme.colors.primary, fontWeight: '700' },
});

const MainTabs = () => (
  <Tab.Navigator screenOptions={tabOptions} tabBar={(props) => <GoOneTabBar {...props} />}>
    <Tab.Screen name="HomeTab" component={HomeNavigator} />
    <Tab.Screen name="ShopTab" component={ShopNavigator} />
    <Tab.Screen name="RidesTab" component={RidesNavigator} />
    <Tab.Screen name="WalletTab" component={WalletNavigator} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const fetchNotifications = useNotificationStore((s) => s.fetch);

  // Mount-once effect (auth init + one-time notification fetch so the
  // AppHeader bell badge is populated at app start). initialize/
  // fetchNotifications are stable zustand action references, so
  // intentionally not in the dependency array.
  useEffect(() => {
    initialize();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={stackOptions}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <RootStack.Screen name="Main" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

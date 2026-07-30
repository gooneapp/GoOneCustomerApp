/**
 * GoOne Customer App — Root Navigator
 * Home uses TWO-CARD selection (Shop Local / Book a Ride) as requested.
 * 4-tab bottom bar: Home, Orders, My Rides, Credit/Wallet
 */

import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Home, ShoppingBag, Car, Wallet } from 'lucide-react-native';

import { theme } from '../theme/theme';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

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
import { ProductDetailScreen } from '../screens/Shop/ProductDetailScreen';
import { CartScreen } from '../screens/Shop/CartScreen';
import { CheckoutScreen } from '../screens/Shop/CheckoutScreen';

// ── Rides Tab
import { RideBookingScreen } from '../screens/Rides/RideBookingScreen';
import { RideTrackingScreen } from '../screens/Rides/RideTrackingScreen';
import { RideHistoryScreen } from '../screens/Rides/RideHistoryScreen';

// ── Orders Tab
import { MyOrdersScreen } from '../screens/Orders/MyOrdersScreen';
import { OrderTrackingScreen } from '../screens/Orders/OrderTrackingScreen';

// ── Credit/Wallet Tab
import { WalletScreen } from '../screens/Wallet/WalletScreen';
import { ExpenseTrackerScreen } from '../screens/Wallet/ExpenseTrackerScreen';

// ── Profile
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

// ── Location + Notifications (registered on all 4 tab stacks — the
// main-variant AppHeader on Home/Shop/Rides/Wallet is the entry point to both)
import { LocationPickerScreen } from '../screens/Location/LocationPickerScreen';
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ShopStack = createNativeStackNavigator();
const RidesStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const WalletStack = createNativeStackNavigator();

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
  </HomeStack.Navigator>
);

const ShopNavigator = () => (
  <ShopStack.Navigator screenOptions={stackOptions}>
    <ShopStack.Screen name="Shop" component={ShopScreen} />
    <ShopStack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
    <ShopStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <ShopStack.Screen name="Cart" component={CartScreen} />
    <ShopStack.Screen name="Checkout" component={CheckoutScreen} />
    <ShopStack.Screen name="LocationPicker" component={LocationPickerScreen} />
    <ShopStack.Screen name="Notifications" component={NotificationsScreen} />
  </ShopStack.Navigator>
);

const RidesNavigator = () => (
  <RidesStack.Navigator screenOptions={stackOptions}>
    <RidesStack.Screen name="RideBooking" component={RideBookingScreen} />
    <RidesStack.Screen name="RideTracking" component={RideTrackingScreen} />
    <RidesStack.Screen name="RideHistory" component={RideHistoryScreen} />
    <RidesStack.Screen name="LocationPicker" component={LocationPickerScreen} />
    <RidesStack.Screen name="Notifications" component={NotificationsScreen} />
  </RidesStack.Navigator>
);

const OrdersNavigator = () => (
  <OrdersStack.Navigator screenOptions={stackOptions}>
    <OrdersStack.Screen name="MyOrders" component={MyOrdersScreen} />
    <OrdersStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
  </OrdersStack.Navigator>
);

const WalletNavigator = () => (
  <WalletStack.Navigator screenOptions={stackOptions}>
    <WalletStack.Screen name="Wallet" component={WalletScreen} />
    <WalletStack.Screen name="ExpenseTracker" component={ExpenseTrackerScreen} />
    <WalletStack.Screen name="LocationPicker" component={LocationPickerScreen} />
    <WalletStack.Screen name="Notifications" component={NotificationsScreen} />
  </WalletStack.Navigator>
);

const TABS = [
  { name: 'HomeTab', label: 'Home', Icon: Home, navigator: HomeNavigator },
  { name: 'ShopTab', label: 'Shop', Icon: ShoppingBag, navigator: ShopNavigator },
  { name: 'RidesTab', label: 'Rides', Icon: Car, navigator: RidesNavigator },
  { name: 'WalletTab', label: 'Wallet', Icon: Wallet, navigator: WalletNavigator },
];

const GoOneTabBar = ({ state, navigation }: any) => (
  <View style={tabStyles.bar}>
    {TABS.map((tab, idx) => {
      const focused = state.index === idx;
      const Icon = tab.Icon;
      return (
        <TouchableOpacity key={tab.name} style={tabStyles.item} onPress={() => navigation.navigate(tab.name)}>
          <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
            <Icon color={focused ? theme.colors.primary : theme.colors.textLight} size={22} />
          </View>
          <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

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

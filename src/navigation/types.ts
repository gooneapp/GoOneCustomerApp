/**
 * GoOne Customer App — Navigation param-list types
 *
 * One param-list type per tab stack (+ Auth), matching the screens actually
 * registered in AppNavigator.tsx and the params actually passed by today's
 * `navigation.navigate(...)` call sites across `src/screens/`. Kept minimal
 * per the plan's "targeted, not exhaustive" type-safety decision — these
 * types are the shared contract every screen-level pass builds on; individual
 * screens are typed against them incrementally (see CheckoutScreen.tsx /
 * LocationPickerScreen.tsx for the worked NativeStackScreenProps example).
 */

// Shared by every stack that registers LocationPicker — `returnTo` lets a
// caller other than the global location store receive the picked coordinates
// directly (see LocationPickerScreen.handleSelect).
export type LocationPickerParams =
  | { returnTo?: { screen: string; field: string } }
  | undefined;

export type HomeStackParamList = {
  Home: undefined;
  Profile: undefined;
  LocationPicker: LocationPickerParams;
  Notifications: undefined;
  MyOrders: undefined;
  OrderTracking: { orderId: string };
};

export type ShopStackParamList = {
  // `filter` is forwarded from HomeScreen's quick-access row
  // (navigation.navigate('ShopTab', { filter: 'grocery' })) — React
  // Navigation applies params passed to a nested navigator's tab as the
  // initial params of that navigator's first screen.
  Shop: { filter?: string } | undefined;
  BusinessDetail: { businessId: string };
  Cart: undefined;
  // deliveryLocation is set via navigation.navigate when LocationPicker's
  // `returnTo: {screen:'Checkout', field:'deliveryLocation'}` hands back a
  // picked address (see LocationPickerScreen.handleSelect) — CheckoutScreen
  // reads it once, then clears it with navigation.setParams.
  Checkout: { deliveryLocation?: { address: string; lat: number; lng: number } } | undefined;
  LocationPicker: LocationPickerParams;
  Notifications: undefined;
  OrderTracking: { orderId: string };
};

export type RidesStackParamList = {
  // `dropoff`/`pickup` are set transiently by LocationPickerScreen's /
  // MapSelectionScreen's `returnTo` hand-off (see RideBookingScreen's
  // route.params-watching effects) and immediately cleared via
  // navigation.setParams once consumed.
  RideBooking: {
    dropoff?: { address: string; lat: number; lng: number };
    pickup?: { address: string; lat: number; lng: number };
  } | undefined;
  RideTracking: { requestId: string };
  RideHistory: undefined;
  LocationPicker: LocationPickerParams;
  // Same `returnTo` contract as LocationPicker — see MapSelectionScreen.
  MapSelection: LocationPickerParams;
  Notifications: undefined;
};

export type WalletStackParamList = {
  Wallet: undefined;
  ExpenseTracker: undefined;
  LocationPicker: LocationPickerParams;
  Notifications: undefined;
};

export type AuthStackParamList = {
  Language: undefined;
  OtpRequest: undefined;
  OtpVerify: { phone: string } | undefined;
  SetPassword: { phone: string; setup_token: string } | undefined;
  Consent: undefined;
  Login: undefined;
};

// The bottom-tab-bar level param list — each entry hosts its own nested
// native-stack navigator above, so tab screens generally don't need typed
// params of their own beyond addressing a nested screen
// (e.g. navigation.navigate('HomeTab', { screen: 'Home' })).
export type MainTabParamList = {
  HomeTab: undefined;
  ShopTab: undefined;
  RidesTab: undefined;
  WalletTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

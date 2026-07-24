import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme/theme';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { LanguageSelectScreen } from '../screens/LanguageSelectScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OtpVerificationScreen } from '../screens/OtpVerificationScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { BusinessProfileScreen } from '../screens/BusinessProfileScreen';
import { CartScreen } from '../screens/CartScreen';
import { BookRideScreen } from '../screens/BookRideScreen';
import { RideTrackingScreen } from '../screens/RideTrackingScreen';
import { OrderTrackingScreen } from '../screens/OrderTrackingScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.danger,
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        
        {/* Main App Screens */}
        <Stack.Screen name="MainTabs" component={HomeScreen} />
        <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="BookRide" component={BookRideScreen} />
        <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

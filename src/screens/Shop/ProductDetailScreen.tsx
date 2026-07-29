import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
export const ProductDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const { product } = route.params || {};
  return (<View style={styles.safe}><Text style={styles.t}>{product?.name || 'Product'}</Text></View>);
};
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }, t: { ...theme.typography.h3 } });

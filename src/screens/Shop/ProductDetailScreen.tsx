import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
export const ProductDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const { product } = route.params || {};
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader variant="sub" title={product?.name || 'Product'} />
      <View style={styles.content}>
        <Text style={styles.t}>{product?.name || 'Product'}</Text>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  t: { ...theme.typography.h3 },
});

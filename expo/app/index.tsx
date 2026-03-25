import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import { View, StyleSheet } from 'react-native';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <AuthGuard>
        <View style={styles.container} />
      </AuthGuard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1F',
  },
});
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="rgba(255,255,255,0.3)" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingScreen;

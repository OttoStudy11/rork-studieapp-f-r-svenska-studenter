import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import MathAIChat from '@/components/MathAIChat';

export default function MathChatScreen() {
  return (
    <View style={styles.container}>
      <MathAIChat onBack={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import GeneralAIChat from '@/components/GeneralAIChat';

export default function GeneralChatScreen() {
  return (
    <View style={styles.container}>
      <GeneralAIChat onBack={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

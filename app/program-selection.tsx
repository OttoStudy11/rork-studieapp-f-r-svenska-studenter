import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ProgramPicker from '@/components/ProgramPicker';

export default function ProgramSelectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ProgramPicker />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import { View } from 'react-native';

export default function IndexScreen() {
  return (
    <AuthGuard>
      <View style={{ flex: 1 }} />
    </AuthGuard>
  );
}
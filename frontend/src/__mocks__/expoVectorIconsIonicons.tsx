import React from 'react';
import { View } from 'react-native';

/** Mock for @expo/vector-icons/Ionicons in tests (icons not required for nav structure tests). */
export default function Ionicons(_props: { name: string; size?: number; color?: string }) {
  return <View />;
}

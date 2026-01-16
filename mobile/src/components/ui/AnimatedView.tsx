import React from 'react';
import { View, ViewProps, Platform } from 'react-native';

// Web-compatible AnimatedView wrapper
// On web, we skip react-native-reanimated animations to avoid issues
// On native, we use the full reanimated library

interface AnimatedViewProps extends ViewProps {
  entering?: any;
  exiting?: any;
  layout?: any;
}

let ReanimatedView: React.ComponentType<any> | null = null;

if (Platform.OS !== 'web') {
  try {
    const Reanimated = require('react-native-reanimated');
    ReanimatedView = Reanimated.default?.View || Reanimated.View;
  } catch (e) {
    console.log('Reanimated not available');
  }
}

export default function AnimatedView({ entering, exiting, layout, children, ...props }: AnimatedViewProps & { children?: React.ReactNode }) {
  // On web, just use a regular View without animations
  if (Platform.OS === 'web' || !ReanimatedView) {
    return <View {...props}>{children}</View>;
  }

  // On native, use Reanimated with animations
  return (
    <ReanimatedView entering={entering} exiting={exiting} layout={layout} {...props}>
      {children}
    </ReanimatedView>
  );
}

// Re-export animation presets for convenience (they'll be ignored on web)
export const FadeInDown = Platform.OS !== 'web' ? require('react-native-reanimated').FadeInDown : { duration: () => ({ delay: () => ({}) }) };
export const FadeInUp = Platform.OS !== 'web' ? require('react-native-reanimated').FadeInUp : { duration: () => ({ delay: () => ({}) }) };
export const FadeIn = Platform.OS !== 'web' ? require('react-native-reanimated').FadeIn : { duration: () => ({ delay: () => ({}) }) };
export const FadeInRight = Platform.OS !== 'web' ? require('react-native-reanimated').FadeInRight : { duration: () => ({ delay: () => ({}) }) };
export const SlideInRight = Platform.OS !== 'web' ? require('react-native-reanimated').SlideInRight : { duration: () => ({ delay: () => ({}) }) };
export const ZoomIn = Platform.OS !== 'web' ? require('react-native-reanimated').ZoomIn : { duration: () => ({}) };

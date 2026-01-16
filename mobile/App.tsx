import React, { useState, useEffect, ErrorInfo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ActivityIndicator, Platform, ScrollView } from 'react-native';

// Lazy load gesture handler for web compatibility
let GestureHandlerRootView: React.ComponentType<any>;
if (Platform.OS !== 'web') {
  GestureHandlerRootView = require('react-native-gesture-handler').GestureHandlerRootView;
}

import Navigation from './src/navigation';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Error Boundary to catch React errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={styles.errorContainer} contentContainerStyle={styles.errorContent}>
          <Text style={styles.errorTitle}>Uygulama Hatası</Text>
          <Text style={styles.errorText}>{this.state.error?.message}</Text>
          <Text style={styles.errorStack}>{this.state.error?.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Small delay to ensure everything loads
        await new Promise(resolve => setTimeout(resolve, 100));
        setReady(true);
      } catch (e: any) {
        console.error('Init error:', e);
        setError(e.message);
      }
    };
    init();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>QuizCraft Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <>
      <Navigation />
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  const content = (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );

  // Web doesn't need GestureHandlerRootView
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{content}</View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {content}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  errorContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  errorTitle: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorStack: {
    color: '#888',
    fontSize: 12,
    textAlign: 'left',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
});

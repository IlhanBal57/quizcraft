import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import LeaderboardScreen from '../screens/main/LeaderboardScreen';
import AdminScreen from '../screens/main/AdminScreen';

// Quiz Screens
import QuizSetupScreen from '../screens/quiz/QuizSetupScreen';
import QuizPlayScreen from '../screens/quiz/QuizPlayScreen';
import QuizResultsScreen from '../screens/quiz/QuizResultsScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  QuizSetup: { categoryId?: number };
  QuizPlay: { quizId: string };
  QuizResults: { quizId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Profile: undefined;
  Admin: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
function AuthNavigator() {
  const { themeColors } = useTheme();
  
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: themeColors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Main Tab Navigator
function MainNavigator() {
  const { themeColors } = useTheme();
  const { user } = useAuthStore();
  
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.backgroundCard,
          borderTopColor: themeColors.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'shield' : 'shield-outline';
          }
          
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{ tabBarLabel: 'Leaderboard' }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
      {user?.role === 'admin' && (
        <MainTab.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{ tabBarLabel: 'Admin' }}
        />
      )}
    </MainTab.Navigator>
  );
}

// Loading Screen
function LoadingScreen() {
  const { themeColors } = useTheme();
  
  return (
    <View style={[styles.loading, { backgroundColor: themeColors.background }]}>
      <ActivityIndicator size="large" color={themeColors.primary} />
    </View>
  );
}

// Main Navigation
export default function Navigation() {
  const { isLoading, isAuthenticated, loadAuth } = useAuthStore();
  const { themeColors } = useTheme();

  useEffect(() => {
    loadAuth();
  }, []);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: themeColors.background,
      card: themeColors.backgroundCard,
      text: themeColors.text,
      border: themeColors.border,
      primary: themeColors.primary,
    },
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen 
              name="QuizSetup" 
              component={QuizSetupScreen}
            />
            <RootStack.Screen 
              name="QuizPlay" 
              component={QuizPlayScreen}
              options={{
                gestureEnabled: false,
              }}
            />
            <RootStack.Screen 
              name="QuizResults" 
              component={QuizResultsScreen}
              options={{
                gestureEnabled: false,
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

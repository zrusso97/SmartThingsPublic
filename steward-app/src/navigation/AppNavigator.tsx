import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/theme';

import AuthScreen from '../screens/AuthScreen';
import MapScreen from '../screens/MapScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import ProofOfWorkScreen from '../screens/ProofOfWorkScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Type definitions for navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TaskDetail: { taskId: string };
  ProofOfWork: { taskId: string; taskTitle: string };
  CreateTask: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Create: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'map';
          if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Create') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'Nearby Tasks' }}
      />
      <Tab.Screen
        name="Create"
        component={CreateTaskScreen}
        options={{ title: 'New Task' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{
                headerShown: true,
                title: 'Task Details',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <Stack.Screen
              name="ProofOfWork"
              component={ProofOfWorkScreen}
              options={{
                headerShown: true,
                title: 'Complete Task',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

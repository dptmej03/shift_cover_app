import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { useAuth } from '../context/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Manager screens
import ManagerHomeScreen from '../screens/manager/ManagerHomeScreen';
import CreateShiftScreen from '../screens/manager/CreateShiftScreen';
import ApplicantsScreen from '../screens/manager/ApplicantsScreen';
import CreateStoreScreen from '../screens/manager/CreateStoreScreen';
import ManagerCalendarScreen from '../screens/manager/ManagerCalendarScreen';

// Employee screens
import EmployeeHomeScreen from '../screens/employee/EmployeeHomeScreen';
import ShiftDetailScreen from '../screens/employee/ShiftDetailScreen';
import JoinStoreScreen from '../screens/employee/JoinStoreScreen';
import EmployeeCalendarScreen from '../screens/employee/EmployeeCalendarScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ManagerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FF7043',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#F0F0F0', height: 60, paddingBottom: 8 },
        tabBarIcon: ({ focused, color }) => {
          const icons = { Home: focused ? '🏠' : '🏡', Calendar: focused ? '📅' : '📆' };
          return <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={ManagerStack} options={{ title: '홈' }} />
      <Tab.Screen name="Calendar" component={ManagerCalendarScreen} options={{ title: '캘린더' }} />
    </Tab.Navigator>
  );
}

function ManagerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManagerHome" component={ManagerHomeScreen} />
      <Stack.Screen name="CreateShift" component={CreateShiftScreen} />
      <Stack.Screen name="Applicants" component={ApplicantsScreen} />
      <Stack.Screen name="CreateStore" component={CreateStoreScreen} />
    </Stack.Navigator>
  );
}

function EmployeeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FF7043',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#F0F0F0', height: 60, paddingBottom: 8 },
        tabBarIcon: ({ focused }) => {
          const icons = { Home: focused ? '🏠' : '🏡', Calendar: focused ? '📅' : '📆' };
          return <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={EmployeeStack} options={{ title: '홈' }} />
      <Tab.Screen name="Calendar" component={EmployeeCalendarScreen} options={{ title: '캘린더' }} />
    </Tab.Navigator>
  );
}

function EmployeeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmployeeHome" component={EmployeeHomeScreen} />
      <Stack.Screen name="ShiftDetail" component={ShiftDetailScreen} />
      <Stack.Screen name="JoinStore" component={JoinStoreScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.role === 'manager' ? (
        <ManagerTabs />
      ) : (
        <EmployeeTabs />
      )}
    </NavigationContainer>
  );
}

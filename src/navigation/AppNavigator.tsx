import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import DashboardScreen from '../screens/Dashboard';
import TaskFormScreen from '../screens/TaskForm';
import TaskDetailsScreen from '../screens/TaskDetails';
import VideoListScreen from '../screens/Video';
import { RootStackParamList, RootTabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard', headerTitleAlign: 'center' }} />
    <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Add / Edit Task', headerTitleAlign: 'center' }} />
    <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: 'Task Details', headerTitleAlign: 'center' }} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({

          headerTitleAlign: 'center',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'Tasks') {
              iconName = focused ? 'list-circle' : 'list-circle-outline';
            } else if (route.name === 'Videos') {
              iconName = focused ? 'play-circle' : 'play-circle-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarStyle: {
            justifyContent: 'center',
            paddingBottom: 5,
            height: 60,
          },
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen
          name="Tasks"
          component={DashboardStack}
          options={{
            headerShown: false,
            tabBarLabel: 'Tasks',
          }}
        />
        <Tab.Screen
          name="Videos"
          component={VideoListScreen}
          options={{ title: 'Videos' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

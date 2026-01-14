import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import KitchenScreen from '../screens/KitchenScreen';
import MenuScreen from '../screens/MenuScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AddOnsScreen from '../screens/AddOnsScreen';
import TablesScreen from '../screens/TablesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { TabParamList } from './types';
import { theme } from '../theme';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'chart-line';
              break;
            case 'Orders':
              iconName = 'receipt';
              break;
            case 'Kitchen':
              iconName = 'fire';
              break;
            case 'Menu':
              iconName = 'utensils';
              break;
            case 'Categories':
              iconName = 'list';
              break;
            case 'AddOns':
              iconName = 'pizza-slice';
              break;
            case 'Tables':
              iconName = 'chair';
              break;
            case 'Analytics':
              iconName = 'chart-column';
              break;
            case 'Settings':
              iconName = 'gear';
              break;
            default:
              iconName = 'circle';
          }

          return (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 32,
                borderRadius: 16,
                backgroundColor: focused ? theme.colors.primaryBg : 'transparent',
              }}
            >
              <FontAwesome6
                name={iconName}
                size={focused ? 22 : 20}
                color={color}
                solid={focused}
              />
            </View>
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 88 : 72,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="Kitchen"
        component={KitchenScreen}
        options={{ tabBarLabel: 'Kitchen' }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{ tabBarLabel: 'Menu' }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ tabBarLabel: 'Categories' }}
      />
      <Tab.Screen
        name="AddOns"
        component={AddOnsScreen}
        options={{ tabBarLabel: 'Add-Ons' }}
      />
      <Tab.Screen
        name="Tables"
        component={TablesScreen}
        options={{ tabBarLabel: 'Tables' }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Analytics' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

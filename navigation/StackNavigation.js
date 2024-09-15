import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons'; 

import Login from '../screens/LoginReg/Login';
import Registration from '../screens/LoginReg/Registration';
import Profile from '../screens/Tabs/Profile';
import CheckIn from '../screens/Tabs/CheckIn';
import Tasks from '../screens/Tabs/Tasks';
import Werehouse from '../screens/Tabs/Werehouse';

const StackNavigation = () => {

  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  function BottomTabs() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="CheckIn"
          component={CheckIn}
          options={{
            tabBarLabel: "Explore",
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <MaterialIcons name="explore" size={24} color="grey" />
              ) : (
                <MaterialIcons name="explore" size={24} color="black" />
              ),
          }}
        />
          <Tab.Screen
          name="Tasks"
          component={Tasks}
          options={{
            tabBarLabel: "Explore",
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <MaterialIcons name="explore" size={24} color="grey" />
              ) : (
                <MaterialIcons name="explore" size={24} color="black" />
              ),
          }}
        />
          <Tab.Screen
          name="Werehouse"
          component={Werehouse}
          options={{
            tabBarLabel: "Explore",
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <MaterialIcons name="explore" size={24} color="grey" />
              ) : (
                <MaterialIcons name="explore" size={24} color="black" />
              ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarLabel: "Profile",
            tabBarLabelStyle: { color: "#008E97" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="person" size={24} color="grey" />
              ) : (
                <Ionicons name="person" size={24} color="black" />
              ),
          }}
        />
      </Tab.Navigator>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} options={{headerShown:false}} />
        <Stack.Screen name="Registration" component={Registration} options={{headerShown:false}} />
        <Stack.Screen name="Profile" component={Profile}/>
        <Stack.Screen name="CheckIn" component={CheckIn} options={{headerShown:false}} />
        <Stack.Screen name="Werehouse" component={Werehouse} options={{headerShown:false}} />
        <Stack.Screen name="Tasks" component={Tasks} options={{headerShown:false}} />
        
        <Stack.Screen name="Main" component={BottomTabs} options={{headerShown:false}} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default StackNavigation;

const styles = StyleSheet.create({})
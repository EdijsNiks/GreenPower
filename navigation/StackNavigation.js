import { StyleSheet , Image} from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import Login from "../screens/LoginReg/Login";
import Registration from "../screens/LoginReg/Registration";
import Profile from "../screens/Tabs/Profile";
import CheckIn from "../screens/Tabs/CheckIn";
import Tasks from "../screens/Tabs/Tasks";
import Warehouse from "../screens/Tabs/Warehouse";

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
            tabBarLabel: "CheckIn",
            tabBarLabelStyle: { color: "black", fontWeight: "bold"},
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <MaterialIcons name="home" size={24} color="grey" />
              ) : (
                <MaterialIcons name="home" size={24} color="black" />
              ),
          }}
        />
          <Tab.Screen
          name="Tasks"
          component={Tasks}
          options={{
            tabBarLabel: "Tasks",
            tabBarLabelStyle: { color: "black", fontWeight: "bold"},
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome5 name="tasks" size={24} color="grey" />
              ) : (
                <FontAwesome5 name="tasks" size={24} color="black" />
              ),
          }}
        />
          <Tab.Screen
          name="Warehouse"
          component={Warehouse}
          options={{
            tabBarLabel: "Warehouse",
            tabBarLabelStyle: { color: "black", fontWeight: "bold"},
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome6 name="warehouse" size={24} color="grey" />
              ) : (
                <FontAwesome6 name="warehouse" size={24} color="black" />
              ),
          }}
        />
          <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarLabel: "Profile",
            tabBarLabelStyle: { color: "black", fontWeight: "bold"},
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome name="user" size={24} color="grey" />
              ) : (
                <FontAwesome name="user" size={24} color="black" />
              ),
          }}
        />
      </Tab.Navigator>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Registration"
          component={Registration}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen
          name="CheckIn"
          component={CheckIn}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Warehouse"
          component={Warehouse}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Tasks"
          component={Tasks}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigation;

const styles = StyleSheet.create({});

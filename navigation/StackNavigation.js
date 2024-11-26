import { StyleSheet, View } from "react-native";
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// Import your screens
import Login from "../screens/LoginReg/Login";
import Registration from "../screens/LoginReg/Registration";
import Profile from "../screens/Tabs/Profile";
import CheckIn from "../screens/Tabs/CheckIn";
import Projects from "../screens/Tabs/Projects";
import Warehouse from "../screens/Tabs/Warehouse";
import AdminPage from "../screens/Tabs/AdminPage";
import ProjectsInfo from "../screens/Projects/ProjectInfo";
import ViewAll from "../screens/ViewAll";
import WarehouseItemInfo from "../screens/Warehouse/WarehouseItemInfo";
import AddItemToWarehouse from "../screens/Warehouse/AddItemToWarehouse";
import AddItemToProject from "../screens/Projects/AddItemToProject";
import AddSpotToWarehouse from "../screens/Warehouse/AddSpotToWarehouse";
import WarehouseSpots from "../components/WarehouseSpots";
import { AuthContext } from "../AuthContext";

const StackNavigation = () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  
  const { userToken, loading } = useContext(AuthContext);
  if (loading) {
    return <View />;
  }

  // Bottom tab navigation
  function BottomTabs() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="CheckIn"
          component={CheckIn}
          options={{
            tabBarLabel: "CheckIn",
            tabBarLabelStyle: { color: "black", fontWeight: "bold" },
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
          name="Projects"
          component={Projects}
          options={{
            tabBarLabel: "Projects",
            tabBarLabelStyle: { color: "black", fontWeight: "bold" },
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
            tabBarLabelStyle: { color: "black", fontWeight: "bold" },
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
            tabBarLabelStyle: { color: "black", fontWeight: "bold" },
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

  const linking = {
    prefixes: ["https://myapp.vercel.app", "myapp://"],  // Remove the undefined makeUrl call
    config: {
      screens: {
        Login: "login",
        Registration: "registration",
        Main: {
          path: "main",
          screens: {
            CheckIn: "checkin",
            Projects: {
              path: "projects",
              screens: {
                ProjectsHome: "",
                AddItemToProject: "add-item",
              },
            },
            Warehouse: {
              path: "warehouse",
              screens: {
                WarehouseHome: "",
                AddItemToWarehouse: "add-item",
              },
            },
            Profile: "profile",
          },
        },
        ProjectsInfo: "projects/item-info",
        AdminPage: "admin",
        ViewAll: "view-all",
        WarehouseItemInfo: "warehouse/item-info",
        AddSpotToWarehouse: "warehouse/add-spot",
        WarehouseSpots: "warehouse/spots",
      },
    },
  };
  

  // Stack navigation with linking
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        {!userToken ? (
          // If not logged in, show login and registration
          <>
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
          </>
        ) : (
          // If logged in, show the main app with tabs and other screens
          <>
            <Stack.Screen
              name="Main"
              component={BottomTabs}
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
              name="Projects"
              component={Projects}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProjectsInfo"
              component={ProjectsInfo}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WarehouseItemInfo"
              component={WarehouseItemInfo}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminPage"
              component={AdminPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddItemToProject"
              component={AddItemToProject}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddItemToWarehouse"
              component={AddItemToWarehouse}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ViewAll"
              component={ViewAll}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddSpotToWarehouse"
              component={AddSpotToWarehouse}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WarehouseSpots"
              component={WarehouseSpots}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigation;

const styles = StyleSheet.create({});

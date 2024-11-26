import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Check if a user is logged in when the app loads
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        let token;

        if (Platform.OS === "web") {
          token = await AsyncStorage.getItem("userToken");
        } else {
          token = await SecureStore.getItemAsync("userToken");
        }

        if (token) {
          setUserToken(token);

          // Optionally load user data if available
          let userDataString;
          if (Platform.OS === "web") {
            userDataString = await AsyncStorage.getItem("userData");
          } else {
            userDataString = await SecureStore.getItemAsync("userData");
          }

          if (userDataString) {
            setUserData(JSON.parse(userDataString));
          }
        }
      } catch (error) {
        console.error("Failed to load token or user data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (token, userData) => {
    try {
      if (Platform.OS === "web") {
        // Save to AsyncStorage for web
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
      } else {
        // Save securely for mobile
        await SecureStore.setItemAsync("userToken", token);
        await SecureStore.setItemAsync("userData", JSON.stringify(userData));
      }

      // Update state
      setUserToken(token);
      setUserData(userData);
    } catch (error) {
      console.error("Failed to save token or user data:", error);
    }
  };

  const logout = async () => {
    try {
      if (Platform.OS === "web") {
        // Remove from AsyncStorage for web
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("userData");
      } else {
        // Remove securely for mobile
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userData");
      }

      // Clear state
      setUserToken(null);
      setUserData(null);
    } catch (error) {
      console.error("Failed to remove token or user data:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, userData, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


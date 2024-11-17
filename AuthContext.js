import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a user is logged in when the app loads
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        if (storedToken) {
          setUserToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to load token:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (token) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      setUserToken(token);
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      setUserToken(null);
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

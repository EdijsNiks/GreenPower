import { AuthProvider } from './AuthContext';
import StackNavigation from './navigation/StackNavigation';

import React, { useEffect } from "react";
import i18next from "./services/i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        i18next.changeLanguage(savedLanguage);
      } else {
        const defaultLanguage = "lv"; // Default language
        i18next.changeLanguage(defaultLanguage);
        await AsyncStorage.setItem("language", defaultLanguage);
      }
    } catch (error) {
      console.error("Error initializing language:", error);
    }
  };
  return (
    <AuthProvider>
    <StackNavigation/>
    </AuthProvider>
  );
}

export default App;

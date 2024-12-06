import React, { useEffect } from "react";
import { AuthProvider } from "./AuthContext";
import StackNavigation from "./navigation/StackNavigation";
import syncData from "./syncData"; 

import i18next from "./services/i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  useEffect(() => {
    initializeLanguage();
    performSync();

    // Start periodic sync
    const syncInterval = setInterval(() => {
      performSync();
    }, 300000); // 300,000ms = 5 minutes
  
    // Cleanup on unmount
    return () => clearInterval(syncInterval);
 
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

  const performSync = async () => {
    console.log("Sync started at:", new Date().toISOString());

    const lastSync = JSON.parse(await AsyncStorage.getItem("lastSync"));
    if (lastSync && new Date() - new Date(lastSync.timestamp) < 300000) { // 5 minutes
      console.log("Skipping sync; already synced recently.");
      return;
    }
  
    try {
      await syncData(); // Call the sync function
      console.log("Sync completed successfully at:", new Date().toISOString());
    } catch (error) {
      console.error("Error during sync:", error);
    }
  };

  return (
    <AuthProvider>
      <StackNavigation />
    </AuthProvider>
  );
};

export default App;


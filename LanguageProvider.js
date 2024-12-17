import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translate from 'google-translate-api-x';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isOffline, setIsOffline] = useState(false);

  // Load the saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('appLanguage');
        setLanguage(storedLanguage || 'en');
      } catch (error) {
        console.error('Failed to load language:', error);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguageDynamic = async (lang) => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem('appLanguage', lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const translateText = async (text) => {
    try {
      setIsOffline(false); // Assume online first
      const result = await translate(text, { to: language });
      return result.text;
    } catch (error) {
      console.error('Translation Error:', error);
      setIsOffline(true); // Mark as offline
      return text; // Fallback to the original text
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguageDynamic, translateText, isOffline }}>
      {children}
    </LanguageContext.Provider>
  );
};


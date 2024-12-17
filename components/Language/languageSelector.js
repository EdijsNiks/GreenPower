import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "../../services/i18next";
import { useTranslation } from "react-i18next";

// Define language options
const LANGUAGE_OPTIONS = [
  { code: "lv", name: "Latviešu" },
  { code: "en", name: "English" },
  { code: "rus", name: "Россия" }
];

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState('');
  const { t } = useTranslation();

  // Initialize language on component mount
  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
        i18next.changeLanguage(savedLanguage);
      } else {
        const defaultLanguage = "lv";
        setCurrentLanguage(defaultLanguage);
        i18next.changeLanguage(defaultLanguage);
        await AsyncStorage.setItem("language", defaultLanguage);
      }
    } catch (error) {
      console.error("Error initializing language preference:", error);
    }
  };

  // Function to change and persist language
  const changeLanguage = async (lng) => {
    try {
      await AsyncStorage.setItem("language", lng);
      i18next.changeLanguage(lng);
      setCurrentLanguage(lng);
      Alert.alert(t("language"), t("languageChangedMessage"));
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  return (
    <View style={styles.languageContainer}>
      <View style={styles.languageButtons}>
        {LANGUAGE_OPTIONS.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton, 
              currentLanguage === language.code && styles.selectedLanguageButton
            ]}
            onPress={() => changeLanguage(language.code)}
          >
            <Text 
              style={[
                styles.languageButtonText,
                currentLanguage === language.code && styles.selectedLanguageText
              ]}
            >
              {language.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  languageContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 40,
  },
  languageButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  languageButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  selectedLanguageButton: {
    backgroundColor: "#A4D337", // Light green background when selected
    borderWidth: 2,
    borderColor: "#7CB518", // Darker green border
  },
  languageButtonText: {
    fontSize: 14,
    color: "#000",
  },
  selectedLanguageText: {
    color: "white", // White text when selected
    fontWeight: "bold",
  },
});

export default LanguageSelector;
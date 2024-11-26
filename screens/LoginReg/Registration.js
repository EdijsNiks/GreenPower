import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import i18next, { languageResources } from "../../services/i18next";
import "react-native-get-random-values"; // Polyfill for random values
import { v4 as uuidv4 } from "uuid";

const Registration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [admin, setAdmin] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedInTime, setCheckedInTime] = useState(null);
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("window");
  const { t } = useTranslation();

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const changeLng = (lng) => {
    i18next.changeLanguage(lng);
  };
  useEffect(() => {
    initializeLanguage();
  }, []);
  // Function to change and persist language

  const initializeLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        changeLng(savedLanguage); // Apply saved language
      } else {
        const defaultLanguage = "lv"; // Default to Latvian
        changeLng(defaultLanguage);
        await AsyncStorage.setItem("language", defaultLanguage); // Save default
      }
    } catch (error) {
      console.error("Error initializing language preference:", error);
    }
  };

  // Function to change and persist language
  const changeLanguage = async (lng) => {
    try {
      await AsyncStorage.setItem("language", lng); // Save the selected language
      changeLng(lng); // Apply the language
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  const validateEmail = (email) => {
    // Ensure email has an "@" symbol and is at least 5 characters long
    const emailPattern = /.+@.+\..+/;
    return email.length >= 5 && emailPattern.test(email);
  };

  const validatePassword = (password) => {
    // Ensure password is at least 5 characters long and contains at least one digit
    const passwordPattern = /^(?=.*\d).{5,}$/;
    return passwordPattern.test(password);
  };

  const validateFields = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", t("allFields"));
      return false;
    }
    if (!validateEmail(email)) {
      Alert.alert("Error", t("invalidEmail"));
      return false;
    }
    if (!validatePassword(password)) {
      Alert.alert("Error", t("passwordMatch"));
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", t("passwordNotMatch"));
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (validateFields()) {
      const userProfile = {
        id: uuidv4(),
        name,
        email,
        password,
        admin,
        checkedIn: false,
        checkedInTime: null,
        firstCheckInTime: null,
        lastCheckInTime: null,
        totalTimeCheckedIn: 0,
        monthlyCheckIns: {}, // Object to track check-ins by month
        currentMonthCheckIns: 0,
      };

      try {
        // Retrieve existing user profiles
        const existingUserProfiles = await AsyncStorage.getItem("profile");

        // Initialize profiles as an empty array if not exists or not parseable
        let profiles = [];
        try {
          if (existingUserProfiles) {
            const parsedProfiles = JSON.parse(existingUserProfiles);
            profiles = Array.isArray(parsedProfiles)
              ? parsedProfiles
              : [parsedProfiles];
          }
        } catch (parseError) {
          console.error("Error parsing existing profiles:", parseError);
        }

        // Check for existing email to prevent duplicate registrations
        const emailExists = profiles.some(
          (profile) =>
            profile.email && profile.email.toLowerCase() === email.toLowerCase()
        );

        if (emailExists) {
          Alert.alert("Error", t("emailAlreadyRegistered"));
          return;
        }

        // Add new user profile
        profiles.push(userProfile);

        // Save the updated profiles
        await AsyncStorage.setItem("profile", JSON.stringify(profiles));

        // Prepare history entry
        const historyEntry = {
          id: Date.now().toString(),
          user: userProfile.name,
          action: "Profile Created",
          description: "New user registered",
          date: Date.now().toString(),
        };

        // Handle user history
        const existingHistory = await AsyncStorage.getItem("userHistory");
        let history = [];
        try {
          if (existingHistory) {
            const parsedHistory = JSON.parse(existingHistory);
            history = Array.isArray(parsedHistory)
              ? parsedHistory
              : [parsedHistory];
          }
        } catch (parseError) {
          console.error("Error parsing existing history:", parseError);
        }

        history.push(historyEntry);

        await AsyncStorage.setItem("userHistory", JSON.stringify(history));
        // Success alert and navigation
        if (Platform.OS === "web") {
          window.alert(t("registerSuccess"));
          navigation.replace("Login");
        } else {
          Alert.alert(
            "Success",
            t("registerSuccess"),
            [
              {
                text: "OK",
                onPress: () => navigation.replace("Login"),
              },
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        if (Platform.OS === "web") {
          window.alert(t("failedSave"));
        } else {
          Alert.alert(
            "Error",
            t("failedSave"),
            [{ text: "OK" }],
            { cancelable: true }
          );
        }
      }  
    }
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
    >
      <KeyboardAvoidingView style={styles.container}>
        {/* Image */}
        <Image
          source={require("../../assets/logo1.png")}
          style={[styles.image, { width: width - 20, height: height * 0.2 }]}
          resizeMode="contain"
        />

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={name}
            onChangeText={(text) => setName(text)}
            style={styles.input}
            placeholder={t("name-placeholder")}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
            placeholder={t("place-holder-email")}
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={!passwordVisible}
            style={styles.input}
            placeholder={t("password")}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={styles.toggleText}>
              {passwordVisible ? t("Hide") : t("Show")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            secureTextEntry={!passwordVisible}
            style={styles.input}
            placeholder={t("confirmPass")}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={styles.toggleText}>
              {passwordVisible ? t("Hide") : t("Show")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Button */}
        <Pressable
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={handleRegister}
        >
          <LinearGradient
            colors={isPressed ? ["#A4D337", "#A4D337"] : ["#A4D337", "#7CB518"]}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>{t("register")}</Text>
          </LinearGradient>
        </Pressable>

        {/* Registration Prompt */}
        <View style={styles.registrationContainer}>
          <Text style={styles.registrationText}>
            {t("haveAccount")}{" "}
            <Text
              style={styles.registrationLink}
              onPress={() => (
                navigation.navigate("Login"), console.log("Login")
              )}
            >
              {t("pressHere")}
            </Text>
          </Text>
        </View>

        {/* Choosing Language */}
        <View style={styles.languageContainer}>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => {
                changeLanguage("lv");
                Alert.alert(t("language"), t("languageChangedMessage"));
              }}
            >
              <Text style={styles.languageButtonText}>Latviešu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => {
                changeLanguage("en");
                Alert.alert(t("language"), t("languageChangedMessage"));
              }}
            >
              <Text style={styles.languageButtonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => {
                changeLanguage("rus");
                Alert.alert(t("language"), t("languageChangedMessage"));
              }}
            >
              <Text style={styles.languageButtonText}>Россия</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  languageContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 20,
  },
  languageText: {
    fontSize: 16,
    marginBottom: 10,
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
  languageButtonText: {
    fontSize: 14,
    color: "#000",
  },
  image: {
    marginBottom: 20,
  },
  inputContainer: {
    marginTop: 10,
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 5,
    borderRadius: 8,
    borderColor: "black",
    borderWidth: 2,
    width: 350,
  },
  input: {
    fontSize: 20,
    width: 300,
    paddingHorizontal: 10,
  },
  toggleText: {
    fontSize: 18,
    color: "#A4D337",
    marginRight: 20,
  },
  loginButton: {
    marginTop: 20,
    width: 350,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
  },
  registrationContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  registrationText: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
  registrationLink: {
    color: "#A4D337",
    fontWeight: "bold",
  },
});

export default Registration;

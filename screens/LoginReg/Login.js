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
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../AuthContext";
import { useTranslation } from "react-i18next";
import i18next, { languageResources } from "../../services/i18next";

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const { login } = useContext(AuthContext);

  const changeLng = (lng) => {
    i18next.changeLanguage(lng);
  };
  useEffect(() => {
    initializeLanguage();
  }, []);
  // Function to change and persist language
  const changeLanguage = async (lng) => {
    try {
      await AsyncStorage.setItem("language", lng); // Save the selected language
      changeLng(lng); // Apply the language
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  // Initialize language from AsyncStorage
  const initializeLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        changeLng(savedLanguage); // Apply saved language
      } else {
        const defaultLanguage = "en"; // Set a default language
        changeLng(defaultLanguage);
      }
    } catch (error) {
      console.error("Error initializing language preference:", error);
    }
  };

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handleLogin = async () => {
    try {
      // Retrieve the user profile from AsyncStorage
      const userProfileString = await AsyncStorage.getItem("profile");
      if (userProfileString) {
        const userProfile = JSON.parse(userProfileString);

        // Verify the email and password
        if (userProfile.email === email && userProfile.password === password) {
          login("mockToken");
          Alert.alert("Welcome!", t("loginSuccess"));
        } else {
          Alert.alert("Error", t("invalidEmailorPass"));
        }
      } else {
        Alert.alert("Error", t("noUserProfile"));
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      Alert.alert("Error", t("failedToCheck"));
    }
  };

  const { width, height } = Dimensions.get("window");

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

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
            placeholder={t("place-holder-email")}
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

        {/* Forgot Password */}
        <View style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>{t("forgotPassword")}</Text>
        </View>

        {/* Login Button */}
        <Pressable
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={handleLogin}
        >
          <LinearGradient
            colors={isPressed ? ["#A4D337", "#A4D337"] : ["#A4D337", "#7CB518"]}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>{t("login")}</Text>
          </LinearGradient>
        </Pressable>

        {/* Registration Prompt */}
        <View style={styles.registrationContainer}>
          <Text style={styles.registrationText}>
            {t("notAccount")}{" "}
            <Text
              style={styles.registrationLink}
              onPress={() => navigation.navigate("Registration")}
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
              onPress={() => changeLanguage("lv")}
            >
              <Text style={styles.languageButtonText}>Latviešu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => changeLanguage("en")}
            >
              <Text style={styles.languageButtonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => changeLanguage("rus")}
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
    marginVertical: 40,
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
  forgotPasswordContainer: {
    marginTop: 10,
    alignItems: "flex-start",
    width: 350,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
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

export default Login;

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
  Platform
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../AuthContext";
import { useTranslation } from "react-i18next";
import i18next from "../../services/i18next";


const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const { login } = useContext(AuthContext);
    const [currentLanguage, setCurrentLanguage] = useState('');
  

  const changeLng = (lng) => {
    i18next.changeLanguage(lng);
  };
  useEffect(() => {
    initializeLanguage();
  }, []);

  // Initialize language from AsyncStorage
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

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.8.101:8080/api/profile/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        login(data.token, data.profile);
        Alert.alert("Welcome!", t("loginSuccess"));
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || t("invalidEmailorPass"));
      }
    } catch (error) {
      console.error("Error during login:", error);
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
        <LanguageSelector/>
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

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
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handleLogin = async () => {
    try {
      // Retrieve the user profile from AsyncStorage
      const userProfileString = await AsyncStorage.getItem("profile");
      if (userProfileString) {
        const userProfile = JSON.parse(userProfileString);

        // Verify the email and password
        if (userProfile.email === email && userProfile.password === password) {
          Alert.alert("Welcome!", "Login successful!");
          navigation.replace("Main");
        } else {
          Alert.alert("Error", "Invalid email or password.");
        }
      } else {
        Alert.alert("Error", "No user profile found.");
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      Alert.alert("Error", "Failed to check user profile. Please try again.");
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
            placeholder="Email Address"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={!passwordVisible}
            style={styles.input}
            placeholder="Password"
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={styles.toggleText}>
              {passwordVisible ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <View style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </View>

        {/* Login Button */}
        <Pressable
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={()=> navigation.replace("Main")}
          //onPress={handleLogin}
        >
          <LinearGradient
            colors={isPressed ? ["#A4D337", "#A4D337"] : ["#A4D337", "#7CB518"]}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </LinearGradient>
        </Pressable>

        {/* Registration Prompt */}
        <View style={styles.registrationContainer}>
          <Text style={styles.registrationText}>
            Not have an account?{" "}
            <Text
              style={styles.registrationLink}
              onPress={() => navigation.navigate("Registration")}
            >
              Press Here
            </Text>
          </Text>
        </View>

        {/* Choosing Language */}
        <View style={styles.languageContainer}>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => console.log("Latvian selected")}
            >
              <Text style={styles.languageButtonText}>Latvian</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => console.log("English selected")}
            >
              <Text style={styles.languageButtonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => console.log("Russian selected")}
            >
              <Text style={styles.languageButtonText}>Russian</Text>
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

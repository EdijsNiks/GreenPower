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

const Registration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("window");

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const userData = {
    email: email,
    password: password,
  };

  /*
    const handleLogin = (email, password) => {
      axios
        .post(
          `http://rhomeserver.ddns.net:8086/api/client/login?Email=${email}&password=${password}`
        )
        .then((response) => {
          console.log(response.data);
          navigation.replace("Main");
          const stringifiedData = JSON.stringify(email);
          AsyncStorage.setItem("myKey", stringifiedData)
            .then(() => {
              console.log("Data saved successfully");
              console.log(stringifiedData);
            })
            .catch((error) => {
              console.error("Error saving data:", error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    };
*/
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
      Alert.alert("Error", "All fields are required.");
      return false;
    }
    if (!validateEmail(email)) {
      Alert.alert("Error", "Invalid email format. Please enter a valid email.");
      return false;
    }
    if (!validatePassword(password)) {
      Alert.alert(
        "Error",
        "Password must be at least 5 characters long and contain at least one number."
      );
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleRegister = () => {
    if (validateFields()) {
      Alert.alert("Success", "Registration completed!", [], {
        cancelable: true,
      });

      // Show success popup for 2 seconds, then navigate to Login
      setTimeout(() => {
        navigation.replace("Login");
      }, 2000);
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
            placeholder="Name"
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
            placeholder="Email Address"
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
            placeholder="Password"
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={styles.toggleText}>
              {passwordVisible ? "Hide" : "Show"}
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
            placeholder="Confirm Password"
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={styles.toggleText}>
              {passwordVisible ? "Hide" : "Show"}
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
            <Text style={styles.loginButtonText}>Register</Text>
          </LinearGradient>
        </Pressable>

        {/* Registration Prompt */}
        <View style={styles.registrationContainer}>
          <Text style={styles.registrationText}>
            Have an account?{" "}
            <Text
              style={styles.registrationLink}
              onPress={() => navigation.navigate("Login")}
            >
              Press Here
            </Text>
          </Text>
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

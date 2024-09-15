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
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import { useNavigation } from "@react-navigation/native";
  
  //import axios from "axios";
  const Registration = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigation = useNavigation();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [user, setUser] = useState([]);
  
    const togglePasswordVisibility = () => {
      setPasswordVisible(!passwordVisible);
    };
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
  
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
      >
        <View>
          <Image
            style={{ top: 100 }}
            source={require("../../assets/favicon.png")}
          />
        </View>
        <KeyboardAvoidingView>
          <View>
            <Text
              style={{
                fontSize: 30,
                marginTop: 200,
                width: 350,
                fontWeight: "bold",
              }}
            >
              Welcome!
            </Text>
          </View>
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              backgroundColor: "white",
              paddingVertical: 5,
              borderRadius: 8,
              border: "solid black",
              borderWidth: 2,
              gap: 5,
            }}
          >
            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={{ fontSize: 20, width: 350 }}
              placeholder="Email Address"
            />
          </View>
          <View
            style={{
              marginTop: 30,
              flexDirection: "row",
              backgroundColor: "white",
              paddingVertical: 5,
              borderRadius: 8,
              gap: 5,
              border: "solid black",
              borderWidth: 2,
            }}
          >
            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={!passwordVisible}
              style={{ fontSize: 20, width: 350 }}
              placeholder="Password"
            />
            <TouchableOpacity>
              <Image
                style={{ position: "absolute", right: 5, height: 32 }}
                source={require("../../assets/favicon.png")}
                onPress={togglePasswordVisibility}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              paddingVertical: 5,
            }}
          >
            <Text style={{ fontSize: 20, width: 350, color: "#FE8F4E" }}>
              {" "}
              Forgot password?
            </Text>
          </View>
        </KeyboardAvoidingView>
        <View>
          <Pressable onPress={() => handleLogin(email, password)}>
            <Image
              style={{
                top: 30,
                width: 300,
                borderRadius: 20,
                shadowColor: "black",
              }}
              source={require("../../assets/favicon.png")}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  };
  
  export default Registration;
  
  const styles = StyleSheet.create({});
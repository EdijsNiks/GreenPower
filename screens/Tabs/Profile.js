import { StyleSheet, Text, View, Image, Pressable, Button } from "react-native";
import { React, useLayoutEffect, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';



const Profile = () => {
  const navigation = useNavigation();
  const [user, setUserData] = useState([]);
  const [currentUser, setCurrentUser] = useState("");

/*
  useEffect(() => {
    fetch('http://rhomeserver.ddns.net:8086/api/client/get/all')
    .then(res => res.json())
    .then(data => setUserData(data))
    .catch(err => console.log(err));
    console.log(user);
  }, []);

*/

  useEffect(() => {
    AsyncStorage.getItem('myKey')
    .then((stringifiedData) => {
      if (stringifiedData !== null) {
        const data = JSON.parse(stringifiedData);
        console.log('User data retrieved from AsyncStorage:', data);
        setCurrentUser(data); 
        console.log(currentUser)// Update the state with the data
      }
    })
    .catch((error) => {
      console.error('Error retrieving data:', error);
    });
  }, []);
   




  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "20%",
          backgroundColor: "orange",
        }}
      >
        <Image source={require("../../assets/favicon.png")} />
      </View>
      <View style={{ top: 130 }}>
        <Text style={{ color: "white", fontSize: 50 }}>Profile</Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontSize: 30,
            marginTop: 300,
            width: 350,
            fontWeight: "bold",
            alignItems: "center",
            left: 84,
          }}
        >
        {currentUser}
        </Text>

      </View>

      <View style={{paddingVertical: 40 }}>
        <Pressable
          onPress={() => navigation.replace("Login")}
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 11,
            paddingHorizontal: 54,
            borderRadius: 12,
            elevation: 2,
            backgroundColor: "#E7DFDA",
           
            shadowColor: "#0F0C0A",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              lineHeight: 16,
              fontWeight: "bold",
              letterSpacing: 0.25,
              color: "#0F0C0A",
            }}
          >
            LOGOUT
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({});

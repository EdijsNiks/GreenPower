import { SafeAreaView, View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Alert  } from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");


const CheckIn = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState("Jeff");
  const [checkedIn, setCheckedIn] = useState(false);


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
    AsyncStorage.getItem("myKey")
      .then((stringifiedData) => {
        if (stringifiedData !== null) {
          const data = JSON.parse(stringifiedData);
          console.log("User data retrieved from AsyncStorage:", data);
          setCurrentUser(data);
        }
      })
      .catch((error) => {
        console.error("Error retrieving data:", error);
      });
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleCheckIn = () => {
    Alert.alert("Check-In Successful");
    setTimeout(() => {
      setCheckedIn(true);
    }, 2000); 
  };

  return (
    
    <SafeAreaView style={styles.safeArea}>
        {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>CHECKIN</Text>
      </View>
      {/* Profile Container */}
      <View style={styles.profileContainer}>
        <Text style={styles.profileText}>{currentUser}</Text>
        <Text style={styles.checkInText}>Check in to work</Text>
      

      {/* Check-In Button */}
      <TouchableOpacity
        style={checkedIn ? styles.checkedInButton : styles.checkInButton}
        onPress={handleCheckIn}
        disabled={checkedIn}
      >
        <Text style={styles.buttonText}>
          {checkedIn ? "You have checked in" : "Press to check in"}
        </Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 110,
    backgroundColor: "black",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingTop: 10,
    zIndex: 1,
  },
  logo: {
    width: 90,
    height: 60,
  },
  screenName: {
    color: "#A4D337",
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: width * 0.15,
    },
  profileContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "black",
  },
  checkInText: {
    marginTop: 10,
    fontSize: 40,
    color: '#555',
  },
  checkInButton: {
    marginTop: 40,
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkedInButton: {
    marginTop: 40,
    backgroundColor: 'green',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckIn;

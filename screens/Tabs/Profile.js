import { StyleSheet, Text, View, Image, SafeAreaView, Dimensions, Pressable } from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const Profile = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // New state for admin check

  useEffect(() => {
    /////////// Fetch User Data ///////////
    AsyncStorage.getItem("myKey")
      .then((stringifiedData) => {
        if (stringifiedData !== null) {
          const data = JSON.parse(stringifiedData);
          console.log("User data retrieved from AsyncStorage:", data);
          setCurrentUser(data);
          
          // Example admin check, you can replace with your own logic
          setIsAdmin(data === "admin@example.com"); // Modify this according to your admin check logic
        }
      })
      .catch((error) => {
        console.error("Error retrieving data:", error);
      });
  }, []);

  useLayoutEffect(() => {
    /////////// Hide Header ///////////
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogout = () => {
    /////////// Logout Functionality ///////////
    AsyncStorage.removeItem("myKey")
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => {
        console.error("Error clearing AsyncStorage:", error);
      });
  };

  const handleAdminPage = () => {
    /////////// Navigate to Admin Page ///////////
    navigation.navigate("AdminPage"); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/*///////// Navbar //////////*/}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>PROFILE</Text>
      </View>

      {/*///////// Profile Container //////////*/}
      <View style={styles.profileContainer}>
        <Text style={styles.profileText}>Jeff Gusta</Text>

        {/* Check-in Status */}
        <View style={styles.checkInContainer}>
          <Text style={styles.checkInLabel}>Checked In:</Text>
          <Text style={[styles.checkInStatus, { color: isCheckedIn ? 'green' : 'red' }]}>
            {isCheckedIn ? 'Yes' : 'No'}
          </Text>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksContainer}>
          <Text style={styles.tasksTitle}>Tasks</Text>
        </View>

        {/* Logout Button */}
        <Pressable
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={handleLogout}
        >
          <View style={[styles.logoutButton, { backgroundColor: isPressed ? '#A4D337' : '#7CB518' }]}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </View>
        </Pressable>

        {/* Admin Button */}
        {isAdmin && (
          <Pressable
            onPress={handleAdminPage}
            style={styles.adminButton}
          >
            <Text style={styles.adminButtonText}>Admin Page</Text>
          </Pressable>
        )}
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
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
  },
  checkInContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  checkInLabel: {
    fontSize: 20,
    color: "black",
  },
  checkInStatus: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tasksContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  tasksTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "black",
  },
  logoutButton: {
    marginTop: 40,
    width: 300,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
  },
  adminButton: {
    marginTop: 20,
    width: 300,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#A4D337", // Change color as needed
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  adminButtonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
});

export default Profile;



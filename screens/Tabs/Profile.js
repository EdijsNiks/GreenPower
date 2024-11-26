import React, { useState, useEffect, useLayoutEffect, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../AuthContext"; // Adjust the import path as needed
const { width } = Dimensions.get("window");
const Profile = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const [currentUser, setCurrentUser] = useState(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    /////////// Fetch User Data ///////////
    const fetchUserData = async () => {
      try {
        // Retrieve user data from SecureStore
        const userData = Platform.OS === "web"
        ? await AsyncStorage.getItem("userData")
        : await SecureStore.getItemAsync("userData");

        if (userData) {
          const parsedUserData = JSON.parse(userData);
          const userId = parsedUserData?.id;

          // Retrieve profiles from AsyncStorage
          const profilesString = await AsyncStorage.getItem("profile");

          if (profilesString) {
            const profiles = JSON.parse(profilesString);

            // Find the current user's profile
            const userProfile = profiles.find(
              (profile) => profile.id === userId
            );

            if (userProfile) {
              console.log("User data retrieved:", userProfile);
              setCurrentUser(userProfile);

              // Set admin status (adjust this logic based on how you determine admin)
              setIsAdmin(
                parsedUserData?.admin === true || userProfile.admin === true
              );
            }
          }
        }
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };

    // Fetch user data whenever the screen is focused
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  useLayoutEffect(() => {
    /////////// Hide Header ///////////
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogout = () => {
    /////////// Logout Functionality ///////////
    logout();
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
        <Text style={styles.screenName}>{t("profile")}</Text>
      </View>

      {/*///////// Profile Container //////////*/}
      <View style={styles.profileContainer}>
        {currentUser ? (
          <>
            <Text style={styles.profileText}>{currentUser.name}</Text>

            {/* Check-in Status */}
            <View style={styles.checkInContainer}>
              <Text style={styles.checkInLabel}>{t("checkin")}</Text>
              <Text
                style={[
                  styles.checkInStatus,
                  { color: currentUser.checkedIn ? "green" : "red" },
                ]}
              >
                {currentUser.checkedIn ? t("yes") : t("no")}
              </Text>
            </View>

            {/* Logout Button */}
            <Pressable
              onPressIn={() => setIsPressed(true)}
              onPressOut={() => setIsPressed(false)}
              onPress={handleLogout}
            >
              <View
                style={[
                  styles.logoutButton,
                  { backgroundColor: isPressed ? "#A4D337" : "#7CB518" },
                ]}
              >
                <Text style={styles.logoutButtonText}>{t("logout")}</Text>
              </View>
            </Pressable>

            {/* Admin Button */}
            {isAdmin && (
              <Pressable onPress={handleAdminPage} style={styles.adminButton}>
                <Text style={styles.adminButtonText}>{t("admin")}</Text>
              </Pressable>
            )}
          </>
        ) : (
          <Text style={styles.profileText}>{t("loading")}</Text>
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

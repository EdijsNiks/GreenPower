import React, { useState, useEffect, useLayoutEffect, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../AuthContext";

const { width } = Dimensions.get("window");

const Profile = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [userData, setUserData] = useState(null);
  const [isPressed, setIsPressed] = useState(false);

  const { logout } = useContext(AuthContext);

  const fetchUserData = async () => {
    try {
      // Retrieve user data from SecureStore
      const storedUserData = Platform.OS === "web"
        ? await AsyncStorage.getItem("userData")
        : await SecureStore.getItemAsync("userData");

      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        console.log("Parsed User Data:", parsedUserData);
        setUserData(parsedUserData);
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Add this to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  useLayoutEffect(() => {
    // Hide Header
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogout = () => {
    logout();
  };

  const handleAdminPage = () => {
    navigation.navigate("AdminPage");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>{t("profile")}</Text>
      </View>

      {/* Profile Container */}
      <View style={styles.profileContainer}>
        {userData ? (
          <>
            <Text style={styles.profileText}>{userData.name}</Text>

            {/* Check-in Status */}
            <View style={styles.checkInContainer}>
              <Text style={styles.checkInLabel}>{t("checkin")}</Text>
              <Text
                style={[
                  styles.checkInStatus,
                  { color: userData.checkedIn ? "green" : "red" },
                ]}
              >
                {userData.checkedIn ? t("yes") : t("no")}
              </Text>
            </View>

            {/* Additional Check-in Details */}
            {userData.checkedInTime && (
              <View style={styles.checkInDetailsContainer}>
                <Text style={styles.checkInDetailsText}>
                  {t("checkInTime")}: {new Date(userData.checkedInTime).toLocaleString()}
                </Text>
              </View>
            )}

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
            {userData.admin === true && (
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
  checkInDetailsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  checkInDetailsText: {
    fontSize: 14,
    marginBottom: 5,
  },
  
});

export default Profile;

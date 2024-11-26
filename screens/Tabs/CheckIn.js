import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "../../components/CheckInComp/CustomAlert";
import { useTranslation } from "react-i18next";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

const CheckIn = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // State to store profiles and current user profile
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadUserProfiles = async () => {
      try {
        // Retrieve user data (platform-specific logic)
        const userData = Platform.OS === "web"
          ? await AsyncStorage.getItem("userData")
          : await SecureStore.getItemAsync("userData");

        if (userData) {
          const parsedUserData = JSON.parse(userData);
          const userId = parsedUserData?.id;

          if (userId) {
            // Retrieve profiles
            const storedProfilesString = await AsyncStorage.getItem("profile");
            let existingProfiles = [];

            if (storedProfilesString) {
              try {
                existingProfiles = JSON.parse(storedProfilesString);
              } catch (jsonError) {
                console.error("Error parsing profiles data:", jsonError);
              }
            }

            // Find or create the current user's profile
            let currentUserProfile = existingProfiles.find(
              (profile) => profile.id === userId
            );

            if (!currentUserProfile) {
              currentUserProfile = {
                id: userId,
                name: parsedUserData?.name || "User",
                checkedIn: false,
                checkedInTime: null,
                totalTimeCheckedIn: 0,
                currentMonthCheckIns: 0,
                firstCheckInTime: null,
                lastCheckInTime: null,
                lastCheckOutTime: null,
              };

              existingProfiles.push(currentUserProfile);
            }

            setProfiles(existingProfiles);
            setCurrentProfile(currentUserProfile);
          } else {
            console.log("User ID not found in userData.");
          }
        } else {
          console.log("No user data found.");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserProfiles();
  }, []);

  const saveProfilesData = async (updatedProfiles) => {
    try {
      // Update profiles in AsyncStorage
      await AsyncStorage.setItem("profile", JSON.stringify(updatedProfiles));

      // Update local state
      setProfiles(updatedProfiles);

      // Find and update the current profile
      const updatedCurrentProfile = updatedProfiles.find(
        (profile) => profile.id === currentProfile.id
      );
      setCurrentProfile(updatedCurrentProfile);
    } catch (error) {
      console.error("Error saving profiles data:", error);
    }
  };

  const handleCheckIn = async () => {
    if (!currentProfile) return;

    if (currentProfile.checkedIn) {
      setAlertMessage(t("reallyWantToCheckOut"));
      setShowConfirm(true);
      setAlertVisible(true);
    } else {
      const now = new Date();

      // Create updated profile
      const updatedProfile = {
        ...currentProfile,
        checkedIn: true,
        checkedInTime: now.toISOString(),
        firstCheckInTime: currentProfile.firstCheckInTime || now.toISOString(),
        lastCheckInTime: now.toISOString(),
        currentMonthCheckIns: (currentProfile.currentMonthCheckIns || 0) + 1,
      };

      // Create updated profiles array
      const updatedProfiles = profiles.map((profile) =>
        profile.id === currentProfile.id ? updatedProfile : profile
      );

      await saveProfilesData(updatedProfiles);

      setAlertMessage(t("checkIn"));
      setShowConfirm(false);
      setAlertVisible(true);
    }
  };

  const handleCheckOut = async () => {
    if (!currentProfile) return;

    const now = new Date();
    const checkInTime = new Date(currentProfile.checkedInTime);
    const timeSpent = calculateTotalTime(checkInTime, now);

    // Create updated profile
    const updatedProfile = {
      ...currentProfile,
      checkedIn: false,
      checkedInTime: null,
      totalTimeCheckedIn: (currentProfile.totalTimeCheckedIn || 0) + timeSpent,
      lastCheckOutTime: now.toISOString(),
    };

    // Create updated profiles array
    const updatedProfiles = profiles.map((profile) =>
      profile.id === currentProfile.id ? updatedProfile : profile
    );

    await saveProfilesData(updatedProfiles);

    const checkInFormatted = formatDateTime(checkInTime);
    const checkOutFormatted = formatDateTime(now);

    setAlertMessage(
      t("checkoutMessage", {
        startTime: checkInFormatted,
        endTime: checkOutFormatted,
        timeSpent: timeSpent.toFixed(2),
      })
    );
    setShowConfirm(false);
    setAlertVisible(true);
  };

  const handleMidnightCheckOut = async () => {
    if (!currentProfile || !currentProfile.checkedIn) return;

    const now = new Date();
    const checkInTime = new Date(currentProfile.checkedInTime);
    const timeSpent = calculateTotalTime(checkInTime, now);

    // Create updated profile
    const updatedProfile = {
      ...currentProfile,
      checkedIn: false,
      checkedInTime: null,
      totalTimeCheckedIn: (currentProfile.totalTimeCheckedIn || 0) + timeSpent,
      lastCheckOutTime: now.toISOString(),
    };

    // Create updated profiles array
    const updatedProfiles = profiles.map((profile) =>
      profile.id === currentProfile.id ? updatedProfile : profile
    );

    await saveProfilesData(updatedProfiles);
    console.log("User has been automatically checked out at midnight.");
  };

  const calculateTotalTime = (start, end) => {
    return (end - start) / 1000 / 60;
  };

  const formatDateTime = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString(undefined, options);
  };

  // Render loading state
  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>
          <Image
            source={require("../../assets/logo1.png")}
            style={styles.logo}
          />
          <Text style={styles.screenName}>{t("checkinTitle")}</Text>
        </View>
        <View style={styles.profileContainer}>
          <Text style={styles.profileText}>{t("loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>{t("checkinTitle")}</Text>
      </View>

      <View style={styles.profileContainer}>
        <Text style={styles.profileText}>{currentProfile.name}</Text>
        <Text style={styles.checkInText}>{t("checkInToWork")}</Text>

        <TouchableOpacity
          style={
            currentProfile.checkedIn
              ? styles.checkedInButton
              : styles.checkInButton
          }
          onPress={handleCheckIn}
        >
          <Text style={styles.buttonText}>
            {currentProfile.checkedIn
              ? t("pressToCheckOut")
              : t("pressToCheckIn")}
          </Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        onConfirm={handleCheckOut}
        showConfirm={showConfirm}
      />
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
    color: "#555",
  },
  checkInButton: {
    marginTop: 40,
    backgroundColor: "red",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
  },
  checkedInButton: {
    marginTop: 40,
    backgroundColor: "green",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CheckIn;

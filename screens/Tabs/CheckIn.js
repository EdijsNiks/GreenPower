import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
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

  // State to store current user profile
  const [currentProfile, setCurrentProfile] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData =
          Platform.OS === "web"
            ? await AsyncStorage.getItem("userData")
            : await SecureStore.getItemAsync("userData");

        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setCurrentProfile(parsedUserData);
          console.log("User Data:", parsedUserData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const updateProfileData = async (updatedProfileData) => {
    try {
      // Update userData in storage
      const storageMethod =
        Platform.OS === "web" ? AsyncStorage.setItem : SecureStore.setItemAsync;

      await storageMethod("userData", JSON.stringify(updatedProfileData));
      await syncProfileWithBackend(updatedProfileData);

      // Update local state
      setCurrentProfile(updatedProfileData);
    } catch (error) {
      console.error("Error updating profile data:", error);
    }
  };
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      return token;
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  };
  const syncProfileWithBackend = async (updatedProfileData) => {
    try {
      const response = await fetch(
        `http://192.168.8.101:8080/api/profile/${updatedProfileData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuthToken()}`,
          },
          body: JSON.stringify(updatedProfileData),
        }
      );

      if (!response.ok) {
        throw new Error("Profile sync failed");
      }

      const responseData = await response.json();
      console.log("Profile synced successfully:", responseData);

      // Update local storage and state
      const storageMethod =
        Platform.OS === "web" ? AsyncStorage.setItem : SecureStore.setItemAsync;
      await storageMethod("userData", JSON.stringify(updatedProfileData));
      setCurrentProfile(updatedProfileData);

      return responseData;
    } catch (error) {
      console.error("Error syncing profile:", error);
      throw error;
    }
  };

  const handleCheckIn = async () => {
    if (!currentProfile) return;

    const now = new Date();

    if (currentProfile.checkedIn) {
      setAlertMessage(t("reallyWantToCheckOut"));
      setShowConfirm(true);
      setAlertVisible(true);
      return;
    }

    const updatedProfile = {
      ...currentProfile,
      checkedIn: true,
      checkedInTime: now.toISOString(),
      firstCheckInTime: currentProfile.firstCheckInTime || now.toISOString(),
      lastCheckInTime: now.toISOString(),
      currentMonthCheckIns: (currentProfile.currentMonthCheckIns || 0) + 1,
      monthlyCheckIns: {
        ...(currentProfile.monthlyCheckIns || {}),
        [now.getFullYear()]: {
          ...(currentProfile.monthlyCheckIns?.[now.getFullYear()] || {}),
          [now.getMonth() + 1]:
            (currentProfile.monthlyCheckIns?.[now.getFullYear()]?.[
              now.getMonth() + 1
            ] || 0) + 1,
        },
      },
      lastUpdated: now.toISOString(),
    };
    await updateProfileData(updatedProfile);

    setAlertMessage(t("checkIn"));
    setShowConfirm(false);
    setAlertVisible(true);
  };

  const handleCheckOut = async () => {
    if (!currentProfile || !currentProfile.checkedIn) return;

    const now = new Date();
    const checkInTime = new Date(currentProfile.checkedInTime);
    const timeSpent = calculateTotalTime(checkInTime, now);

    // Prepare updated profile data for checkout
    const updatedProfile = {
      ...currentProfile,
      checkedIn: false,
      checkedInTime: null,
      totalTimeCheckedIn: (currentProfile.totalTimeCheckedIn || 0) + timeSpent,
      lastCheckOutTime: now.toISOString(),
      lastUpdated: now.toISOString(),
    };

    await updateProfileData(updatedProfile);

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

  const calculateTotalTime = (start, end) => {
    return (end - start) / 1000 / 60; // Convert to minutes
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

import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from '../../components/CheckInComp/CustomAlert';

const { width } = Dimensions.get("window");

const CheckIn = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState("Jeff");
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0); // Store total time spent checked in
  const [alertVisible, setAlertVisible] = useState(false); 
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false); // To show confirmation alert

  // Load data from AsyncStorage on mount
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

    // Load stored check-in/out times and total time from AsyncStorage
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const checkInTimeStored = await AsyncStorage.getItem('checkInTime');
      const totalTimeStored = await AsyncStorage.getItem('totalTime');
      
      if (checkInTimeStored) {
        setCheckInTime(new Date(checkInTimeStored));
        setCheckedIn(true);
      }
      
      if (totalTimeStored) {
        setTotalTime(parseFloat(totalTimeStored));
      }
      
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  // Reset states and total time after 24 hours
  const resetStates = async () => {
    setCheckedIn(false);
    setCheckInTime(null);
    setCheckOutTime(null);
    setTotalTime(0);
    await AsyncStorage.removeItem('checkInTime');
    await AsyncStorage.removeItem('totalTime');
  };

  useEffect(() => {
    // Automatically reset the state every 24 hours
    const interval = setInterval(async () => {
      const now = new Date();
      if (checkInTime && now.getTime() - checkInTime.getTime() >= 24 * 60 * 60 * 1000) {
        await resetStates();
      }
    }, 1000 * 60); // Check every minute

    return () => clearInterval(interval);
  }, [checkInTime]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const calculateTotalTime = (start, end) => {
    const timeSpent = (end - start) / 1000 / 60; // Time spent in minutes
    return timeSpent;
  };

  const formatDateTime = (date) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString(undefined, options);
  };

  const handleCheckIn = async () => {
    if (checkedIn) {
      // Show confirmation before checking out
      setAlertMessage("Do you really want to check out?");
      setShowConfirm(true); // Enable Yes/No buttons in the alert
      setAlertVisible(true);
    } else {
      // User checks in
      const now = new Date();
      setCheckInTime(now);
      await AsyncStorage.setItem('checkInTime', now.toString());
      setAlertMessage("Check-In Successful");
      setShowConfirm(false); // Disable Yes/No buttons, show OK
      setAlertVisible(true);
      setCheckedIn(true);
    }
  };

  const handleCheckOut = async () => {
    const now = new Date();
    setCheckOutTime(now);

    // Calculate total time spent checked in for this session
    const timeSpent = calculateTotalTime(checkInTime, now);
    const newTotalTime = totalTime + timeSpent;
    setTotalTime(newTotalTime);

    // Save total time to AsyncStorage
    await AsyncStorage.setItem('totalTime', newTotalTime.toString());
    
    // Format start and end times for display
    const checkInFormatted = formatDateTime(checkInTime);
    const checkOutFormatted = formatDateTime(now);

    // Reset check-in state
    setCheckedIn(false);
    setCheckInTime(null);
    setCheckOutTime(null);
    await AsyncStorage.removeItem('checkInTime');

    setAlertMessage(
      `You have checked out.\n\nStart: ${checkInFormatted}\nEnd: ${checkOutFormatted}\nTime spent: ${timeSpent.toFixed(2)} minutes.`
    );
    setShowConfirm(false);
    setAlertVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>CHECKIN</Text>
      </View>

      <View style={styles.profileContainer}>
        <Text style={styles.profileText}>{currentUser}</Text>
        <Text style={styles.checkInText}>Check in to work</Text>

        <TouchableOpacity
          style={checkedIn ? styles.checkedInButton : styles.checkInButton}
          onPress={handleCheckIn}
        >
          <Text style={styles.buttonText}>
            {checkedIn ? "Press to check out" : "Press to check in"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Alert Modal */}
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



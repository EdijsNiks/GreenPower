import React, { useLayoutEffect, useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../components/CheckInComp/CustomAlert';

const { width } = Dimensions.get('window');

const CheckIn = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Load user profile data from AsyncStorage on mount
  useEffect(() => {
    loadProfileData();
    console.log(profile);
  }, []);

  const loadProfileData = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('profile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  // Save user profile data to AsyncStorage
  const saveProfileData = async (updatedProfile) => {
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleCheckIn = async () => {
    if (profile && profile.checkedIn) {
      // Show confirmation before checking out
      setAlertMessage("Do you really want to check out?");
      setShowConfirm(true);
      setAlertVisible(true);
    } else {
      // User checks in
      const now = new Date();
      const updatedProfile = {
        ...profile,
        checkedIn: true,
        checkedInTime: now.toISOString(),
      };
      await saveProfileData(updatedProfile);
      setAlertMessage("Check-In Successful");
      setShowConfirm(false);
      setAlertVisible(true);
    }
  };

  const handleCheckOut = async () => {
    if (profile) {
      const now = new Date();
      const timeSpent = calculateTotalTime(new Date(profile.checkedInTime), now);
      const updatedProfile = {
        ...profile,
        checkedIn: false,
        checkedInTime: null,
        totalTime: profile.totalTime + timeSpent,
      };
      await saveProfileData(updatedProfile);

      // Format start and end times for display
      const checkInFormatted = formatDateTime(new Date(profile.checkedInTime));
      const checkOutFormatted = formatDateTime(now);

      setAlertMessage(
        `You have checked out.\n\nStart: ${checkInFormatted}\nEnd: ${checkOutFormatted}\nTime spent: ${timeSpent.toFixed(2)} minutes.`
      );
      setShowConfirm(false);
      setAlertVisible(true);
    }
  };

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

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>
          <Image source={require('../../assets/logo1.png')} style={styles.logo} />
          <Text style={styles.screenName}>CHECKIN</Text>
        </View>
        <View style={styles.profileContainer}>
          <Text style={styles.profileText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Image source={require('../../assets/logo1.png')} style={styles.logo} />
        <Text style={styles.screenName}>CHECKIN</Text>
      </View>

      <View style={styles.profileContainer}>
        <Text style={styles.profileText}>{profile.name}</Text>
        <Text style={styles.checkInText}>Check in to work</Text>

        <TouchableOpacity
          style={profile.checkedIn ? styles.checkedInButton : styles.checkInButton}
          onPress={handleCheckIn}
        >
          <Text style={styles.buttonText}>
            {profile.checkedIn ? 'Press to check out' : 'Press to check in'}
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



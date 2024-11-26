import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  Dimensions,
  Pressable,
  FlatList,
  TouchableOpacity,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get("window");
import { useTranslation } from "react-i18next";

const AdminPage = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showCheckedInOnly, setShowCheckedInOnly] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        // Retrieve current user data from SecureStore
        const userData = Platform.OS === "web"
        ? await AsyncStorage.getItem("userData")
        : await SecureStore.getItemAsync("userData");
        
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setCurrentUser(parsedUserData);
        }

        // Retrieve profiles from AsyncStorage
        const profilesString = await AsyncStorage.getItem('profile');
        
        if (profilesString) {
          const parsedProfiles = JSON.parse(profilesString);
          setProfiles(parsedProfiles);
          console.log("All Profiles:", parsedProfiles);
        }

        // Load history
        const storedHistory = await AsyncStorage.getItem("userHistory");
        const history = storedHistory ? JSON.parse(storedHistory) : [];
        setHistoryData(history);
      } catch (error) {
        console.error("Error loading admin data:", error);
      }
    };

    loadAdminData();
  }, []);

  const handleConfirm = (date) => {
    setSelectedDate(format(date, "dd.MM.yyyy"));
    setDatePickerVisibility(false);
  };

  const renderHistoryItem = ({ item }) => {
    if (selectedDate && item.date !== selectedDate) return null;
    return (
      <View style={styles.itemBox}>
        <Text style={styles.listItem}>
          {item.user} {item.action} {item.description} - {item.date}
        </Text>
        <View style={styles.separator} />
      </View>
    );
  };

  const renderUserItem = ({ item }) => {
    if (showCheckedInOnly && !item.checkedIn) return null;
    return (
      <View style={styles.itemBox}>
        <Text style={styles.listItem}>
          {item.name} - {item.email || 'No email'} -
          {item.checkedIn ? t("checkedIn") : t("notCheckedIn")}
        </Text>
        <View style={styles.separator} />
      </View>
    );
  };

  // Filter for admin access
  const isAdmin = currentUser?.admin === true ;

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>
          <Image source={require("../../assets/logo1.png")} style={styles.logo} />
          <Text style={styles.screenName}>{t("adminPage")}</Text>
        </View>
        <View style={styles.noAccessContainer}>
          <Text style={styles.noAccessText}>{t("noAdminAccess")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>{t("adminPage")}</Text>
      </View>

      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.buttonText}>{t("backToProfile")}</Text>
      </Pressable>

      {/* Users Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.listTitle}>{t("users")}</Text>
          <TouchableOpacity
            onPress={() => 
              navigation.navigate("ViewAll", {
                type: "users",
                userData: profiles,
              })
            }
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>{t("viewAll")}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filters */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            onPress={() => setShowCheckedInOnly(!showCheckedInOnly)}
            style={styles.filterButton}
          >
            <Text style={styles.filterButtonText}>
              {showCheckedInOnly ? t("showAll") : t("showCheckedInOnly")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setDatePickerVisibility(true)}
            style={styles.filterButton}
          >
            <Text style={styles.filterButtonText}>
              {selectedDate ? selectedDate : t("filterByDate")}
            </Text>
          </TouchableOpacity>
        </View>

        {profiles.length === 0 ? (
          <Text>{t("noUsersFound")}</Text>
        ) : (
          <FlatList
            style={styles.listContainer}
            data={profiles}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={renderUserItem}
          />
        )}
      </View>

      {/* History Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.listTitle}>{t("history")}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("ViewAll", { 
              type: "history",
              historyData: historyData 
            })}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>{t("viewAll")}</Text>
          </TouchableOpacity>
        </View>
        {historyData.length === 0 ? (
          <Text>{t("noHistoryFound")}</Text>
        ) : (
          <FlatList
            style={styles.listContainer}
            data={historyData}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={renderHistoryItem}
          />
        )}
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  section: {
    flex: 1,
    justifyContent: "flex-start",
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
  backButton: {
    marginTop: 120,
    width: 150,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#A4D337",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  viewAllButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  viewAllText: {
    color: "#A4D337",
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  itemBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItem: {
    fontSize: 16,
    color: "#333",
  },
  separator: {
    marginTop: 12,
    height: 1,
    backgroundColor: "#ddd",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  filterButtonText: {
    color: '#333',
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAccessText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default AdminPage;

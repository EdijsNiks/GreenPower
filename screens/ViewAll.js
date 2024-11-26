import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const ViewAll = ({ route }) => {
  const { type, userData } = route.params; // Get userData from route params
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [historyData, setHistoryData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showCheckedInOnly, setShowCheckedInOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch history data
      const storedHistory = await AsyncStorage.getItem("userHistory");
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      setHistoryData(history);
    } catch (error) {
      console.error("Error loading history data:", error);
    }
  };

  const handleConfirm = (date) => {
    setSelectedDate(format(date, "dd.MM.yyyy"));
    setDatePickerVisibility(false);
  };

  const generateUsersPdf = async () => {
    const html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { text-align: center; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>${t("allUsers")}</h1>
      <table>
        <thead>
          <tr>
            <th>${t("name")}</th>
            <th>${t("email")}</th>
            <th>${t("checkedIn")}</th>
            <th>${t("totalTimeCheckedIn")}</th>
            <th>${t("monthlyCheckIns")}</th>
          </tr>
        </thead>
        <tbody>
          ${userData
            .map(
              (user) => ` 
            <tr>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.checkedIn ? t("checkedIn") : t("notCheckedIn")}</td>
              <td>${(user.totalTimeCheckedIn || 0).toFixed(2)} ${t("minutes")}</td>
              <td>${user.currentMonthCheckIns || 0}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>`;

    const file = await printToFileAsync({
      html: html,
      base64: false,
      pageSize: "A4",
      printBackground: true,
    });
    await shareAsync(file.uri);
  };

  const generateHistoryPdf = async () => {
    const html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { text-align: center; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>${t("history")}</h1>
      <table>
        <thead>
          <tr>
            <th>${t("user")}</th>
            <th>${t("action")}</th>
            <th>${t("description")}</th>
            <th>${t("date")}</th>
          </tr>
        </thead>
        <tbody>
          ${historyData
            .map(
              (item) => ` 
            <tr>
              <td>${item.user}</td>
              <td>${item.action}</td>
              <td>${item.description}</td>
              <td>${item.date}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>`;

    const file = await printToFileAsync({
      html: html,
      base64: false,
      pageSize: "A4",
      printBackground: true,
    });
    await shareAsync(file.uri);
  };

  const renderHistoryItem = ({ item }) => {
    if (selectedDate && item.date !== selectedDate) return null;
    return (
      <View style={styles.itemBox}>
        <Text style={styles.listItem}>
          {item.user} {item.action} {item.description} - {item.date}
        </Text>
      </View>
    );
  };

  const renderUserItem = ({ item }) => {
    if (showCheckedInOnly && !item.checkedIn) return null;
    return (
      <View style={styles.itemBox}>
        <Text style={styles.listItem}>
          {item.name} - {t("email")}: {item.email} - {item.checkedIn ? t("checkedIn") : t("notCheckedIn")} - {t("totalTimeCheckedIn")}: {(item.totalTimeCheckedIn || 0).toFixed(2)} {t("minutes")}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Image source={require("../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>
          {type === "users" ? t("allUsers") : t("allHistory")}
        </Text>
      </View>

      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.buttonText}>{t("back")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={type === "users" ? generateUsersPdf : generateHistoryPdf}
          style={styles.backButton}
        >
          <Text style={styles.buttonText}>PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.listTitle}>
          {type === "users" ? t("users") : t("history")}
        </Text>
        {type === "users" && (
          <TouchableOpacity
            onPress={() => setShowCheckedInOnly(!showCheckedInOnly)}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>
              {showCheckedInOnly ? t("showAllUsers") : t("showCheckedInOnly")}
            </Text>
          </TouchableOpacity>
        )}
        {type === "history" && (
          <TouchableOpacity
            onPress={() => setDatePickerVisibility(true)}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>
              {selectedDate
                ? t("date", { date: selectedDate })
                : t("filterByDate")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        style={styles.listContainer}
        data={type === "users" ? userData : historyData} // Use userData if it's for users
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={type === "users" ? renderUserItem : renderHistoryItem}
      />

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
  container: {
    flexDirection: "row",
    paddingHorizontal: 10,
    justifyContent: "space-between",
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
    width: 140,
    paddingVertical: 15,
    borderRadius: 10,
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
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ViewAll;

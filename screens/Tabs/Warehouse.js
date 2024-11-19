import React, { useState, useEffect, useCallback  } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Button,
  Alert,
} from "react-native";
import { Camera } from "expo-camera";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FilterModalWarehouse from "../../components/FilterModalWarehouse";
import Pagination from "../../components/Pagination";
import QRCodeScanner from "../../components/QRCodeScanner";
import styles from "../../styles/WarehouseStyles.js";
import WarehouseSpots from "../../components/WarehouseSpots.js";
import { useTranslation } from "react-i18next";
import i18next, { languageResources } from "../../services/i18next";

const Warehouse = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [currentUser, setCurrentUser] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTaskList, setFilteredTaskList] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [categories, setCategories] = useState([]); // Holds categories loaded from AsyncStorage
  const tasksPerPage = 10;
  const [savedData, setSavedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load task list and categories from AsyncStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tasks
        const storedItems = await AsyncStorage.getItem("items");
        if (storedItems) {
          setTaskList(JSON.parse(storedItems));
          setFilteredTaskList(JSON.parse(storedItems)); // Initialize filtered list with all items
        }
        console.log("Task list loaded from AsyncStorage:");
        console.log(storedItems);

        // Load categories
        const storedCategories = await AsyncStorage.getItem("categories");
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    const unsubscribe = navigation.addListener("focus", loadData);
    loadData();
    return unsubscribe;
  }, [navigation]);

  const handleItemUpdate = useCallback(async (updatedItems) => {
    try {
      // Get current spots data
      const spotsData = await AsyncStorage.getItem('spots');
      let spots = spotsData ? JSON.parse(spotsData) : [];

      // Update the specific spot with new items
      spots = spots.map(spot => {
        if (spot.spotId === savedData) {
          return {
            ...spot,
            items: updatedItems.map(item => ({
              itemId: item.id,
              count: item.count || 0
            }))
          };
        }
        return spot;
      });

      // Save updated spots back to storage
      await AsyncStorage.setItem('spots', JSON.stringify(spots));
      
      // Optional: Update any local state if needed
      //Alert.alert('Success', 'Spot updated successfully');
    } catch (error) {
      console.error('Error updating spot:', error);
      Alert.alert('Error', t("failedToUpdate"));
    }
  }, [savedData]);
  const handleModalClose = (updatedItems) => {
    if (updatedItems) {
      // Update local state
      setTaskList(updatedItems);
      setFilteredTaskList(updatedItems);
    }
    setModalVisible(false);
  };

  // Update taskList with new or updated item and save to AsyncStorage
  useEffect(() => {
    if (route?.params?.updatedItem) {
      const updateItem = async () => {
        const updatedItems = taskList.map((item) =>
          item.id === route.params.updatedItem.id
            ? route.params.updatedItem
            : item
        );
        try {
          console.log(updatedItems);
          await AsyncStorage.setItem("items", JSON.stringify(updatedItems));
          setTaskList(updatedItems);
          setFilteredTaskList(updatedItems);
        } catch (error) {
          console.error("Error updating items:", error);
        }
      };
      updateItem();
    }
  }, [route?.params?.updatedItem]);

  useEffect(() => {
    if (route?.params?.updatedItem) {
      const updateItem = async () => {
        const updatedItems = taskList.map((item) =>
          item.id === route.params.updatedItem.id
            ? route.params.updatedItem
            : item
        );
        try {
          await AsyncStorage.setItem("items", JSON.stringify(updatedItems));
          setTaskList(updatedItems);
          setFilteredTaskList(updatedItems); // Refresh filtered list
        } catch (error) {
          console.error("Error updating items:", error);
        }
      };
      updateItem();
    }
  }, [route?.params?.updatedItem]);

  // Request camera permission
  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    requestCameraPermission();

    if (route.params?.scannedData) {
      setSavedData(route.params.scannedData);
      if (route.params.scannedData) {
        setModalVisible(true);
      }
    }
  }, [route.params?.scannedData]);

  const handleQRCodeScanned = (data) => {
    setSavedData(data);
    setModalVisible(true);
    setShowScanner(false);
  };
  const handleSearch = (text) => {
    setSearchQuery(text);

    if (text === "") {
      // Reset to full task list if search is cleared
      setFilteredTaskList(taskList);
    } else {
      // Filter task list based on search query
      const filteredData = taskList.filter((task) =>
        task.name ? task.name.toLowerCase().includes(text.toLowerCase()) : false
      );
      setFilteredTaskList(filteredData);
    }
  };

  // Function to filter by selected categories
  const handleCategoryFilter = (categories) => {
    setSelectedCategories(categories);
    if (categories.length > 0) {
      const filteredData = taskList.filter((task) =>
        categories.includes(task.category)
      );
      setFilteredTaskList(filteredData);
    } else {
      setFilteredTaskList(taskList); // Reset if no categories selected
    }
    setFilterModalVisible(false);
  };

  const renderTaskItem = ({ item }) => {
    let backgroundColor;
    if (item.count === 0) {
      backgroundColor = "red"; // Red if count is zero
    } else if (item.reserved.length > 0 && item.count > 0) {
      backgroundColor = "green"; // Green if item is reserved and has stock
    } else {
      backgroundColor = "#D3D3D3"; // Grey if it has stock but is not reserved
    }
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("WarehouseItemInfo", { itemData: item })
        }
      >
        <View style={[styles.taskItem, { backgroundColor }]}>
          <Text style={styles.taskTitle}>{item.name}</Text>
          <Text>{t("count")}: {item.count}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const totalPages = Math.ceil(filteredTaskList.length / tasksPerPage);
  const currentPageData = filteredTaskList.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>{t("warehouse")}</Text>
      </View>

      <View style={styles.profileContainer}>
        <Text style={styles.profileText}>{currentUser}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <FontAwesome name="filter" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchBar}
          placeholder={t("searchWarehouse")}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowScanner(true)}
        >
          <Text style={styles.addButtonText}>{t("qrcode")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddItemToWarehouse")}
        >
          <Text style={styles.addButtonText}>{t("addItem")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddSpotToWarehouse")}
        >
          <Text style={styles.addButtonText}>{t("plusSpot")}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        {hasPermission === null ? (
          <View style={styles.cameraContainer}>
            <Text>{t("reqCamera")}</Text>
          </View>
        ) : hasPermission === false ? (
          <View style={styles.cameraContainer}>
            <Text>{t("camDenied")}</Text>
            <Button
              title={t("grantPerm")}
              onPress={() => Camera.constants.requestCameraPermissionsAsync()}
            />
          </View>
        ) : (
          <QRCodeScanner
            onScanComplete={handleQRCodeScanned}
            onClose={() => setShowScanner(false)}
          />
        )}
      </Modal>

      <FlatList
        data={searchQuery ? filteredTaskList : currentPageData}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.taskList}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((prev) => prev - 1)}
        onNext={() => setCurrentPage((prev) => prev + 1)}
      />

      <FilterModalWarehouse
        isVisible={isFilterModalVisible}
        screenType={"warehouse"}
        onClose={() => setFilterModalVisible(false)}
        updateCategories={setCategories}
        categories={categories} // Display loaded categories
        selectedCategories={selectedCategories}
        handleFilter={handleCategoryFilter}
        clearSelection={() => {
          setSelectedCategories([]);
          setFilteredTaskList(taskList); // Reset filter
          setFilterModalVisible(false);
        }}
      />
      <WarehouseSpots
        isVisible={modalVisible}
        spotId={savedData}
        onClose={handleModalClose}
        onSave={handleItemUpdate}
      />
    </SafeAreaView>
  );
};

export default Warehouse;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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
  ActivityIndicator,
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
import TranslatableText from "../../components/Language/translatableText";


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
  const [categories, setCategories] = useState([]);
  const [originalTaskList, setOriginalTaskList] = useState([]);
  const tasksPerPage = 10;
  const [savedData, setSavedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const applyFilters = (items, query, categories) => {
    let filteredData = items;

    // Apply category filter
    if (categories.length > 0) {
      filteredData = filteredData.filter((item) =>
        categories.some((category) => item.category === category)
      );
    }

    // Apply search query filter
    if (query) {
      filteredData = filteredData.filter(
        (item) =>
          item.name && item.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredTaskList(filteredData);
    setCurrentPage(1); // Reset pagination
  };

  // Load task list and categories from AsyncStorage on component mount
  useFocusEffect(
    useCallback(() => {
      const shouldRefresh = route.params?.shouldRefresh;
      
      const loadData = async () => {
        try {
          // Check if we should refresh or fetch new data
          if (shouldRefresh) {
            navigation.setParams({ shouldRefresh: false });
          }
  
          const response = await fetch("http://192.168.8.101:8080/api/warehouse");
          if (!response.ok)
            throw new Error("Failed to fetch items from warehouse");
  
          const items = await response.json();

  
          // Only update if there are no local updates
          if (!route?.params?.updatedItem) {
            await AsyncStorage.removeItem("items");
            await AsyncStorage.setItem("items", JSON.stringify(items));
  
            setTaskList(items);
            setOriginalTaskList(items);
  
            // Apply existing filters
            applyFilters(items, searchQuery, selectedCategories);
          }
        } catch (error) {
          console.error("Error fetching items:", error);
          try {
            // Fallback to locally stored items
            const storedItems = await AsyncStorage.getItem("items");
            if (storedItems) {
              const parsedItems = JSON.parse(storedItems);
              setTaskList(parsedItems);
              setOriginalTaskList(parsedItems);
  
              // Apply existing filters
              applyFilters(parsedItems, searchQuery, selectedCategories);
            }
          } catch (storageError) {
            console.error("Error reading items from AsyncStorage:", storageError);
          }
        }
  
        // Load categories from AsyncStorage
        try {
          const storedCategories = await AsyncStorage.getItem("categories");
          if (storedCategories) {
            setCategories(JSON.parse(storedCategories));
          }
        } catch (error) {
          console.error("Error loading categories:", error);
        }
      };
  
      loadData();

    }, [navigation, route.params?.shouldRefresh])
  );

  // Handle search with new filtering approach
  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(taskList, text, selectedCategories);
  };

  // Handle category filtering with new approach
  const handleCategoryFilter = (selectedCategory) => {
    const newSelectedCategories = selectedCategories.includes(selectedCategory)
      ? selectedCategories.filter((cat) => cat !== selectedCategory)
      : [...selectedCategories, selectedCategory];

    setSelectedCategories(newSelectedCategories);
    applyFilters(originalTaskList, searchQuery, newSelectedCategories);
    setFilterModalVisible(false);
  };

  // Clear all filters
  const clearSelection = () => {
    setSelectedCategories([]);
    setSearchQuery("");
    setFilteredTaskList(originalTaskList);
    setFilterModalVisible(false);
  };

  const handleItemUpdate = useCallback(
    async (updatedItems) => {
      try {
        // Update local AsyncStorage spots
        const spotsData = await AsyncStorage.getItem("spots");
        let spots = spotsData ? JSON.parse(spotsData) : [];
        spots = spots.map((spot) => {
          if (spot.spotId === savedData) {
            return {
              ...spot,
              items: updatedItems.map((item) => ({
                itemId: item.id,
                count: item.count || 0,
              })),
            };
          }
          return spot;
        });
        await AsyncStorage.setItem("spots", JSON.stringify(spots));
      } catch (error) {
        console.error("Error updating spot and items:", error);
        Alert.alert("Error", t("failedToUpdate"));
      }
    },
    [savedData]
  );
  const handleModalClose = async (updatedItems) => {
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

          // Update AsyncStorage
          await AsyncStorage.setItem("items", JSON.stringify(updatedItems));
          setTaskList(updatedItems);
          setFilteredTaskList(updatedItems);

          // Update the API
          const { id } = route.params.updatedItem;
          const response = await fetch(
            `http://192.168.8.101:8080/api/warehouse/items/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(route.params.updatedItem), // Pass the entire object
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update item in database");
          }
        } catch (error) {
          console.error("Error updating items:", error);
          Alert.alert("Error", "Failed to update item data");
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

  const renderTaskItem = ({ item }) => {
    let backgroundColor;

    // Parse reserved field into a JSON array if it is a string
    let reservedArray = [];
    try { 
    } catch (error) {
      console.error("Error parsing reserved field:", error);
    }

    if (item.count === 0) {
      backgroundColor = "red"; // Red if count is zero
    } else if ( item.reserved.length > 0 && item.count > 0 ) {
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
          <TranslatableText style={styles.taskTitle} text={item.name} fallbackText={item.name} />
          <Text>
            {t("count")}: {item.count}
          </Text>
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
          <Text style={styles.addButtonText}>{t("add_item")}</Text>
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
        categories={categories}
        selectedCategories={selectedCategories}
        handleFilter={handleCategoryFilter}
        clearSelection={clearSelection}
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

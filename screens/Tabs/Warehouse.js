import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
} from "react-native";
import { Camera } from "expo-camera";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FilterModalWarehouse from "../../components/FilterModalWarehouse";
import Pagination from "../../components/Pagination";
import QRCodeScanner from "../../components/QRCodeScanner";
import styles from "../../styles/WarehouseStyles.js";
import WarehouseSpots from "../../components/WarehouseSpots.js";
import { mockData } from "../../mockData.js";
const Warehouse = ({ route }) => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(mockData.profile.username);
  const [taskList, setTaskList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTaskList, setFilteredTaskList] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const tasksPerPage = 10;
  const [savedData, setSavedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedTaskList, setUpdatedTaskList] = useState([]);

  useEffect(() => {
    // Check if a new item was passed back from the AddItemToWarehouse screen
    if (route?.params?.newItem) {
      // Add the new item to the current list of items
      const updatedItems = [route.params.newItem];
      setTaskList(updatedItems);  // Update the state properly

      console.log(updatedItems);
      // Store the updated items in AsyncStorage
     // AsyncStorage.setItem("items", JSON.stringify(updatedItems));
    }
  }, [route?.params?.newItem]); // Run when newItem is passed

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

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleQRCodeScanned = (data) => {
    console.log("Scanned data:", data);
    setSavedData(data);
    setModalVisible(true);
    setShowScanner(false);
  };
  const handleSearch = (text) => {
    setSearchQuery(text);
    
    const filteredData = mockData.warehouse.filter((task) =>
      task.title ? task.title.toLowerCase().includes(text.toLowerCase()) : false
    );
    
    setFilteredTaskList(filteredData);
  };
  

  const renderTaskItem = ({ item }) => {
    let backgroundColor;

    if (item.count === 0) {
      backgroundColor = "red"; // Red if count is zero
    } else if (item.reserved) {
      backgroundColor = "green"; // Green if item is reserved and has stock
    } else {
      backgroundColor = "#D3D3D3"; // Grey if it has stock but is not reserved
    }

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("WarehouseItemInfo", {
          itemData: item, // Pass the entire item object
        })
        }
      >
        <View style={[styles.taskItem, { backgroundColor }]}>
          <Text style={styles.taskTitle}>{item.name}</Text>
          <Text>Count: {item.count}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const totalPages = Math.ceil(taskList.length / tasksPerPage);
  const currentPageData = taskList.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>WAREHOUSE</Text>
      </View>

      <View style={styles.profileContainer}>
        <Text style={styles.profileText}></Text>
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
          placeholder="Search Warehouse Item"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowScanner(true)}
        >
          <Text style={styles.addButtonText}>QRCode Scanner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddItemToWarehouse")}
        >
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddSpotToWarehouse")}
        >
          <Text style={styles.addButtonText}>+ Spot</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        {hasPermission === null ? (
          <View style={styles.cameraContainer}>
            <Text>Requesting camera permission...</Text>
          </View>
        ) : hasPermission === false ? (
          <View style={styles.cameraContainer}>
            <Text>Camera permission denied</Text>
            <Button
              title="Grant Permission"
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
        onClose={() => setFilterModalVisible(false)}
        selectedCategories={selectedCategories}
        handleFilter={(categories) => {
          setSelectedCategories(categories);
          setFilterModalVisible(false);
        }}
        clearSelection={() => {
          setSelectedCategories([]);
          setTaskList(mockData.warehouse);
          setFilterModalVisible(false);
        }}
      />
      <WarehouseSpots
        isVisible={modalVisible}
        spotData={savedData}
        onClose={() => {
          setModalVisible(false);
          setSavedData(null);
        }}
      />
    </SafeAreaView>
  );
};

export default Warehouse;

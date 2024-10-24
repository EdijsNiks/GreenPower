// Warehouse.js
import React, { useLayoutEffect, useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FilterModalWarehouse from "../../components/FilterModalWarehouse";
import Pagination from "../../components/Pagination";
import styles from "../../styles/WarehouseStyles.js";

const { width } = Dimensions.get("window");

const tasksData = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  count: Math.floor(Math.random() * 11), // Random stock count for demonstration
  reserved: i % 3 === 0, // Every third item is reserved for demonstration
}));

const Warehouse = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState("");
  const [taskList, setTaskList] = useState(tasksData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTaskList, setFilteredTaskList] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const tasksPerPage = 10;
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("myKey")
      .then((stringifiedData) => {
        if (stringifiedData !== null) {
          const data = JSON.parse(stringifiedData);
          setCurrentUser(data);
        }
      })
      .catch((error) => {
        console.error("Error retrieving data:", error);
      });
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Reset pagination when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1); // Reset to first page when screen is focused
    }, [])
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filteredData = tasksData.filter((task) =>
      task.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredTaskList(filteredData);
  };

  const handleFilter = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== category)
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }

    const filteredData = tasksData.filter(
      (task) =>
        selectedCategories.includes(task.category) || task.category === category
    );
    setTaskList(filteredData);
  };

  const clearSelection = () => {
    setSelectedCategories([]);
    setTaskList(tasksData);
    setFilterModalVisible(false);
  };

  const getItemBackgroundColor = (item) => {
    if (item.reserved&&item.count > 0) {
      return "#A4D337"; // Reserved item
    }
    if (item.count === 0) {
      return "red"; // Out of stock
    }
    return "white"; // In stock but not reserved
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("WarehouseItemInfo", { taskId: item.id })
      }
    >
      <View
        style={[
          styles.taskItem,
          { backgroundColor: getItemBackgroundColor(item) }, // Apply conditional background
        ]}
      >
        <View style={styles.taskLeft}>
          <View style={styles.taskCircle}></View>
          <Text style={styles.taskTitle}>{item.title}</Text>
        </View>
        <View style={styles.taskRight}>
          <Text>Count: {item.count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const totalPages = Math.ceil(taskList.length / tasksPerPage);
  const currentPageData = taskList.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>WAREHOUSE</Text>
      </View>

      {/* Profile Container */}
      <View style={styles.profileContainer}>
        <Text style={styles.profileText}>{currentUser}</Text>
      </View>

      {/* Search, Filter, and Add Task */}
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

      <View style={styles.container}>
        <View style={styles.buttonRow}>
          {/* QR Code Scanner Button */}
          <TouchableOpacity style={styles.qrButton} onPress={() => setIsScanning(true)}>
            <Text style={styles.qrButtonText}>Scan QR Code</Text>
          </TouchableOpacity>

          {/* Add Item Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddItemToWarehouse")}
          >
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
        {scannedData ? (
          <Text style={styles.scannedDataText}>
            Scanned Data: {scannedData}
          </Text>
        ) : null}
      </View>

      {/* Task List */}
      <FlatList
        data={searchQuery ? filteredTaskList : currentPageData}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.taskList}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((prev) => prev - 1)}
        onNext={() => setCurrentPage((prev) => prev + 1)}
      />

      {/* Modals */}
      <FilterModalWarehouse
        isVisible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        selectedCategories={selectedCategories}
        handleFilter={handleFilter}
        clearSelection={clearSelection}
      />

      {/* QR Code Scanner */}
      {isScanning && <QRCodeScannerComponent onRead={(e) => setScannedData(e.data)} />}
    </SafeAreaView>
  );
};

export default Warehouse;


import React, { useLayoutEffect, useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native"; 
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  Dimensions,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Button,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FilterModalWarehouse from "../../components/FilterModalWarehouse";
import Pagination from '../../components/Pagination';

const { width } = Dimensions.get("window");

const tasksData = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
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
          console.log("User data retrieved from AsyncStorage:", data);
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

  const handleQRCodeRead = (e) => {
    setScannedData(e.data);
    setIsScanning(false);
  };

  const openQRScanner = () => {
    setIsScanning(true);
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("WarehouseItemInfo", { taskId: item.id })
      }
    >
      <View style={styles.taskItem}>
        <View style={styles.taskLeft}>
          <View style={styles.taskCircle}></View>
          <Text style={styles.taskTitle}>{item.title}</Text>
        </View>
        <View style={styles.taskRight}>
          <Text>Count: 10</Text>
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
        {/* QR Code Scanner Button */}
        <TouchableOpacity
          style={styles.qrButton}
          onPress={openQRScanner}
        >
          <Text style={styles.qrButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
        
        {/* Add Item Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddItemToWarehouse")}
        >
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>

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
      {isScanning && <QRCodeScannerComponent onRead={handleQRCodeRead} />}
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
    marginTop: 110,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  profileText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchBar: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 10,
  },
  container: {
    alignItems: "center",
    marginTop: 10,
  },
  qrButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  qrButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba     (0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "green",
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskRight: {
    alignItems: "center",
  },
  scannedDataText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "green",
  },
});

export default Warehouse;


import React, { useLayoutEffect, useState, useEffect } from "react";
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
import Fontisto from "@expo/vector-icons/Fontisto";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const { width } = Dimensions.get("window");

const tasksData = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  category: i % 2 === 0 ? "Work" : "Personal",
  completed: i % 3 === 0,
}));
const Warehouse = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState("");
  const [itemsList, setItemsList] = useState(tasksData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredWarehouseItemsList, setFilteredWarehouseItemsList] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const toggleTaskCompletion = (taskId) => {
    setItemsList((prevItemsList) =>
      prevItemsList.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filteredData = tasksData.filter((task) =>
      task.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredWarehouseItemsList(filteredData);
  };

  const handleFilter = (category) => {
    setSelectedCategory(category);
    const filteredData = tasksData.filter((task) => task.category === category);
    setItemsList(filteredData);
    setFilterModalVisible(false);
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("WarehouseItemInfo", { taskId: item.id })}
    >
      <View style={styles.taskItem}>
        <View style={styles.taskLeft}>
          <View style={styles.taskCircle}></View>
          <Text style={styles.taskTitle}>{item.title}</Text>
        </View>
        <View style={styles.taskRight}>
          <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
            {item.completed ? (
              <Fontisto name="checkbox-active" size={24} color="black" />
            ) : (
              <Fontisto name="checkbox-passive" size={24} color="black" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const totalPages = Math.ceil(itemsList.length / itemsPerPage);
  const currentPageData = itemsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
  
        {/* Task List */}
        <FlatList
          data={searchQuery ? filteredTaskList : currentPageData}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.taskList}
        />
  
        {/* Pagination */}
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage((prev) => prev - 1)}
          >
            <Text style={styles.pageButton}>Prev</Text>
          </TouchableOpacity>
          <Text style={styles.pageNumber}>
            Page {currentPage} of {totalPages}
          </Text>
          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage((prev) => prev + 1)}
          >
            <Text style={styles.pageButton}>Next</Text>
          </TouchableOpacity>
        </View>
  
        {/* Filter Modal */}
        <Modal
          visible={isFilterModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Button title="Work" onPress={() => handleFilter("Work")} />
              <Button title="Personal" onPress={() => handleFilter("Personal")} />
              <Button
                title="Close"
                onPress={() => setFilterModalVisible(false)}
                color="red"
              />
            </View>
          </View>
        </Modal>
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
    addButton: {
      backgroundColor: "#A4D337",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    addButtonText: {
      color: "white",
      fontWeight: "bold",
    },
    filterButton: {
      padding: 10,
    },
    filterIcon: {
      width: 25,
      height: 25,
    },
    taskList: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    taskItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    taskLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    taskCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "#D8BFD8",
      marginRight: 10,
    },
    taskTitle: {
      fontSize: 16,
    },
    taskRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkIcon: {
      width: 20,
      height: 20,
    },
    unchecked: {
      width: 20,
      height: 20,
      backgroundColor: "red",
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    pageButton: {
      color: "#A4D337",
      fontWeight: "bold",
    },
    pageNumber: {
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      width: "80%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
  });
  
export default Warehouse;

import React, { useLayoutEffect, useState, useCallback } from "react";
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
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Fontisto from "@expo/vector-icons/Fontisto";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const { width } = Dimensions.get("window");

const Projects = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTaskList, setFilteredTaskList] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  // Fetch projects data from AsyncStorage whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadProjects = async () => {
        try {
          const storedProjects = await AsyncStorage.getItem("projects");
          if (storedProjects) {
            const parsedProjects = JSON.parse(storedProjects);
            console.log("Projects data retrieved from AsyncStorage:", parsedProjects);
            setTaskList(parsedProjects);
          }
        } catch (error) {
          console.error("Error loading projects data:", error);
        }
      };

      loadProjects();
    }, [])
  );

  const toggleTaskCompletion = (taskId) => {
    setTaskList((prevTaskList) =>
      prevTaskList.map((task) =>
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
    const filteredData = taskList.filter((task) =>
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

    const filteredData = taskList.filter(
      (task) =>
        selectedCategories.includes(task.category) || task.category === category
    );
    setTaskList(filteredData);
  };

  const clearSelection = () => {
    setSelectedCategories([]);
    setTaskList(taskList); // Reset task list to original data
    setFilterModalVisible(false); // Optionally close the modal when clearing selection
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("TasksItemInfo", { taskId: item.id, project: item,})}
    >
      <View style={styles.taskItem}>
        <View style={styles.taskLeft}>
          <View style={styles.taskCircle}></View>
          <Text style={styles.taskTitle}>{item.name}</Text>
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
        <Text style={styles.screenName}>PROJECTS</Text>
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
          placeholder="Search Project"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddItemToProject")}
        >
          <Text style={styles.addButtonText}>Add Project</Text>
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
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[
                  styles.button,
                  selectedCategories.includes("Work") && styles.selectedButton,
                ]}
                onPress={() => handleFilter("Work")}
              >
                <Text style={styles.buttonText}>Work</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[
                  styles.button,
                  selectedCategories.includes("Personal") &&
                    styles.selectedButton,
                ]}
                onPress={() => handleFilter("Personal")}
              >
                <Text style={styles.buttonText}>Personal</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSelection}
              >
                <Text style={styles.clearButtonText}>Clear Selection</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
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
  buttonWrapper: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    flex: 1,
    padding: 15,
    backgroundColor: "#A4D337",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  clearButton: {
    padding: 15,
    backgroundColor: "black", // Clear button color
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#A4D337", // Clear button text color
    fontSize: 16,
  },
  selectedButton: {
    backgroundColor: "#8DBA30", // Darker green for selected button
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  indicator: {
    marginLeft: 10,
    color: "#A4D337",
    fontSize: 18,
  },
  closeButton: {
    padding: 15,
    backgroundColor: "black",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#A4D337",
    fontSize: 16,
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
    paddingVertical: 20,
    borderBottomWidth: 3,
    borderBottomColor: "black",
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#A4D337",
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

export default Projects;

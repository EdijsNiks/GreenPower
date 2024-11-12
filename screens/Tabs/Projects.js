import React, {
  useLayoutEffect,
  useState,
  useCallback,
  useEffect,
} from "react";
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
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FilterModalWarehouse from "../../components/FilterModalWarehouse";

const { width } = Dimensions.get("window");

const Projects = () => {
  const navigation = useNavigation();
  const [taskList, setTaskList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTaskList, setFilteredTaskList] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]); // Categories loaded from AsyncStorage
  const [originalTaskList, setOriginalTaskList] = useState([]);

  const tasksPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem("categoriesProjects");
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadProjects = async () => {
        try {
          const storedProjects = await AsyncStorage.getItem("projects");
          if (storedProjects) {
            const parsedProjects = JSON.parse(storedProjects);
            console.log(
              "Projects data retrieved from AsyncStorage:",
              parsedProjects
            );
            setTaskList(parsedProjects);
            setOriginalTaskList(parsedProjects); // Set the original task list
          }
        } catch (error) {
          console.error("Error loading projects data:", error);
        }
      };

      loadProjects();
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleSearch = (text) => {
    setSearchQuery(text);

    if (text === "") {
      setFilteredTaskList(taskList);
    } else {
      const filteredData = taskList.filter((task) =>
        task.name ? task.name.toLowerCase().includes(text.toLowerCase()) : false
      );
      setFilteredTaskList(filteredData);
    }
  };
  const handleCategoryFilter = (categories) => {
    setSelectedCategories(categories);
    let filteredData = [];
    if (categories.length > 0) {
      filteredData = originalTaskList.filter((task) =>
        categories.includes(task.category)
      );
    } else {
      filteredData = originalTaskList; // Reset if no categories selected
    }
    setTaskList(filteredData);

    if (searchQuery === "") {
      setFilteredTaskList(filteredData);
    } else {
      const searchFilteredData = filteredData.filter((task) =>
        task.name
          ? task.name.toLowerCase().includes(searchQuery.toLowerCase())
          : false
      );
      setFilteredTaskList(searchFilteredData);
    }
    setFilterModalVisible(false);
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ProjectsInfo", { taskId: item.id, project: item })
      }
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
  const currentPageData = (searchQuery ? filteredTaskList : taskList).slice(
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
        <Text style={styles.profileText}></Text>
      </View>

      {/* Search, Filter, and Add Project */}
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
        data={currentPageData}
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
      <FilterModalWarehouse
        isVisible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        categories={categories} // Display loaded categories
        selectedCategories={selectedCategories}
        handleFilter={handleCategoryFilter}
        clearSelection={() => {
          setSelectedCategories([]);
          setTaskList(originalTaskList); // Use the original task list
          setFilteredTaskList(originalTaskList); // Reset the filtered task list
          setFilterModalVisible(false);
        }}
      />
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

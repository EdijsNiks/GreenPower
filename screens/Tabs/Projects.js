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
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FilterModalWarehouse from "../../components/FilterModalWarehouse";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const Projects = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute();

  const [taskList, setTaskList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTaskList, setFilteredTaskList] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tempSelectedCategories, setTempSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [originalTaskList, setOriginalTaskList] = useState([]);

  const tasksPerPage = 6;

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

  const fetchProjectsFromDB = async () => {
    try {
      const response = await fetch("http://192.168.8.101:8080/api/project");
      if (!response.ok) throw new Error("Failed to fetch projects");

      const projects = await response.json();
      const sortedProjects = projects.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      await AsyncStorage.removeItem("projects");
      await AsyncStorage.setItem("projects", JSON.stringify(sortedProjects));

      setTaskList(sortedProjects);
      setOriginalTaskList(sortedProjects);
      
      // Apply existing filters when refreshing projects
      applyFilters(sortedProjects, searchQuery, selectedCategories);
    } catch (error) {
      console.error("Error fetching projects:", error);

      try {
        const storedProjects = await AsyncStorage.getItem("projects");
        if (storedProjects) {
          const parsedProjects = JSON.parse(storedProjects);
          setTaskList(parsedProjects);
          setOriginalTaskList(parsedProjects);
          
          // Apply existing filters when loading from storage
          applyFilters(parsedProjects, searchQuery, selectedCategories);
        }
      } catch (storageError) {
        console.error("Error reading AsyncStorage:", storageError);
      }
    }
  };

  // New function to centralize filtering logic
  const applyFilters = (projects, query, categories) => {
    let filteredData = projects;

    // Apply category filter
    if (categories.length > 0) {
      filteredData = filteredData.filter((task) =>
        categories.some((category) => task.category === category)
      );
    }

    // Apply search query filter
    if (query) {
      filteredData = filteredData.filter(
        (task) =>
          task.name && task.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredTaskList(filteredData);
    setCurrentPage(1);
  };

  useFocusEffect(
    useCallback(() => {
      const shouldRefresh = route.params?.shouldRefreshProjects;

      if (shouldRefresh) {
        navigation.setParams({ shouldRefreshProjects: false });
        fetchProjectsFromDB();
      } else {
        const loadProjects = async () => {
          try {
            const storedProjects = await AsyncStorage.getItem("projects");
            if (storedProjects) {
              const parsedProjects = JSON.parse(storedProjects);
              setTaskList(parsedProjects);
              setOriginalTaskList(parsedProjects);
              
              // Apply existing filters when loading projects
              applyFilters(parsedProjects, searchQuery, selectedCategories);
            } else {
              fetchProjectsFromDB();
            }
          } catch (error) {
            console.error("Error loading projects:", error);
            fetchProjectsFromDB();
          }
        };
        loadProjects();
      }
    }, [route.params?.shouldRefreshProjects, searchQuery, selectedCategories])
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(originalTaskList, text, selectedCategories);
  };

  const handleCategoryFilter = (selectedCategory) => {
    const newSelectedCategories = selectedCategories.includes(selectedCategory)
      ? selectedCategories.filter((cat) => cat !== selectedCategory)
      : [...selectedCategories, selectedCategory];

    setSelectedCategories(newSelectedCategories);
    setTempSelectedCategories(newSelectedCategories);

    applyFilters(originalTaskList, searchQuery, newSelectedCategories);
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

  const totalPages = Math.ceil(filteredTaskList.length / tasksPerPage);
  const currentPageData = filteredTaskList.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  const clearSelection = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setFilteredTaskList(originalTaskList);
    setFilterModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>{t("Projects")}</Text>
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
          placeholder={t("searchProject")}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddItemToProject")}
        >
          <Text style={styles.addButtonText}>{t("addProject")}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={currentPageData}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.taskList}
      />
      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={currentPage === 1}
          onPress={() => setCurrentPage((prev) => prev - 1)}
        >
          <Text style={styles.pageButton}>{t("prev")}</Text>
        </TouchableOpacity>
        <Text style={styles.pageNumber}>
          {t("page")} {currentPage} {t("of")} {totalPages}
        </Text>
        <TouchableOpacity
          disabled={currentPage === totalPages}
          onPress={() => setCurrentPage((prev) => prev + 1)}
        >
          <Text style={styles.pageButton}>{t("next")}</Text>
        </TouchableOpacity>
      </View>
      <FilterModalWarehouse
        isVisible={isFilterModalVisible}
        screenType="projects"
        onClose={() => setFilterModalVisible(false)}
        categories={categories}
        selectedCategories={selectedCategories}
        handleFilter={handleCategoryFilter}
        updateCategories={setCategories}
        clearSelection={clearSelection}
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

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width } = Dimensions.get("window");
import "react-native-get-random-values"; // Polyfill for random values
import { v4 as uuidv4 } from "uuid";
import { Picker } from "@react-native-picker/picker"; // Import picker for dropdown
import { LinearGradient } from "expo-linear-gradient";


const AddItemToProject = () => {
  const navigation = useNavigation();

  // States for input fields
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [reserved, setReserved] = useState([]);
  const [categories, setCategories] = useState([]); // State to store fetched categories


  const generateUniqueId = () => uuidv4();

  useEffect(() => {
    //  saveDefaultCategories(); // Save default categories on mount
      fetchCategories(); // Fetch categories from AsyncStorage on mount
    }, []);

    // Fetch categories from AsyncStorage
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

  // Handle Save
  const handleSaveProject = async () => {
    if (!projectName || !description) {
      Alert.alert("Error", "Please enter both project name and description.");
      return;
    }

    try {
      // Process photos to save to file system if needed
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const localUri = await savePhotoToFileSystem(photo.uri);
          return { uri: localUri };
        })
      );

      const newProject = {
        id: generateUniqueId(),
        name: projectName,
        description: description,
        photos: processedPhotos,
        category: categoryName,
        finished: isFinished,
        reserved: reserved,
        dateCreated: new Date().toLocaleString(),
      };

      const storedProjects = await AsyncStorage.getItem("projects");
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      projects.push(newProject);
      await AsyncStorage.setItem("projects", JSON.stringify(projects));
      console.log(projects);
      Alert.alert("Success", "Project saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            setProjectName("");
            setDescription("");
            setCategoryName("");
            setReserved(false);
            setPhotos([]);

            navigation.navigate("Main", {
              screen: "Projects",
              params: { newProject },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving project:", error);
      Alert.alert("Error", "There was an issue saving the project.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>Add Project</Text>
      </View>

      <ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Project Name"
            value={projectName}
            onChangeText={setProjectName}
          />

          <TextInput
            style={styles.textArea}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />         
           <View style={styles.lineSeparator}></View>
          <View
            style={[
              styles.dropdownContainer,
              categoryName && { borderColor: "green" }, // Apply green border if category is selected
            ]}
          >
            <Picker
              selectedValue={categoryName}
              onValueChange={(value) => setCategoryName(value)}
              style={styles.dropdown}
            >
              <Picker.Item label="Select a Category - >" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.photoGallery}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photo}>
              <Text>{photo.uri}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProject}
          >
            <Text style={styles.buttonText}>Save Project</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  inputContainer: {
    marginTop: 150,
    paddingHorizontal: 20,
    
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 2,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    fontSize: 16,
    borderWidth: 2,
  },
  photosSection: {
    padding: 20,
  },
  photosTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addPhotoButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  photoGallery: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  photo: {
    width: 100,
    height: 100,
    backgroundColor: "lightgray",
    marginRight: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  backButton: {
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  dropdownContainer: {
    borderWidth: 2,
    padding: 5,
    marginBottom: 5,
    borderRadius: 10, // Add rounded corners to the dropdown containers
  },
  lineSeparator: {
    height: 10,
  },
  });

export default AddItemToProject;

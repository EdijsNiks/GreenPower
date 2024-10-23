import React, { useState } from "react";
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

const AddItemToProject = () => {
  const navigation = useNavigation();

  // States for input fields
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);

  // Handle Save
  const handleSaveProject = async () => {
    if (!projectName || !description) {
      Alert.alert("Error", "Please enter both project name and description.");
      return;
    }

    const newProject = {
      name: projectName,
      description: description,
      photos: photos,
      dateCreated: new Date().toLocaleString(),
    };

    try {
      const storedProjects = await AsyncStorage.getItem("projects");
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      projects.push(newProject);
      await AsyncStorage.setItem("projects", JSON.stringify(projects));
      
      Alert.alert("Success", "Project saved successfully!");
      console.log("Project saved:", newProject);
      
      // Optionally, clear input fields after saving
      setProjectName("");
      setDescription("");
      setPhotos([]);
    } catch (error) {
      console.error("Error saving project:", error);
      Alert.alert("Error", "There was an issue saving the project.");
    }
  };

  // Add photo logic (stubbed for now)
  const handleAddPhoto = () => {
    // For now, just simulate adding a photo as text
    setPhotos([...photos, `Photo ${photos.length + 1}`]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>Add Project</Text>
      </View>

      <ScrollView>
        {/* Input Fields */}
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
            multiline={true}
            numberOfLines={4}
          />
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <View style={styles.photoRow}>
            <Text style={styles.photosTitle}>PHOTOS</Text>
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
              <Text style={styles.buttonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Display added photos */}
          <View style={styles.photoGallery}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photo}>
                <Text>{photo}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProject}>
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
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    fontSize: 16,
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
});

export default AddItemToProject;

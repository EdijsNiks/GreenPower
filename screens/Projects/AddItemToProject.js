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
import { useTranslation } from "react-i18next";

const AddItemToProject = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // Initialize translation

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [reserved, setReserved] = useState([]);
  const [categories, setCategories] = useState([]);

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

  const handleSaveProject = async () => {
    // Validate required fields
    if (!projectName || !description) {
      Alert.alert(t("errorTitle"), t("errorMessage"));
      return;
    }
  
    try {
      // Process photos
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const localUri = await savePhotoToFileSystem(photo.uri);
          return { uri: localUri };
        })
      );
  
      // Create new project object
      const newProject = {
        id: uuidv4(),
        name: projectName,
        description,
        photos: processedPhotos,
        category: categoryName,
        finished: isFinished,
        reserved,
        dateCreated: new Date().toLocaleString(),
      };
  
      // Send item to API
      const response = await fetch("http://192.168.8.101:5000/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("saveError"));
      }
  
      // Show success alert and navigate
      Alert.alert(t("successTitle"), t("successMessage"), [
        {
          text: t("ok"),
          onPress: () => {
            // Reset form fields
            setProjectName("");
            setDescription("");
            setCategoryName("");
            setReserved([]);
            setPhotos([]);
  
            // Navigate to Projects screen with a flag to fetch new data
            navigation.navigate("Main", {
              screen: "Projects",
              params: { shouldRefreshProjects: true },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving project:", error);
      Alert.alert(t("errorTitle"), error.message || t("saveError"));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>{t("title")}</Text>
      </View>

      <ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("projectNamePlaceholder")}
            value={projectName}
            onChangeText={setProjectName}
          />

          <TextInput
            style={styles.textArea}
            placeholder={t("descriptionPlaceholder")}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <View style={styles.lineSeparator}></View>
          <View
            style={[
              styles.dropdownContainer,
              categoryName && { borderColor: "green" },
            ]}
          >
            <Picker
              selectedValue={categoryName}
              onValueChange={(value) => setCategoryName(value)}
              style={styles.dropdown}
            >
              <Picker.Item label={t("selectCategory")} value="" />
              {categories.map((cat) => (
                <Picker.Item
                  key={cat.id || cat.name}
                  label={cat.name}
                  value={cat.name}
                />
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
            <Text style={styles.buttonText}>{t("goBack")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProject}
          >
            <Text style={styles.buttonText}>{t("saveProject")}</Text>
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

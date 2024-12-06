import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  TextInput,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import PhotoPicker from "../../components/PhotoPicker";
import { v4 as uuidv4 } from "uuid";
import { Picker } from "@react-native-picker/picker"; // Import picker for dropdown
import { useTranslation } from "react-i18next";
import axios from "axios";

const { width } = Dimensions.get("window");

const AddItemToWarehouse = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [count, setCount] = useState("");
  const [reserved, setReserved] = useState([]);
  const [category, setCategory] = useState("");
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]); // State to store fetched categories

  useEffect(() => {
    //saveDefaultCategories(); // Save default categories on mount
    fetchCategories(); // Fetch categories from AsyncStorage on mount
  }, []);

  // Save default categories to AsyncStorage if they don't exist
  /*  const saveDefaultCategories = async () => {
    const defaultCategories = ["SCREWS", "BOLTS", "METAL SHEETS", "ETC"];
    try {
      const storedCategories = await AsyncStorage.getItem("categories");
      if (!storedCategories) {
        await AsyncStorage.setItem(
          "categories",
          JSON.stringify(defaultCategories)
        );
      }
    } catch (error) {
      console.error("Error saving default categories:", error);
    }
  };
*/

  // Fetch categories from AsyncStorage
  const fetchCategories = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem("categories");
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const savePhotoToFileSystem = async (uri) => {
    try {
      if (uri.startsWith("file://")) {
        return uri;
      }

      const fileName = uri.split("/").pop();
      const localUri = FileSystem.documentDirectory + fileName;

      const { uri: localFileUri } = await FileSystem.downloadAsync(
        uri,
        localUri
      );
      return localFileUri;
    } catch (error) {
      console.error("Error saving photo:", error);
      return uri;
    }
  };

  const generateUniqueId = () => uuidv4();

  const handleSaveItem = async () => {
    // Validate required fields
    if (!itemName || !description || !count || !category) {
      Alert.alert(t("error"), t("missingFields"));
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

      // Create new item object
      const newItem = {
        id: generateUniqueId(),
        name: itemName,
        description: description,
        count: parseInt(count, 10),
        reserved: reserved,
        category: category,
        photos: processedPhotos,
      };

      // Log the item being sent
      console.log("Sending item:", newItem);

      // Send item to API using fetch
      const response = await fetch("http://192.168.8.101:5000/api/warehouse/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        // If response is not ok, throw an error
        const errorData = await response.json();
        throw new Error(errorData.message || t("saveError"));
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);

      // Update local storage
      const storedItems = await AsyncStorage.getItem("items");
      const items = storedItems ? JSON.parse(storedItems) : [];
      items.push(responseData); // Adding the new item from the response
      await AsyncStorage.setItem("items", JSON.stringify(items));

      // Show success alert and reset form
      Alert.alert(t("success"), t("itemSaved"), [
        {
          text: "OK",
          onPress: () => {
            // Reset form fields
            setItemName("");
            setDescription("");
            setCount("");
            setReserved([]);
            setCategory("");
            setPhotos([]);

            // Navigate back to warehouse
            navigation.navigate("Main", {
              screen: "Warehouse",
              params: { newItem },
            });
          },
        },
      ]);
    } catch (error) {
      // Centralized error handling
      console.error("Error saving item:", error);

      // Check if it's an error with fetch
      if (error.message) {
        // Show error based on fetch request failure
        Alert.alert(t("error"), error.message);
      } else {
        // For other errors
        Alert.alert(t("error"), t("saveError"));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>{t("add_item")}</Text>
      </View>

      <ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("itemName")}
            value={itemName}
            onChangeText={setItemName}
          />
          <TextInput
            style={styles.input}
            placeholder={t("description")}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={styles.input}
            placeholder={t("count")}
            value={count}
            onChangeText={setCount}
            keyboardType="numeric"
          />
          <View
            style={[
              styles.dropdownContainer,
              category && { borderColor: "green" }, // Apply green border if category is selected
            ]}
          >
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
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
        <PhotoPicker
          photos={photos}
          onPhotosChange={setPhotos}
          containerStyle={styles.photosSection}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>{t("goBack")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
            <Text style={styles.buttonText}>{t("saveItem")}</Text>
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
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonReserved: {
    backgroundColor: "green",
  },
  buttonNotReserved: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  dropdownContainer: {
    borderWidth: 2,
    padding: 5,
    marginBottom: 5,
    borderRadius: 10, // Add rounded corners to the dropdown container
  },
});

export default AddItemToWarehouse;

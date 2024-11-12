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

const { width } = Dimensions.get("window");

const AddItemToWarehouse = () => {
  const navigation = useNavigation();
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [count, setCount] = useState("");
  const [reserved, setReserved] = useState([]);
  const [category, setCategory] = useState("");
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]); // State to store fetched categories

  useEffect(() => {
  //  saveDefaultCategories(); // Save default categories on mount
    fetchCategories(); // Fetch categories from AsyncStorage on mount
  }, []);

  // Save default categories to AsyncStorage if they don't exist
  /*const saveDefaultCategories = async () => {
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
    if (!itemName || !description || !count || !category) {
      Alert.alert("Error", "Please enter all required fields.");
      return;
    }

    try {
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const localUri = await savePhotoToFileSystem(photo.uri);
          return { uri: localUri };
        })
      );

      const newItem = {
        id: generateUniqueId(),
        name: itemName,
        description: description,
        count: parseInt(count, 10),
        reserved: reserved,
        category: category,
        photos: processedPhotos,
        dateCreated: new Date().toLocaleString(),
      };

      const storedItems = await AsyncStorage.getItem("items");
      const items = storedItems ? JSON.parse(storedItems) : [];
      items.push(newItem);
      await AsyncStorage.setItem("items", JSON.stringify(items));

      Alert.alert("Success", "Item saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            setItemName("");
            setDescription("");
            setCount("");
            setReserved([]);
            setCategory("");
            setPhotos([]);
            navigation.navigate("Main", {
              screen: "Warehouse",
              params: { newItem },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving item:", error);
      Alert.alert("Error", "There was an issue saving the item.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>Add Item</Text>
      </View>

      <ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Item Name"
            value={itemName}
            onChangeText={setItemName}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={styles.input}
            placeholder="Count"
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
              <Picker.Item label="Select a Category - >" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
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
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
            <Text style={styles.buttonText}>Save Item</Text>
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

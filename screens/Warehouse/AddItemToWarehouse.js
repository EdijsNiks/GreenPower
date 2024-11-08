import React, { useState } from "react";
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

const { width } = Dimensions.get("window");

const AddItemToWarehouse = () => {
  const navigation = useNavigation();
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);

  // Define savePhotoToFileSystem before using it
const savePhotoToFileSystem = async (uri) => {
  try {
    if (uri.startsWith("file://")) {
      return uri;
    }

    const fileName = uri.split("/").pop();
    const localUri = FileSystem.documentDirectory + fileName;

    const { uri: localFileUri } = await FileSystem.downloadAsync(uri, localUri);
    return localFileUri;
  } catch (error) {
    console.error("Error saving photo:", error);
    return uri;
  }
};

  const handleSaveItem = async () => {
    if (!itemName || !description) {
      Alert.alert("Error", "Please enter both item name and description.");
      return;
    }
  
    try {
      // Save photos to the local file system and store their paths
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const localUri = await savePhotoToFileSystem(photo.uri);
          return { uri: localUri };
        })
      );
  
      const newItem = {
        id: Date.now().toString(),
        name: itemName,
        description,
        photos: processedPhotos,
        dateCreated: new Date().toLocaleString(),
      };
  
      // Save to AsyncStorage
      const storedItems = await AsyncStorage.getItem("items");
      const items = storedItems ? JSON.parse(storedItems) : [];
      items.push(newItem);
      await AsyncStorage.setItem("items", JSON.stringify(items));
  
      console.log("Item saved successfully:", newItem);
  
      // Pass the new item back using navigation.setParams
      Alert.alert("Success", "Item saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            console.log("Navigating back with new item...");
            setItemName("");
            setDescription("");
            setPhotos([]);
            navigation.navigate("Main", { screen: "Warehouse", params: { newItem } }) // Navigate back to the previous screen
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
            style={styles.textArea}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
          />
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
    marginRight: 10,
    marginBottom: 10,
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

export default AddItemToWarehouse;

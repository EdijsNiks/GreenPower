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
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const AddSpotToWarehouse = () => {
  const navigation = useNavigation();
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [reservedItems, setReservedItems] = useState([]);
  const [warehouseItems, setWarehouseItems] = useState([]); // Replace this with your actual data source
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Save item with reserved items
  const handleSaveItem = async () => {
    if (!itemName || !description) {
      Alert.alert("Error", "Please enter both item name and description.");
      return;
    }

    try {
      Alert.alert("Processing", "Saving item and processing images...");
      const processedPhotos = await cacheAndSaveImages();

      const newItem = {
        id: Date.now().toString(),
        name: itemName,
        description,
        photos: processedPhotos.map((photo) => photo.base64),
        dateCreated: new Date().toLocaleString(),
        reservedItems,
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
            setPhotos([]);
            setReservedItems([]);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving item:", error);
      Alert.alert("Error", "There was an issue saving the item.");
    }
  };

  // Function to add item to reserved items
  const handleAddToReserved = (item) => {
    setReservedItems((prevItems) => [...prevItems, item]);
  };

  // Function to remove item from reserved items
  const handleRemoveFromReserved = (itemId) => {
    setReservedItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
  };

  // Filter warehouse items based on search text
  const filteredItems = warehouseItems.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderWarehouseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.warehouseItemInfo}
      onPress={() => handleAddToReserved(item)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderReservedItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFromReserved(item.id)}
      >
        <Text style={styles.buttonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>Add Spot</Text>
      </View>

      <ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Spot ID"
            value={itemName}
            onChangeText={setItemName}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />

          {/* Search warehouse items */}
          <TextInput
            style={styles.input}
            placeholder="Search warehouse items"
            value={searchText}
            onChangeText={setSearchText}
          />

          {/* Display the filtered warehouse items */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderWarehouseItem}
            ListEmptyComponent={<Text>No items found</Text>}
          />

          {/* Display reserved items */}
          <Text style={styles.sectionTitle}>Reserved Items:</Text>
          <FlatList
            data={reservedItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReservedItem}
            ListEmptyComponent={<Text>No items added</Text>}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
            <Text style={styles.buttonText}>Save Spot</Text>
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

export default AddSpotToWarehouse;

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const AddItemToWarehouse = () => {
  const navigation = useNavigation();

  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState('');
  const [addPhotos, setAddPhotos] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [warehouseItem, setWarehouseItem] = useState(null);

  const handleAddItem = () => {
    // Create item object
    const newItem = {
      name: itemName,
      count: itemCount,
      photos: addPhotos ? photos : [],
    };

    // Save the item in the component state
    setWarehouseItem(newItem);

    // Clear input fields for new entry
    setItemName('');
    setItemCount('');
    setAddPhotos(false);
    setPhotos([]);

    // Optionally, display a success message or handle the saved item further
    console.log('Item saved:', newItem);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>Add Warehouse Item</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.formContainer}>
          {/* Name Input */}
          <Text style={styles.label}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter item name"
            value={itemName}
            onChangeText={setItemName}
          />

          {/* Count Input */}
          <Text style={styles.label}>Item Count</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter item count"
            value={itemCount}
            onChangeText={setItemCount}
            keyboardType="numeric"
          />

          {/* Photo Section */}
          <Text style={styles.label}>Do you want to add photos?</Text>
          <View style={styles.photoOptionRow}>
            <TouchableOpacity
              style={styles.photoOptionButton}
              onPress={() => setAddPhotos(!addPhotos)}
            >
              <Text style={styles.buttonText}>
                {addPhotos ? "Remove Photos" : "Add Photos"}
              </Text>
            </TouchableOpacity>
          </View>

          {addPhotos && (
            <View style={styles.addPhotoSection}>
              <TouchableOpacity style={styles.addPhotoButton}>
                <Text style={styles.buttonText}>Add Photo</Text>
              </TouchableOpacity>
              {/* Photo placeholder or actual photo components can be added here */}
            </View>
          )}

          {/* Add Item Button */}
          <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
            <Text style={styles.buttonText}>Add Item to Warehouse</Text>
          </TouchableOpacity>

          {/* Display Saved Item */}
          {warehouseItem && (
            <View style={styles.savedItemContainer}>
              <Text style={styles.savedItemTitle}>Saved Item:</Text>
              <Text>Name: {warehouseItem.name}</Text>
              <Text>Count: {warehouseItem.count}</Text>
              <Text>Photos: {warehouseItem.photos.length > 0 ? "Yes" : "No"}</Text>
            </View>
          )}
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
  backButton: {
    marginTop: 130, // Adjusted to position after the navbar
    marginLeft: 20,
    backgroundColor: "#A4D337",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: 100, // Customize width as needed
  },
  formContainer: {
    marginTop: 20, // Adjusted to fit after back button
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  photoOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  photoOptionButton: {
    backgroundColor: "#A4D337",
    padding: 10,
    borderRadius: 5,
  },
  addPhotoSection: {
    marginVertical: 20,
  },
  addPhotoButton: {
    backgroundColor: "#A4D337",
    padding: 10,
    borderRadius: 5,
    alignSelf: "center",
  },
  addItemButton: {
    backgroundColor: "#A4D337",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  savedItemContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#e0f7fa",
    borderRadius: 5,
  },
  savedItemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default AddItemToWarehouse;



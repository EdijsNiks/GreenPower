import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../styles/WarehouseItemInfoStyles.js";
import { mockData } from "../../mockData.js";

const WarehouseItemInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemData } = route.params;
  const [itemDetails, setItemDetails] = useState(itemData); // Store the received item data in state
  const [item, setItem] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    setItemDetails(itemData); // Update itemDetails when itemData changes();
  }, [itemData]);
  /*
  // Mimic API call to fetch data from mockData
  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
      setTaskList(mockData.warehouse); // Set data from mockData
    };

    fetchData();
  }, []);

  const loadItemData = async () => {
    try {
      // Get all items from storage
      const storedItems = await AsyncStorage.getItem("items");
      const items = storedItems ? JSON.parse(storedItems) : [];

      // Find the current item
      const currentItem = items.find((item) => item.id === itemId);

      if (currentItem) {
        setItem(currentItem);

        // Process photos if they exist
        if (currentItem.photos && currentItem.photos.length > 0) {
          const processedPhotos = currentItem.photos.map((photo) => ({
            uri: `data:image/jpeg;base64,${photo.base64}`,
            cached: photo.uri, // Store the cached URI for reference
          }));
          setPhotos(processedPhotos);
        }
      } else {
        Alert.alert("Error", "Item not found");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading item data:", error);
      Alert.alert("Error", "Failed to load item data");
    }
  };
*/
  const handleAddPhoto = () => {
    // This could be implemented later for editing functionality
    Alert.alert("Info", "Edit mode required to add photos");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>Item Info</Text>
      </View>

      <ScrollView>
        <View style={styles.itemInfoContainer}>
          <Text style={styles.itemName}>
            NAME: {itemDetails?.name || "N/A"}
          </Text>
          <Text style={styles.itemDetails}>
            Category: {itemDetails?.category || "N/A"}
          </Text>
          <Text style={styles.itemDetails}>
            Count: {itemDetails?.count || "N/A"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Item Description</Text>
        <Text style={styles.descriptionText}>
          {itemDetails?.description || "No description available"}
        </Text>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <View style={styles.photoRow}>
            <Text style={styles.photosTitle}>Photos</Text>
            <TouchableOpacity
              style={[styles.addPhotoButton, { opacity: 0.5 }]} // Dimmed to indicate disabled state
              onPress={handleAddPhoto}
            >
              <Text style={styles.buttonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
          {/* Photo Gallery */}
          <View style={styles.photoGallery}>
            {itemDetails?.photos && itemDetails.photos.length > 0 ? (
              itemDetails.photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                </View>
              ))
            ) : (
              <Text style={styles.noPhotosText}>No photos available</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("Main", { screen: "Warehouse" })}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              Alert.alert("Info", "Edit functionality coming soon")
            }
          >
            <Text style={styles.buttonText}>Edit Info</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WarehouseItemInfo;

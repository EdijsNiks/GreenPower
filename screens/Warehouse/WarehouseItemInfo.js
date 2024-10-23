import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from '../../styles/WarehouseItemInfoStyles.js';

const WarehouseItemInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemId } = route.params; // Assuming we're passing 'itemId' to retrieve item details

  // Static task details (you can later fetch this data using the itemId)
  const item = {
    name: "Item Name",
    category: "Item Category",
    description: "Item description goes here...",
    count: 10,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>Item Info</Text>
      </View>

      <ScrollView>
        {/* Item Info Section */}
        <View style={styles.itemInfoContainer}>
          <Text style={styles.itemName}>NAME: {item.name}</Text>
          <Text style={styles.itemDetails}>Category: {item.category}</Text>
          <Text style={styles.itemDetails}>Count: {item.count}</Text>
        </View>

        {/* Item Description */}
        <Text style={styles.sectionTitle}>Item Description</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <View style={styles.photoRow}>
            <Text style={styles.photosTitle}>Photos</Text>
            <TouchableOpacity style={styles.addPhotoButton}>
              <Text style={styles.buttonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Display photos */}
          <View style={styles.photoGallery}>
            <View style={styles.photo}></View>
            <View style={styles.photo}></View>
            <View style={styles.photo}></View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("Main", { screen: "Warehouse" })}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.buttonText}>Edit Info</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WarehouseItemInfo;

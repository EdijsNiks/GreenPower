import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

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
        <Text style={styles.screenName}>Warehouse Item</Text>
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
    marginLeft: width * 0.10,
  },
  itemInfoContainer: {
    marginTop: 100,
    paddingHorizontal: 20,
    backgroundColor: "#A4D337",
    paddingVertical: 20,
    borderRadius: 5,
  },
  itemName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemDetails: {
    fontSize: 18,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  photosSection: {
    paddingHorizontal: 20,
  },
  photosTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  addPhotoButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  photoGallery: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  photo: {
    width: 100,
    height: 100,
    backgroundColor: "lightgray",
    marginRight: 10,
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
  editButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default WarehouseItemInfo;

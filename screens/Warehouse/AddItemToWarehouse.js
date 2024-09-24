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
import { TextInput } from "react-native-web";

const { width } = Dimensions.get("window");

const AddItemToWarehouse = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params; // Get the task ID from the route params

  // Fetch task details using taskId (static data for now)
  const task = {
    name: "Task Name",
    category: "Task Category",
    creator: "Jeff",
    date: "03.09.2024 09:40",
    description: "Task description here...",
  };
  

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}

      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>Add Task Item</Text>
      </View>

        <View
          style={styles.backButtonContainer}
        >
        </View>
      <ScrollView>
        {/* Task Info Section */}
        <View style={styles.taskInfo}>
          <TextInput style={styles.infoText}>NAME: {task.name}</TextInput>
          <TextInput style={styles.infoText}>Category: {task.category}</TextInput>
          <TextInput style={styles.infoText}>
            Created by: {task.creator} at {task.date}
          </TextInput>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.finishButton}>
            <Text style={styles.buttonText} onPress={() => navigation.navigate("Main", {screen: "Warehouse"})}>Go back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.buttonText}>Edit Info</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.finishButton}>
            <Text style={styles.buttonText}>Finish Task</Text>
          </TouchableOpacity>
        </View>

        {/* Task Description */}
        <Text style={styles.description}>TASK DESCRIPTION</Text>
        <Text style={styles.descriptionText}>{task.description}</Text>

        {/* Photos Section */}
        <View style={styles.photosSection}>
        <View style={styles.photoRow}>
          <Text style={styles.photosTitle}>PHOTOS</Text>
          <TouchableOpacity style={styles.addPhotoButton}>
            <Text style={styles.buttonText}>Add Photo</Text>
          </TouchableOpacity>
          </View>
          <View style={styles.photoGallery}>
            <View style={styles.photo}></View>
            <View style={styles.photo}></View>
            <View style={styles.photo}></View>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A4D337",
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  backButton: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 10,
  },
  logo: {
    width: 60,
    height: 40,
  },
  screenName: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 20,
  },
  taskInfo: {
    padding: 20,
    backgroundColor: "#A4D337",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,

  },
  editButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  finishButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  description: {
    fontSize: 18,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
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
  photoGallery: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  photo: {
    width: 100,
    height: 100,
    backgroundColor: "lightgray",
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
  backButtonContainer: {
    padding: 25,
    alignItems: 'center',
    marginBottom: 50,
  },
});

export default AddItemToWarehouse;
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

const { width } = Dimensions.get("window");

const TasksItemInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params;  // Get the task ID from the route params

  // Fetch task details using taskId (static data for now)
  const task = {
    name: "Task Name",
    category: "Task Category",
    creator: "Jeff",
    date: "03.09.2024 09:40",
    description: "Task description here...",
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← BACK</Text>
        </TouchableOpacity>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>TASKS</Text>
      </View>

      {/* Task Info Section */}
      <View style={styles.taskInfo}>
        <Text style={styles.infoText}>NAME: {task.name}</Text>
        <Text style={styles.infoText}>Category: {task.category}</Text>
        <Text style={styles.infoText}>
          Created by: {task.creator} at {task.date}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.buttonText}>Edit Info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishButton}>
          <Text style={styles.buttonText}>Finish Task</Text>
        </TouchableOpacity>
      </View>

      {/* Task Description */}
      <Text style={styles.description}>TASK DESCRIPTION</Text>
      <Text>{task.description}</Text>

      {/* Photos Section */}
      <View style={styles.photosSection}>
        <Text style={styles.photosTitle}>PHOTOS</Text>
        <TouchableOpacity style={styles.addPhotoButton}>
          <Text style={styles.buttonText}>Add Photo</Text>
        </TouchableOpacity>
        <View style={styles.photoGallery}>
          <View style={styles.photo}></View>
          <View style={styles.photo}></View>
          <View style={styles.photo}></View>
        </View>
      </View>
    </ScrollView>
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
    justifyContent: "space-around",
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
});

export default TasksItemInfo;

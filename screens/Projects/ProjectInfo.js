import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import ReservedItemsModal from "../../components/ReservedItems";
import PhotoPicker from "../../components/PhotoPicker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const ProjectsInfo = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute();
  const { project, taskId } = route.params; // Get project data from route params
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photos, setPhotos] = useState([]);

  // Save photo to local filesystem
  /*  const handleSavePhoto = async () => {
    if (photos.length > 0) {
      try {
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const localUri = await savePhotoToFileSystem(photo.uri);
          return { uri: localUri };
        })
      );
      const newItem = {
        ...project,
        photos: processedPhotos,
      };
        // Save updated project to AsyncStorage
        try {
          await AsyncStorage.setItem(
            `project_${project.id}`,
            JSON.stringify(newItem)
          );
        } catch (error) {
          console.error("Error updating AsyncStorage:", error);
        }

        // Update the project object state for real-time updates
        project.photos = processedPhotos;

        // Clear local photos state and close modal
        setPhotos([]);
        setModalVisible(false);

        Alert.alert("Success", "Photos saved successfully!");
      } catch (error) {
        console.error("Error saving photos:", error);
        Alert.alert("Error", "Failed to save photos.");
      }
    } else {
      Alert.alert("No Photos", "Please select some photos before saving.");
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
*/
  const handleDeleteProject = async () => {
    Alert.alert(t("deleteButton"), t("deleteConfirm"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Remove project from AsyncStorage
            await AsyncStorage.removeItem(`project_${project.id}`);

            // 2. Update projects list
            const projectsJson = await AsyncStorage.getItem("projects");
            if (projectsJson) {
              const projects = JSON.parse(projectsJson);
              const updatedProjects = projects.filter(
                (p) => p.id !== project.id
              );
              await AsyncStorage.setItem(
                "projects",
                JSON.stringify(updatedProjects)
              );
            }

            // 3. Clean up warehouse items' reserved arrays
            const warehouseItemsJson = await AsyncStorage.getItem("items");
            if (warehouseItemsJson) {
              const warehouseItems = JSON.parse(warehouseItemsJson);

              // Remove the project ID from all items' reserved arrays
              const updatedWarehouseItems = warehouseItems.map((item) => {
                if (item.reserved && Array.isArray(item.reserved)) {
                  return {
                    ...item,
                    reserved: item.reserved.filter((id) => id !== project.id),
                  };
                }
                return item;
              });

              // Save updated warehouse items
              await AsyncStorage.setItem(
                "items",
                JSON.stringify(updatedWarehouseItems)
              );
            }

            // 4. Navigate back to projects screen
            navigation.navigate("Main", { screen: "Projects" });
          } catch (error) {
            console.error("Error deleting project:", error);
            Alert.alert("Error", t("failedToDeleteProject"));
          }
        },
      },
    ]);
  };

  // Render project details if project exists
  if (!project) {
    return <Text>No project data available</Text>;
  }

  // Static data for reserved items based on the newItem model
  const [reservedItems, setReservedItems] = useState([]);

  // Static data for unreserved warehouse items
  const warehouseItems = [];

  const onAdd = (item) => {
    const reservedItem = { ...item, projectId: project.id };
    setReservedItems([...reservedItems, reservedItem]);
  };

  const onRemove = (itemId) => {
    setReservedItems(reservedItems.filter((item) => item.id !== itemId));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>PROJECT INFO</Text>
      </View>

      <View style={styles.backButtonContainer}></View>
      <ScrollView>
        {/* Project Info Section */}
        <View style={styles.projectInfo}>
          <Text style={styles.infoText}>{t("name")}: {project.name}</Text>
          <Text style={styles.infoText}>{t("category")}: {project.category}</Text>
          <Text style={styles.infoText}>{t("createdAt")}: {project.dateCreated}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteProject}
          >
            <Text style={styles.buttonText}>{t("deleteButton")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.paddingBetweenSection}></View>

        {/* Reserved Item Info Section */}
        <View style={styles.reservedItemsSection}>
          <Text style={styles.sectionTitle}>{t("reservedItems")}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>{t("viewReservedItems")}</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.finishButtonBack}
            onPress={() => navigation.navigate("Main", { screen: "Projects" })}
          >
            <Text style={styles.buttonText}>{t("back")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.buttonText}>{t("editProject")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.finishButton}>
            <Text style={styles.buttonText}>{t("finishProject")}</Text>
          </TouchableOpacity>
        </View>

        {/* Project Description */}
        <Text style={styles.description}>{t("descriptionProject")}</Text>
        <Text style={styles.descriptionText}>{project.description}</Text>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <PhotoPicker
            photos={photos}
            onPhotosChange={setPhotos}
            containerStyle={styles.photosSection}
          />
          <View style={styles.photoGallery}>
            {project.photos?.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.photo} />
            ))}
          </View>
          {photos.length > 0 && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePhoto}
            >
              <Text style={styles.buttonText}>{t("savePhotos")}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Modal for Reserved Items */}
        <ReservedItemsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          reservedItems={reservedItems}
          warehouseItems={warehouseItems}
          onAdd={onAdd}
          onRemove={onRemove}
          navigation={navigation}
          taskId={project.id}
        />
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
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  finishButtonBack: {
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 10,
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
    alignItems: "center",
    marginBottom: 50,
  },
  paddingBetweenSection: {
    padding: 5,
    alignItems: "center",
  },
  reservedItemsSection: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  projectInfo: {
    paddingHorizontal: 20,
    backgroundColor: "#A4D337",
    paddingVertical: 20,
    borderRadius: 5,
  },
  photosSection: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default ProjectsInfo;

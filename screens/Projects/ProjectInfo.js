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
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import ReservedItemsModal from "../../components/ReservedItems";
import PhotoPicker from "../../components/PhotoPicker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const API_BASE_URL = "http://192.168.8.101:8080/api/project";

import TranslatableText from "../../components/Language/translatableText";


const ProjectsInfo = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute();
  const { project, taskId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedDescription, setUpdatedDescription] = useState(
    project.description || ""
  );
  const [projectData, setProjectData] = useState(project);
  const [tempPhotos, setTempPhotos] = useState([]);
  const [projectPhotos, setProjectPhotos] = useState(project.photos || []);

  const handleSaveDescription = async () => {
    try {
      // Update project data in the backend
      const response = await fetch(`${API_BASE_URL}/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: updatedDescription }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project description.");
      }

      const updatedProject = await response.json();

      // Update local state and AsyncStorage
      setProjectData(updatedProject);

      const projectsJson = await AsyncStorage.getItem("projects");
      if (projectsJson) {
        const projects = JSON.parse(projectsJson);
        const updatedProjects = projects.map((p) =>
          p.id === project.id ? updatedProject : p
        );
        await AsyncStorage.setItem("projects", JSON.stringify(updatedProjects));
      }

      await AsyncStorage.setItem(
        `project_${project.id}`,
        JSON.stringify(updatedProject)
      );

      setIsEditing(false);
      Alert.alert(t("success"), t("descriptionUpdatedSuccessfully"));
    } catch (error) {
      console.error("Error updating description:", error);
      Alert.alert(t("error"), t("failedToUpdateDescription"));
    }
  };

  // Save photo to local filesystem and update project
  const handleSavePhoto = async () => {
    if (tempPhotos.length > 0) {
      try {
        const processedPhotos = await Promise.all(
          tempPhotos.map(async (photo) => {
            const localUri = await savePhotoToFileSystem(photo.uri);
            return { uri: localUri };
          })
        );

        // Ensure projectPhotos is always an array
        const currentProjectPhotos = projectPhotos || [];

        // Combine existing and new unique photos
        const updatedPhotos = [
          ...currentProjectPhotos,
          ...processedPhotos.filter(
            (newPhoto) =>
              !currentProjectPhotos.some(
                (existingPhoto) => existingPhoto?.uri === newPhoto.uri
              )
          ),
        ];

        const newItem = {
          ...project,
          photos: updatedPhotos,
        };

        // Save updated project to AsyncStorage
        try {
          const newPhotoUrls = tempPhotos.map((photo) => photo.uri);
          console.log(newPhotoUrls);

          const response = await fetch(`${API_BASE_URL}/${project.id}/photos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPhotos: newPhotoUrls }),
          });

          if (!response.ok) {
            throw new Error("Failed to add photos to the project.");
          }

          await AsyncStorage.setItem(
            `project_${project.id}`,
            JSON.stringify(newItem)
          );

          // Update projects list in AsyncStorage
          const projectsJson = await AsyncStorage.getItem("projects");
          if (projectsJson) {
            const projects = JSON.parse(projectsJson);
            const updatedProjects = projects.map((p) =>
              p.id === project.id ? newItem : p
            );
            await AsyncStorage.setItem(
              "projects",
              JSON.stringify(updatedProjects)
            );
          }

          // Update local state and reset temporary photos
          setProjectPhotos(updatedPhotos);
          setTempPhotos([]);

          Alert.alert("Success", "Photos saved successfully!");
        } catch (error) {
          console.error("Error updating AsyncStorage:", error);
          Alert.alert("Error", "Failed to update project photos.");
        }
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

  // Handle full-screen photo view
  const handleImagePress = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeFullScreen = () => {
    setSelectedPhoto(null);
  };
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
            const response = await fetch(`${API_BASE_URL}/${project.id}`, {
              method: "DELETE",
            });

            if (!response.ok) {
              throw new Error("Failed to delete the project.");
            }
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
    return <TranslatableText>No project data available</TranslatableText>;
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
        <Text style={styles.screenName}>{t("infoProject")}</Text>
      </View>

      <View style={styles.backButtonContainer}></View>
      <ScrollView>
        {/* Project Info Section */}
        <View style={styles.projectInfo}>
          <Text style={styles.infoText}>
            {t("name")}: 
            <TranslatableText style={styles.infoText} text={project.name} fallbackText={project.name} />
          </Text>
          <Text style={styles.infoText}>
            {t("category")}: 
            <TranslatableText style={styles.infoText} text={project.category} fallbackText={project.category} />
          </Text>
          <Text style={styles.infoText}>
            {t("createdAt")}: {project.createdAt}
          </Text>
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
          {/* Description Edit/Save Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={
              isEditing ? handleSaveDescription : () => setIsEditing(true)
            }
          >
            <Text style={styles.buttonText}>
              {isEditing ? t("save") : t("editDescription")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.finishButton}>
            <Text style={styles.buttonText}>{t("finishProject")}</Text>
          </TouchableOpacity>
        </View>

        {/* Project Description Section with Edit Functionality */}
        <Text style={styles.sectionTitle}>{t("descriptionProject")}</Text>
        <View style={styles.descriptionContainer}>
          {isEditing ? (
            <TextInput
              style={styles.descriptionInput}
              value={updatedDescription}
              onChangeText={setUpdatedDescription}
              multiline
              placeholder={t("enterDescription")}
            />
          ) : (
            <TranslatableText
              style={styles.descriptionText}
              text={project.description}
              fallbackText={project.description}
            /> || t("noDescription")
          )}
        </View>
        {/* Photos Section */}
        <View style={styles.photosSection}>
          <PhotoPicker
            photos={tempPhotos}
            onPhotosChange={setTempPhotos}
            containerStyle={styles.photosSection}
          />
          <View style={styles.photoGalleryContainer}>
            <View style={styles.photoGallery}>
              {Array.isArray(projectPhotos) &&
                projectPhotos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleImagePress(photo)}
                    style={styles.photoWrapper}
                  >
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {tempPhotos.length > 0 && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePhoto}
            >
              <Text style={styles.buttonText}>{t("savePhotos")}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Full Screen Photo Modal */}
        {selectedPhoto && (
          <Modal
            visible={!!selectedPhoto}
            transparent={true}
            animationType="fade"
            onRequestClose={closeFullScreen}
          >
            <View style={styles.modalBackground}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeFullScreen}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            </View>
          </Modal>
        )}

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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#A4D337",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  descriptionContainer: {
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 15,
  },

  descriptionInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },

  editDescriptionButton: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 15,
    marginBottom: 15,
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginVertical: 10,
  },
  photoGalleryContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  photoGallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  photoWrapper: {
    width: "30%", // Ensures 3 photos per row with some spacing
    aspectRatio: 1, // Makes photos square
    marginBottom: 10,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 8, // Optional: adds rounded corners
  },
});

export default ProjectsInfo;

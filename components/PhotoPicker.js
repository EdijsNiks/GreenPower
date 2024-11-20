import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next"; // Import translation hook

const PhotoPicker = ({ photos, onPhotosChange, containerStyle }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { t } = useTranslation(); // Initialize translation hook

  const requestPermissions = async (source) => {
    let permissionResult;

    if (source === "camera") {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult.granted) {
      Alert.alert(
        t("permissionTitle"),
        t("permissionMessage", {
          source: source === "camera" ? t("camera") : t("gallery"),
        })
      );
      return false;
    }
    return true;
  };

  const handleImagePress = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeFullScreen = () => {
    setSelectedPhoto(null);
  };

  const removePhoto = (indexToRemove) => {
    const newPhotos = photos.filter((_, index) => index !== indexToRemove);
    onPhotosChange(newPhotos);
  };

  const pickImage = async (source) => {
    const hasPermission = await requestPermissions(source);
    if (!hasPermission) return;

    try {
      let result;
      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0].uri) {
        onPhotosChange([...photos, { uri: result.assets[0].uri }]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t("errorTitle"), t("errorMessage"));
    }
  };

  const handleAddPhoto = () => {
    Alert.alert(
      t("addPhotoTitle"),
      t("addPhotoMessage"),
      [
        { text: t("takePhoto"), onPress: () => pickImage("camera") },
        { text: t("chooseLibrary"), onPress: () => pickImage("gallery") },
        { text: t("cancel"), style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.photoRow}>
        <Text style={styles.photosTitle}>{t("photosTitle")}</Text>
        <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
          <Text style={styles.buttonText}>{t("addPhoto")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.photoGallery}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <TouchableOpacity onPress={() => handleImagePress(photo)}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removePhoto(index)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {selectedPhoto && (
        <Modal
          visible={!!selectedPhoto}
          transparent={true}
          animationType="fade"
          onRequestClose={closeFullScreen}
        >
          <View style={styles.modalBackground}>
            <TouchableOpacity style={styles.closeButton} onPress={closeFullScreen}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: selectedPhoto.uri }}
              style={styles.fullScreenImage}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 1,
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 10,
  },
  photosTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addPhotoButton: {
    backgroundColor: "#A4D337",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 3, // Adds space between the input and the sides of the container

  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  photoGallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoContainer: {
    position: "relative",
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  deleteButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "red",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 22,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  fullScreenImage: {
    width: "90%",
    height: "80%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#A4D337",
    padding: 10,
    borderRadius: 50,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PhotoPicker;

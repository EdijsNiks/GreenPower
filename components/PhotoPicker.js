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

const PhotoPicker = ({ photos, onPhotosChange, containerStyle }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Track the selected image

  const requestPermissions = async (source) => {
    let permissionResult;

    if (source === "camera") {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        `Please enable permissions for ${
          source === "camera" ? "camera" : "gallery"
        } in your device settings.`
      );
      return false;
    }
    return true;
  };
  const handleImagePress = (photo) => {
    setSelectedPhoto(photo); // Set the selected photo to show in full screen
  };

  const closeFullScreen = () => {
    setSelectedPhoto(null); // Close full screen mode
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
      Alert.alert("Error", "Could not process the image. Please try again.");
    }
  };

  const handleAddPhoto = () => {
    Alert.alert(
      "Add Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: () => pickImage("camera") },
        { text: "Choose from Library", onPress: () => pickImage("gallery") },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.photoRow}>
        <Text style={styles.photosTitle}>PHOTOS</Text>
        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={handleAddPhoto}
        >
          <Text style={styles.buttonText}>Add Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.photoGallery}>
        {photos.map((photo, index) => (
          <TouchableOpacity key={index} onPress={() => handleImagePress(photo)}>
            <Image
              key={index}
              source={{ uri: photo.uri }}
              style={styles.photo}
            />
          </TouchableOpacity>
        ))}
      </View>
      {/* Modal for Full-Screen Image */}
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
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
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

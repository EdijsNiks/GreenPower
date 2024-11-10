import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../styles/WarehouseItemInfoStyles.js";

const WarehouseItemInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemData } = route.params;

  // State management
  const [itemDetails, setItemDetails] = useState(itemData);
  const [showReserveSection, setShowReserveSection] = useState(false);
  const [reservedCount, setReservedCount] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [availableCount, setAvailableCount] = useState(itemData.count || 0);
  const [projectReservations, setProjectReservations] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [projects, setProjects] = useState([]);

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadItemData = async () => {
        try {
          const [storedItems, storedProjects] = await Promise.all([
            AsyncStorage.getItem("items"),
            AsyncStorage.getItem("projects"),
          ]);

          if (storedItems) {
            const allItems = JSON.parse(storedItems);
            const currentItem = allItems.find((item) => item.id === itemData.id);
            if (currentItem) {
              setItemDetails(currentItem);
              setAvailableCount(currentItem.count);
            }
          }

          if (storedProjects) {
            const projectsData = JSON.parse(storedProjects);
            setProjects(projectsData);

            const reservations = projectsData.reduce((acc, project) => {
              const reservation = project.reserved?.find(
                (item) => item.itemId === itemData.id
              );
              if (reservation) {
                acc.push({
                  projectId: project.id,
                  projectTitle: project.name,
                  count: parseInt(reservation.count),
                });
              }
              return acc;
            }, []);

            setProjectReservations(reservations);

            const totalReserved = reservations.reduce(
              (sum, res) => sum + res.count,
              0
            );

            if (itemDetails?.count) {
              setAvailableCount(itemDetails.count - totalReserved);
            }
          }
        } catch (error) {
          console.error("Error loading item data:", error);
          Alert.alert("Error", "Failed to load item data");
        }
      };

      loadItemData();
    }, [itemData.id])
  );

  // Handle updates from route params
  useEffect(() => {
    if (route?.params?.updatedItem) {
      const updateItem = async () => {
        try {
          const storedItems = await AsyncStorage.getItem("items");
          if (storedItems) {
            const items = JSON.parse(storedItems);
            const updatedItems = items.map((item) =>
              item.id === route.params.updatedItem.id
                ? route.params.updatedItem
                : item
            );

            await AsyncStorage.setItem("items", JSON.stringify(updatedItems));
            const updatedItem = updatedItems.find(
              (item) => item.id === itemData.id
            );
            if (updatedItem) {
              setItemDetails(updatedItem);
              setAvailableCount(updatedItem.count);
            }
          }
        } catch (error) {
          console.error("Error updating item:", error);
          Alert.alert("Error", "Failed to update item");
        }
      };

      updateItem();
    }
  }, [route?.params?.updatedItem]);

  const handleReserveItem = async () => {
    if (!reservedCount || !selectedProject) {
      Alert.alert("Error", "Please select a project and enter reserved count.");
      return;
    }

    const reserveAmount = parseInt(reservedCount);
    if (isNaN(reserveAmount) || reserveAmount <= 0) {
      Alert.alert("Error", "Please enter a valid number greater than 0.");
      return;
    }

    if (reserveAmount > availableCount) {
      Alert.alert("Error", "Cannot reserve more items than available.");
      return;
    }

    try {
      const updatedProjects = projects.map((project) => {
        if (project.id === selectedProject.id) {
          const existingReservation = project.reserved?.find(
            (item) => item.itemId === itemDetails.id
          );

          if (existingReservation) {
            const newReserved = project.reserved.map((item) =>
              item.itemId === itemDetails.id
                ? { ...item, count: parseInt(item.count) + reserveAmount }
                : item
            );
            return { ...project, reserved: newReserved };
          }

          const newReserved = [
            ...(project.reserved || []),
            {
              itemId: itemDetails.id,
              name: itemDetails.name,
              count: reserveAmount,
            },
          ];
          return { ...project, reserved: newReserved };
        }
        return project;
      });

      // Calculate total reservations
      const totalReserved = updatedProjects.reduce((sum, project) => {
        const reservation = project.reserved?.find(
          (item) => item.itemId === itemDetails.id
        );
        return sum + (reservation ? parseInt(reservation.count) : 0);
      }, 0);

      // Update AsyncStorage
      await Promise.all([
        AsyncStorage.setItem("projects", JSON.stringify(updatedProjects)),
        AsyncStorage.setItem(
          `item_${itemDetails.id}`,
          JSON.stringify({
            ...itemDetails,
            isReserved: totalReserved > 0,
          })
        ),
      ]);

      // Update state
      setProjects(updatedProjects);
      setReservedCount("");
      setSelectedProject(null);
      setShowReserveSection(false);
      setAvailableCount(itemDetails.count - totalReserved);

      Alert.alert("Success", "Item reserved successfully!");
    } catch (error) {
      console.error("Error in handleReserveItem:", error);
      Alert.alert("Error", "Failed to reserve item");
    }
  };

  const handleClearProjectReservation = async (projectId) => {
    Alert.alert(
      "Clear Reservation",
      "Are you sure you want to clear this project's reservation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedProjects = projects.map((project) => {
                if (project.id === projectId) {
                  return {
                    ...project,
                    reserved: (project.reserved || []).filter(
                      (item) => item.itemId !== itemDetails.id
                    ),
                  };
                }
                return project;
              });

              const totalReserved = updatedProjects.reduce((sum, project) => {
                const reservation = project.reserved?.find(
                  (item) => item.itemId === itemDetails.id
                );
                return sum + (reservation ? parseInt(reservation.count) : 0);
              }, 0);

              await Promise.all([
                AsyncStorage.setItem("projects", JSON.stringify(updatedProjects)),
                AsyncStorage.setItem(
                  `item_${itemDetails.id}`,
                  JSON.stringify({
                    ...itemDetails,
                    isReserved: totalReserved > 0,
                  })
                ),
              ]);

              setProjects(updatedProjects);
              setAvailableCount(itemDetails.count - totalReserved);
              Alert.alert("Success", "Reservation cleared successfully!");
            } catch (error) {
              console.error("Error clearing reservation:", error);
              Alert.alert("Error", "Failed to clear reservation");
            }
          },
        },
      ]
    );
  };

  const handleImagePress = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeFullScreen = () => {
    setSelectedPhoto(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>Item Info</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Item Info Section */}
        <View style={styles.itemInfoContainer}>
          <Text style={styles.itemName}>
            NAME: {itemDetails?.name || "N/A"}
          </Text>
          <Text style={styles.itemDetails}>
            Category: {itemDetails?.category || "N/A"}
          </Text>
          <Text style={styles.itemDetails}>
            Total Count: {itemDetails?.count || "N/A"}
          </Text>
          <Text style={styles.itemDetails}>
            Available Count: {availableCount || "N/A"}
          </Text>
          
          {projectReservations.length > 0 && (
            <View style={styles.reservationsContainer}>
              <Text style={styles.reservationsTitle}>Reserved By:</Text>
              {projectReservations.map((reservation) => (
                <View
                  key={reservation.projectId}
                  style={styles.reservationItem}
                >
                  <Text style={styles.reservationText}>
                    {reservation.projectTitle}: {reservation.count} items
                  </Text>
                  <TouchableOpacity
                    style={styles.clearReservationButton}
                    onPress={() =>
                      handleClearProjectReservation(reservation.projectId)
                    }
                  >
                    <Text style={styles.clearReservationText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Item Description</Text>
        <Text style={styles.descriptionText}>
          {itemDetails?.description || "No description available"}
        </Text>

        {/* Photos Section */}
        <View style={styles.photosSectionHeader}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={() =>
              Alert.alert("Info", "Add photos functionality coming soon")
            }
          >
            <Text style={styles.buttonText}>Add Photos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.photoGallery}>
          {itemDetails?.photos && itemDetails.photos.length > 0 ? (
            itemDetails.photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <TouchableOpacity onPress={() => handleImagePress(photo)}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noPhotosText}>No photos available</Text>
          )}
        </View>

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

        {/* Action Buttons */}
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
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowReserveSection(!showReserveSection)}
          >
            <Text style={styles.buttonText}>Reserve Item</Text>
          </TouchableOpacity>
        </View>

        {/* Reserve Section */}
        {showReserveSection && (
          <View style={styles.reserveSection}>
            <Text style={styles.reserveTitle}>Select Project</Text>
            <View style={styles.projectsContainer}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.projectItem,
                    selectedProject?.id === project.id &&
                      styles.selectedProject,
                  ]}
                  onPress={() => setSelectedProject(project)}
                >
                  <Text
                    style={[
                      styles.projectText,
                      selectedProject?.id === project.id &&
                        styles.selectedProjectText,
                    ]}
                  >
                    {project.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.reserveTitle}>Enter Quantity</Text>
            <TextInput
              style={styles.quantityInput}
              placeholder="Enter quantity to reserve"
              value={reservedCount}
              onChangeText={setReservedCount}
              keyboardType="numeric"
            />

            {selectedProject && reservedCount ? (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleReserveItem}
              >
                <Text style={styles.buttonText}>Save Reservation</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.saveButtonDisabled}>
                <Text style={styles.buttonTextDisabled}>
                  Select project and enter quantity
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WarehouseItemInfo;

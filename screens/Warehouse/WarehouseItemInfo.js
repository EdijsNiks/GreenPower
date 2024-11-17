import React, { useState } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../styles/WarehouseItemInfoStyles.js";

const WarehouseItemInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemData } = route.params;

  // Local state management
  const [itemDetails, setItemDetails] = useState(itemData);
  const [showReserveSection, setShowReserveSection] = useState(false);
  const [reservedCount, setReservedCount] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [reservedProjectIds, setReservedProjectIds] = useState([]);
  const [reservationCount, setReservationCount] = useState(0); // New state variable

  const getProjectReservations = () => {
    return projects.reduce((acc, project) => {
      const reservation = project.reserved?.find(
        (item) => item.itemId === itemDetails.id
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
  };

  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem("projects");
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects);

        const initialReservedIds = parsedProjects.reduce((acc, project) => {
          const hasReservation = project.reserved?.some(
            (item) => item.itemId === itemDetails.id
          );
          if (hasReservation) {
            acc.push(project.id);
          }
          return acc;
        }, []);
        setReservedProjectIds(initialReservedIds);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      Alert.alert("Error", "Failed to load projects");
    }
  };

  const getTotalReservedForItem = (itemId, projectsData) => {
    return projectsData.reduce((sum, project) => {
      const reservation = project.reserved?.find(
        (item) => item.itemId === itemId
      );
      return sum + (reservation ? parseInt(reservation.count) : 0);
    }, 0);
  };

  const getAvailableCount = () => {
    const totalReserved = getTotalReservedForItem(itemDetails.id, projects);
    return itemDetails.count - totalReserved;
  };
  const handleDeleteItem = async () => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Check if item is reserved by any projects
              const hasReservations = getProjectReservations().length > 0;

              if (hasReservations) {
                Alert.alert(
                  "Error",
                  "Cannot delete item that is reserved by projects. Please clear all reservations first."
                );
                return;
              }

              // Get all warehouse items
              const warehouseItemsJson = await AsyncStorage.getItem("items");
              if (warehouseItemsJson) {
                const warehouseItems = JSON.parse(warehouseItemsJson);
                // Filter out the deleted item
                const updatedItems = warehouseItems.filter(
                  (item) => item.id !== itemDetails.id
                );
                // Save updated items list
                await AsyncStorage.setItem(
                  "items",
                  JSON.stringify(updatedItems)
                );
              }

              // Navigate back to warehouse screen
              navigation.navigate("Main", {
                screen: "Warehouse",
                params: {
                  deletedItemId: itemDetails.id,
                },
              });
            } catch (error) {
              console.error("Error deleting item:", error);
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
  };

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

    const projectReservation = projects
      .find((project) => project.id === selectedProject.id)
      ?.reserved?.find((item) => item.itemId === itemDetails.id);

    const existingReservedCount = projectReservation
      ? parseInt(projectReservation.count)
      : 0;

    if (reserveAmount >= itemDetails.count) {
      Alert.alert("Error", "Cannot reserve more items than available.");
      return;
    }

    try {
      const updatedProjects = projects.map((project) => {
        if (project.id === selectedProject.id) {
          const existingReservation = project.reserved?.find(
            (item) => item.itemId === itemDetails.id
          );
          let newReserved;
          if (existingReservation) {
            newReserved = project.reserved.map((item) =>
              item.itemId === itemDetails.id
                ? { ...item, count: parseInt(item.count) + reserveAmount }
                : item
            );
          } else {
            newReserved = [
              ...(project.reserved || []),
              {
                itemId: itemDetails.id,
                name: itemDetails.name,
                count: reserveAmount,
                projectId: project.id,
              },
            ];
          }
          return { ...project, reserved: newReserved };
        }
        return project;
      });

      await AsyncStorage.setItem("projects", JSON.stringify(updatedProjects));
      setProjects(updatedProjects);

      // Update reservedProjectIds to include selectedProject.id as an array
      const updatedReservedIds = [
        ...new Set([...reservedProjectIds, selectedProject.id]),
      ];
      setReservedProjectIds(updatedReservedIds);

      const updatedItem = {
        ...itemDetails,
        count: itemDetails.count - reserveAmount,
        reserved: updatedReservedIds, // Update reserved as an array of project IDs
      };
      setItemDetails(updatedItem);

      setReservedCount("");
      setSelectedProject(null);
      setShowReserveSection(false);

      Alert.alert("Success", "Item reserved successfully!");
    } catch (error) {
      console.error("Error in handleReserveItem:", error);
      Alert.alert("Error", "Failed to reserve item");
    }
  };

  const handleClearProjectReservation = async (projectId) => {
    Alert.alert("Clear Reservation", "What do you want to do?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Subtract reserved amount",
        style: "default",
        onPress: async () => {
          try {
            // Find the project and its reservation
            const projectToUpdate = projects.find(
              (project) => project.id === projectId
            );
            const reservation = projectToUpdate.reserved?.find(
              (item) => item.itemId === itemDetails.id
            );
            const reservedCount = reservation ? parseInt(reservation.count) : 0;

            // Update the projects array by removing the reservation
            const updatedProjects = projects.map((project) => {
              if (project.id === projectId) {
                const updatedReserved = project.reserved.filter(
                  (item) => item.itemId !== itemDetails.id
                );
                return { ...project, reserved: updatedReserved };
              }
              return project;
            });

            // Save updated projects to AsyncStorage
            await AsyncStorage.setItem(
              "projects",
              JSON.stringify(updatedProjects)
            );
            setProjects(updatedProjects);

            // Update reservedProjectIds
            const updatedReservedIds = reservedProjectIds.filter(
              (id) => id !== projectId
            );
            setReservedProjectIds(updatedReservedIds);

            // Update item details - SUBTRACT the reservedCount from the total count
            const updatedItem = {
              ...itemDetails,
              count: Math.max(0, itemDetails.count), // Ensure count doesn't go below 0
              reserved: updatedReservedIds,
            };
            setItemDetails(updatedItem);

            // Update warehouse items in AsyncStorage
            const warehouseItemsJson = await AsyncStorage.getItem(
              "items"
            );
            if (warehouseItemsJson) {
              const warehouseItems = JSON.parse(warehouseItemsJson);
              const updatedWarehouseItems = warehouseItems.map((item) => {
                if (item.id === itemDetails.id) {
                  return updatedItem;
                }
                return item;
              });
              await AsyncStorage.setItem(
                "items",
                JSON.stringify(updatedWarehouseItems)
              );
            }

            Alert.alert(
              "Success",
              "Reservation cleared and amount subtracted from total!"
            );
          } catch (error) {
            console.error("Error clearing reservation:", error);
            Alert.alert("Error", "Failed to clear reservation");
          }
        },
      },
      {
        text: "Add reserved amount back",
        style: "destructive",
        onPress: async () => {
          try {
            // Find the project and its reservation
            const projectToUpdate = projects.find(
              (project) => project.id === projectId
            );
            const reservation = projectToUpdate.reserved?.find(
              (item) => item.itemId === itemDetails.id
            );
            const reservedCount = reservation ? parseInt(reservation.count) : 0;

            // Update the projects array by removing the reservation
            const updatedProjects = projects.map((project) => {
              if (project.id === projectId) {
                const updatedReserved = project.reserved.filter(
                  (item) => item.itemId !== itemDetails.id
                );
                return { ...project, reserved: updatedReserved };
              }
              return project;
            });

            // Save updated projects to AsyncStorage
            await AsyncStorage.setItem(
              "projects",
              JSON.stringify(updatedProjects)
            );
            setProjects(updatedProjects);

            // Update reservedProjectIds
            const updatedReservedIds = reservedProjectIds.filter(
              (id) => id !== projectId
            );
            setReservedProjectIds(updatedReservedIds);

            // Update item details - ADD the reservedCount back to the total count
            const updatedItem = {
              ...itemDetails,
              count: itemDetails.count + reservedCount,
              reserved: updatedReservedIds,
            };
            setItemDetails(updatedItem);

            // Update warehouse items in AsyncStorage
            const warehouseItemsJson = await AsyncStorage.getItem(
              "items"
            );
            if (warehouseItemsJson) {
              const warehouseItems = JSON.parse(warehouseItemsJson);
              const updatedWarehouseItems = warehouseItems.map((item) => {
                if (item.id === itemDetails.id) {
                  return updatedItem;
                }
                return item;
              });
              await AsyncStorage.setItem(
                "items",
                JSON.stringify(updatedWarehouseItems)
              );
            }

            Alert.alert(
              "Success",
              "Reservation cleared and amount added back to total!"
            );
          } catch (error) {
            console.error("Error clearing reservation:", error);
            Alert.alert("Error", "Failed to clear reservation");
          }
        },
      },
    ]);
  };
  const handleGoBack = () => {
    // Pass updated item and reservedProjectIds back to Warehouse screen
    navigation.navigate("Main", {
      screen: "Warehouse",
      params: {
        updatedItem: itemDetails,
      },
    });
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
            Total Count:{" "}
            {itemDetails?.count +
              getTotalReservedForItem(itemDetails.id, projects) || "N/A"}
          </Text>
          <Text style={styles.itemDetails}>
            Available Count: {itemDetails?.count - reservationCount || "0"}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteItem}
          >
            <Text style={styles.buttonText}>Delete Item</Text>
          </TouchableOpacity>

          {getProjectReservations().length > 0 && (
            <View style={styles.reservationsContainer}>
              <Text style={styles.reservationsTitle}>Reserved By:</Text>
              {getProjectReservations().map((reservation) => (
                <View
                  key={reservation.projectId}
                  style={styles.reservationItem}
                >
                  <Text style={styles.reservationText}>
                    {reservation.projectTitle}: {reservation.count} items
                  </Text>
                  <TouchableOpacity
                    style={styles.clearReservationButton}
                    onPress={() => {
                      //setReservationCount(reservation.count);
                      handleClearProjectReservation(reservation.projectId);
                    }}
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
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
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

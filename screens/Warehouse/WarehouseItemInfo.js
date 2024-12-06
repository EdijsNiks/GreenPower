import React, { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";
import PhotoPicker from "../../components/PhotoPicker.js";

const WarehouseItemInfo = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

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
  const [reservationCount, setReservationCount] = useState(0);
  const [updatedDescription, setUpdatedDescription] = useState(
    itemData.description || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [tempPhotos, setTempPhotos] = useState([]);

  const handleSavePhotos = async () => {
    try {
      // Combine existing photos with new ones
      const updatedPhotos = [...(itemDetails.photos || []), ...tempPhotos];
      const updatedItem = { ...itemDetails, photos: updatedPhotos };

      // Update local state
      setItemDetails(updatedItem);

      // Update AsyncStorage
      const warehouseItemsJson = await AsyncStorage.getItem("items");
      if (warehouseItemsJson) {
        const warehouseItems = JSON.parse(warehouseItemsJson);
        const updatedItems = warehouseItems.map((item) =>
          item.id === itemDetails.id ? updatedItem : item
        );
        await AsyncStorage.setItem("items", JSON.stringify(updatedItems));
      }

      // Clear temp photos
      setTempPhotos([]);

      Alert.alert(t("success"), t("photosUpdatedSuccessfully"));
    } catch (error) {
      console.error("Error saving photos:", error);
      Alert.alert(t("error"), t("failedToUpdatePhotos"));
    }
  };

  const getProjectReservations = () => {
    return projects.reduce((acc, project) => {
      // Safely handle reserved array or undefined
      const reservations = Array.isArray(project.reserved)
        ? project.reserved.filter(
            (reservation) =>
              reservation && reservation.itemId === itemDetails.id
          )
        : [];

      reservations.forEach((reservation) => {
        if (reservation) {
          acc.push({
            projectId: project.id,
            projectTitle: project.name,
            count: parseInt(reservation.count || 0),
          });
        }
      });

      return acc;
    }, []);
  };

  const handleSaveDescription = async () => {
    try {
      const updatedItem = { ...itemDetails, description: updatedDescription };
      setItemDetails(updatedItem);

      // Update the item in AsyncStorage
      const warehouseItemsJson = await AsyncStorage.getItem("items");
      if (warehouseItemsJson) {
        const warehouseItems = JSON.parse(warehouseItemsJson);
        const updatedItems = warehouseItems.map((item) =>
          item.id === itemDetails.id ? updatedItem : item
        );
        await AsyncStorage.setItem("items", JSON.stringify(updatedItems));
      }

      setIsEditing(false);
      Alert.alert(t("success"), t("descriptionUpdatedSuccessfully"));
    } catch (error) {
      console.error("Error saving updated description:", error);
      Alert.alert(t("error"), t("failedToUpdateDescription"));
    }
  };

  const loadProjects = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem("projects");
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects).map((project) => ({
          ...project,
          // Ensure reserved is always an array
          reserved: Array.isArray(project.reserved)
            ? project.reserved.filter((r) => r && r.itemId)
            : [],
        }));
        setProjects(parsedProjects);

        // Safely get initial reserved project IDs
        const initialReservedIds = parsedProjects.reduce((acc, project) => {
          const hasReservation =
            Array.isArray(project.reserved) &&
            project.reserved.some(
              (item) => item && item.itemId === itemDetails.id
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
      Alert.alert(t("error"), t("failedToLoadProjects"));
    }
  };

  // Use effect to load projects
  useEffect(() => {
    loadProjects();
  }, []);

  const getTotalReservedForItem = (itemId, projectsData) => {
    return projectsData.reduce((sum, project) => {
      // Safely handle reserved array or undefined
      if (Array.isArray(project.reserved)) {
        const itemReservation = project.reserved.find(
          (item) => item && item.itemId === itemId
        );
        return (
          sum + (itemReservation ? parseInt(itemReservation.count || 0) : 0)
        );
      }
      return sum;
    }, 0);
  };

  const getAvailableCount = () => {
    const totalReserved = getTotalReservedForItem(itemDetails.id, projects);
    return itemDetails.count - totalReserved;
  };

  const handleDeleteItem = async () => {
    Alert.alert(t("deleteItem"), t("deleteItemConfirmation"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            const hasReservations = getProjectReservations().length > 0;

            if (hasReservations) {
              Alert.alert(t("error"), t("cannotDeleteReserved"));
              return;
            }

            const warehouseItemsJson = await AsyncStorage.getItem("items");
            if (warehouseItemsJson) {
              const warehouseItems = JSON.parse(warehouseItemsJson);
              const updatedItems = warehouseItems.filter(
                (item) => item.id !== itemDetails.id
              );
              await AsyncStorage.setItem("items", JSON.stringify(updatedItems));
            }

            navigation.navigate("Main", {
              screen: "Warehouse",
              params: {
                deletedItemId: itemDetails.id,
              },
            });
          } catch (error) {
            console.error("Error deleting item:", error);
            Alert.alert(t("error"), t("failedToDeleteItem"));
          }
        },
      },
    ]);
  };

  const handleReserveItem = async () => {
    if (!reservedCount || !selectedProject) {
      Alert.alert(t("error"), t("selectProjectAndCount"));
      return;
    }

    const reserveAmount = parseInt(reservedCount);
    if (isNaN(reserveAmount) || reserveAmount <= 0) {
      Alert.alert(t("error"), t("enterValidNumber"));
      return;
    }

    // Safely find project reservation
    const projectReservation = (selectedProject.reserved || []).find(
      (item) => item && item.itemId === itemDetails.id
    );

    const existingReservedCount = projectReservation
      ? parseInt(projectReservation.count || 0)
      : 0;

    if (reserveAmount >= itemDetails.count) {
      Alert.alert(t("error"), t("cannotReserveMoreThanAvailable"));
      return;
    }

    try {
      const updatedProjects = projects.map((project) => {
        if (project.id === selectedProject.id) {
          // Ensure reserved is an array
          const currentReserved = Array.isArray(project.reserved)
            ? project.reserved
            : [];

          // Find existing reservation or create new
          const existingReservationIndex = currentReserved.findIndex(
            (item) => item && item.itemId === itemDetails.id
          );

          let newReserved;
          if (existingReservationIndex !== -1) {
            // Update existing reservation
            newReserved = [...currentReserved];
            newReserved[existingReservationIndex] = {
              ...newReserved[existingReservationIndex],
              count:
                parseInt(newReserved[existingReservationIndex].count || 0) +
                reserveAmount,
            };
          } else {
            // Add new reservation
            newReserved = [
              ...currentReserved,
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

      const updatedReservedIds = [
        ...new Set([...reservedProjectIds, selectedProject.id]),
      ];
      setReservedProjectIds(updatedReservedIds);

      const updatedItem = {
        ...itemDetails,
        count: itemDetails.count - reserveAmount,
        reserved: updatedReservedIds,
      };
      setItemDetails(updatedItem);

      setReservedCount("");
      setSelectedProject(null);
      setShowReserveSection(false);

      Alert.alert(t("success"), t("itemReservedSuccessfully"));
    } catch (error) {
      console.error("Error in handleReserveItem:", error);
      Alert.alert(t("error"), t("failedToReserveItem"));
    }
  };
  const handleClearProjectReservation = async (projectId) => {
    Alert.alert(t("clearReservation"), t("whatToDoWithReservation"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("subtractReservedAmount"),
        style: "default",
        onPress: async () => {
          try {
            const projectToUpdate = projects.find(
              (project) => project.id === projectId
            );
            const reservation = projectToUpdate.reserved?.find(
              (item) => item.itemId === itemDetails.id
            );
            const reservedCount = reservation ? parseInt(reservation.count) : 0;

            const updatedProjects = projects.map((project) => {
              if (project.id === projectId) {
                const updatedReserved = project.reserved.filter(
                  (item) => item.itemId !== itemDetails.id
                );
                return { ...project, reserved: updatedReserved };
              }
              return project;
            });

            await AsyncStorage.setItem(
              "projects",
              JSON.stringify(updatedProjects)
            );
            setProjects(updatedProjects);

            const updatedReservedIds = reservedProjectIds.filter(
              (id) => id !== projectId
            );
            setReservedProjectIds(updatedReservedIds);

            const updatedItem = {
              ...itemDetails,
              count: Math.max(0, itemDetails.count),
              reserved: updatedReservedIds,
            };
            setItemDetails(updatedItem);

            const warehouseItemsJson = await AsyncStorage.getItem("items");
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

            Alert.alert(t("success"), t("reservationClearedAndSubtracted"));
          } catch (error) {
            console.error("Error clearing reservation:", error);
            Alert.alert(t("error"), t("failedToClearReservation"));
          }
        },
      },
      {
        text: t("addReservedAmountBack"),
        style: "destructive",
        onPress: async () => {
          try {
            const projectToUpdate = projects.find(
              (project) => project.id === projectId
            );
            const reservation = projectToUpdate.reserved?.find(
              (item) => item.itemId === itemDetails.id
            );
            const reservedCount = reservation ? parseInt(reservation.count) : 0;

            const updatedProjects = projects.map((project) => {
              if (project.id === projectId) {
                const updatedReserved = project.reserved.filter(
                  (item) => item.itemId !== itemDetails.id
                );
                return { ...project, reserved: updatedReserved };
              }
              return project;
            });

            await AsyncStorage.setItem(
              "projects",
              JSON.stringify(updatedProjects)
            );
            setProjects(updatedProjects);

            const updatedReservedIds = reservedProjectIds.filter(
              (id) => id !== projectId
            );
            setReservedProjectIds(updatedReservedIds);

            const updatedItem = {
              ...itemDetails,
              count: itemDetails.count + reservedCount,
              reserved: updatedReservedIds,
            };
            setItemDetails(updatedItem);

            const warehouseItemsJson = await AsyncStorage.getItem("items");
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

            Alert.alert(t("success"), t("reservationClearedAndAdded"));
          } catch (error) {
            console.error("Error clearing reservation:", error);
            Alert.alert(t("error"), t("failedToClearReservation"));
          }
        },
      },
    ]);
  };

  const handleGoBack = () => {
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
        <Text style={styles.screenName}>{t("itemInfo")}</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.itemInfoContainer}>
          <Text style={styles.itemName}>
            {t("name")}: {itemDetails?.name || t("na")}
          </Text>
          <Text style={styles.itemDetails}>
            {t("category")}: {itemDetails?.category || t("na")}
          </Text>
          <Text style={styles.itemDetails}>
            {t("totalCount")}: {itemDetails?.count || t("na")}
          </Text>
          <Text style={styles.itemDetails}>
            {t("reservedCount")}:{" "}
            {getTotalReservedForItem(itemDetails.id, projects) || "0"}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteItem}
          >
            <Text style={styles.buttonText}>{t("deleteItem")}</Text>
          </TouchableOpacity>

          {getProjectReservations().length > 0 && (
            <View style={styles.reservationsContainer}>
              <Text style={styles.reservationsTitle}>{t("reservedBy")}:</Text>
              {getProjectReservations().map((reservation) => (
                <View
                  key={reservation.projectId}
                  style={styles.reservationItem}
                >
                  <Text style={styles.reservationText}>
                    {reservation.projectTitle}: {reservation.count} {t("items")}
                  </Text>
                  <TouchableOpacity
                    style={styles.clearReservationButton}
                    onPress={() => {
                      handleClearProjectReservation(reservation.projectId);
                    }}
                  >
                    <Text style={styles.clearReservationText}>
                      {t("clear")}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>{t("itemDescription")}</Text>
        <View style={styles.editableDescriptionContainer}>
          {isEditing ? (
            <TextInput
              style={styles.editableDescriptionInput}
              value={updatedDescription}
              onChangeText={setUpdatedDescription}
              multiline
            />
          ) : (
            <Text style={styles.descriptionText}>
              {itemDetails?.description || t("noDescriptionAvailable")}
            </Text>
          )}
        </View>

        <View style={styles.photosSection}>
          <PhotoPicker
            photos={tempPhotos}
            onPhotosChange={setTempPhotos}
            containerStyle={styles.photosSection}
          />
          {tempPhotos.length > 0 && (
            <TouchableOpacity
              style={styles.savePhotosButton}
              onPress={handleSavePhotos}
            >
              <Text style={styles.buttonText}>{t("savePhotos")}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.photoGallery}>
          {Array.isArray(itemDetails.photos) &&
          itemDetails.photos.length > 0 ? (
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
            <Text style={styles.noPhotosText}>{t("noPhotosAvailable")}</Text>
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

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.buttonText}>{t("goBack")}</Text>
          </TouchableOpacity>
          {isEditing ? (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveDescription}
            >
              <Text style={styles.buttonText}>{t("save")}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>{t("editInfo")}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowReserveSection(!showReserveSection)}
          >
            <Text style={styles.buttonText}>{t("reserveItem")}</Text>
          </TouchableOpacity>
        </View>

        {showReserveSection && (
          <View style={styles.reserveSection}>
            <Text style={styles.reserveTitle}>{t("selectProject")}</Text>
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

            <Text style={styles.reserveTitle}>{t("enterQuantity")}</Text>
            <TextInput
              style={styles.quantityInput}
              placeholder={t("enterQuantityToReserve")}
              value={reservedCount}
              onChangeText={setReservedCount}
              keyboardType="numeric"
            />

            {selectedProject && reservedCount ? (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleReserveItem}
              >
                <Text style={styles.buttonText}>{t("saveReservation")}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.saveButtonDisabled}>
                <Text style={styles.buttonTextDisabled}>
                  {t("selectProjectAndEnterQuantity")}
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

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
import { useTranslation } from "react-i18next";

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
      Alert.alert(t("error"), t("failedToLoadProjects"));
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

    const projectReservation = projects
      .find((project) => project.id === selectedProject.id)
      ?.reserved?.find((item) => item.itemId === itemDetails.id);

    const existingReservedCount = projectReservation
      ? parseInt(projectReservation.count)
      : 0;

    if (reserveAmount >= itemDetails.count) {
      Alert.alert(t("error"), t("cannotReserveMoreThanAvailable"));
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
            {t("totalCount")}:{" "}
            {itemDetails?.count +
              getTotalReservedForItem(itemDetails.id, projects) || t("na")}
          </Text>
          <Text style={styles.itemDetails}>
            {t("availableCount")}:{" "}
            {itemDetails?.count - reservationCount || "0"}
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
        <Text style={styles.descriptionText}>
          {itemDetails?.description || t("noDescriptionAvailable")}
        </Text>

        <View style={styles.photosSectionHeader}>
          <Text style={styles.sectionTitle}>{t("photos")}</Text>
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={() => Alert.alert(t("info"), t("addPhotosComingSoon"))}
          >
            <Text style={styles.buttonText}>{t("addPhotos")}</Text>
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
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.buttonText}>{t("editInfo")}</Text>
          </TouchableOpacity>
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

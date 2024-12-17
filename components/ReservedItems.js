import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

const ReservedItemsModal = ({ visible, onClose, navigation, taskId }) => {
  const [searchText, setSearchText] = useState("");
  const [reservedItems, setReservedItems] = useState([]);
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [countInputs, setCountInputs] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      loadWarehouseItems();
      loadReservedItems();
      loadProjects();
    }
  }, [visible]);
  const loadProjects = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem("projects");
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadWarehouseItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("items");
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        setWarehouseItems(parsedItems);
      }
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const loadReservedItems = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem("projects");
      const storedItems = await AsyncStorage.getItem("items");

      if (storedProjects && storedItems) {
        const parsedProjects = JSON.parse(storedProjects);
        const parsedItems = JSON.parse(storedItems);

        // Find the current project by taskId
        const currentProject = parsedProjects.find(
          (project) => project.id === taskId
        );

        if (
          currentProject &&
          Array.isArray(currentProject.reserved) &&
          currentProject.reserved.length > 0
        ) {
          // Map each reserved item in the project to its corresponding item in warehouseItems
          const projectReservedItems = currentProject.reserved
            .map((reservedItem) => {
              // Find the matching item in the warehouseItems array
              const matchingWarehouseItem = parsedItems.find(
                (item) => item.id === reservedItem.itemId
              );
              if (matchingWarehouseItem) {
                // Include the reserved count from the project
                return {
                  ...matchingWarehouseItem,
                  reserved: [{ projectId: taskId, count: reservedItem.count }],
                };
              }
              return null; // Filter out items not found in warehouseItems
            })
            .filter((item) => item !== null); // Remove any null values

          setReservedItems(projectReservedItems);
        } else {
          setReservedItems([]); // No reserved items if project has an empty reserved array
        }
      }
    } catch (error) {
      console.error("Error loading reserved items:", error);
    }
  };

  const updateStorage = async (updatedItems, updatedProjects) => {
    try {
      const promises = [];
      if (updatedItems) {
        promises.push(
          AsyncStorage.setItem("items", JSON.stringify(updatedItems))
        );
      }
      if (updatedProjects) {
        promises.push(
          AsyncStorage.setItem("projects", JSON.stringify(updatedProjects))
        );
      }
      await Promise.all(promises);
    } catch (error) {
      console.error("Error updating storage:", error);
    }
  };

  const onAdd = async (item) => {
    // Check if the item is already reserved for this project
    const isAlreadyReserved = item.reserved.some(
      (res) => res.projectId === taskId
    );

    if (isAlreadyReserved) {
      alert(t("alreadyReserved"));
      return;
    }

    // Additional check to ensure the item is not already in reservedItems for this project
    const isItemAlreadyInReserved = reservedItems.some(
      (reservedItem) => reservedItem.id === item.id
    );

    if (isItemAlreadyInReserved) {
      alert(t("cannotAddSameItemTwice")); // Add this translation key to your localization files
      return;
    }

    // Proceed with adding the item if it's not already reserved
    const updatedItem = {
      ...item,
      count: item.count,
      reserved: [...item.reserved, { projectId: taskId, count: 1 }],
    };
    const updatedWarehouseItems = warehouseItems.map((warehouseItem) =>
      warehouseItem.id === item.id ? updatedItem : warehouseItem
    );

    // Update project's reserved items
    const updatedProjects = projects.map((project) => {
      if (project.id === taskId) {
        return {
          ...project,
          reserved: [...project.reserved, { itemId: item.id, count: 1 }],
        };
      }
      return project;
    });

    setReservedItems([...reservedItems, updatedItem]);
    setWarehouseItems(updatedWarehouseItems);
    setProjects(updatedProjects);

    await updateStorage(updatedWarehouseItems, updatedProjects);
  };

  const onRemove = async (itemId) => {
    // Remove the item from reservedItems
    const updatedReservedItems = reservedItems.filter(
      (item) => item.id !== itemId
    );

    // Update the project's reserved items
    const updatedProjects = projects.map((project) => {
      if (project.id === taskId) {
        return {
          ...project,
          reserved: project.reserved.filter((res) => res.itemId !== itemId),
        };
      }
      return project;
    });

    // Update the warehouse items to restore the item's count
    const updatedWarehouseItems = warehouseItems.map((item) => {
      if (item.id === itemId) {
        const totalCountToRestore =
          reservedItems
            .find((reservedItem) => reservedItem.id === itemId)
            ?.reserved.reduce(
              (sum, res) => (res.projectId === taskId ? sum + res.count : sum),
              0
            ) || 0;

        return {
          ...item,
          count: item.count + totalCountToRestore,
          reserved: item.reserved.filter((res) => res.projectId !== taskId),
        };
      }
      return item;
    });

    // Update state and storage
    setReservedItems(updatedReservedItems);
    setProjects(updatedProjects);
    setWarehouseItems(updatedWarehouseItems);

    await updateStorage(updatedWarehouseItems, updatedProjects);
  };


  const getItemCount = (item) => {
    const reservation = item.reserved.find((res) => res.projectId === taskId);
    return reservation ? reservation.count : 0;
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity style={styles.itemInfo}>
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.countText}>
          {t("count")}: {getItemCount(item)}
        </Text>
      </TouchableOpacity>
      <View style={styles.countControls}>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => onRemove(item.id)}>
        <Text style={styles.buttonText}>{t("remove")}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWarehouseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.warehouseItemInfo}
      onPress={() => onAdd(item)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.availableCount}>
        {t("available")}: {item.count}
      </Text>
    </TouchableOpacity>
  );

  // Sort reserved items by project ID
  reservedItems.sort(
    (a, b) =>
      a.reserved.find((res) => res.projectId === taskId).count -
      b.reserved.find((res) => res.projectId === taskId).count
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.section}>
          <Text style={styles.modalTitle}>{t("reservedItems")}</Text>
          <View style={styles.listContainer}>
            <FlatList
              data={reservedItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.modalTitle}>{t("addMoreItems")}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t("searchWarehouseItems")}
            value={searchText}
            onChangeText={setSearchText}
          />
          <View style={styles.listContainer}>
            <FlatList
              data={warehouseItems.filter((item) =>
                item.name.toLowerCase().includes(searchText.toLowerCase())
              )}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderWarehouseItem}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>{t("close")}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  section: {
    flex: 1,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  listContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#A4D337",
  },
  itemInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: "green",
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    margin: 15,
  },
  warehouseItemInfo: {
    padding: 15,
    marginVertical: 5,
    borderColor: "#A4D337",
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: "white",
  },
  countControls: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  countButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  countButtonMinus: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  countText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  availableCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});

export default ReservedItemsModal;

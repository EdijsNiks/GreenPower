import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ReservedItemsModal = ({
  visible,
  onClose,
  navigation,
  taskId, // Current project ID
}) => {
  const [searchText, setSearchText] = useState("");
  const [reservedItems, setReservedItems] = useState([]);
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [projects, setProjects] = useState([]);

  // Load warehouse items, projects and reserved items on modal open
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
      const storedItems = await AsyncStorage.getItem("items");
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        const projectReservedItems = parsedItems.filter((item) =>
          item.reserved.some((res) => res.projectId === taskId)
        );
        setReservedItems(projectReservedItems);
      }
    } catch (error) {
      console.error("Error loading reserved items:", error);
    }
  };

  const updateStorage = async (updatedItems, updatedProjects) => {
    try {
      const promises = [];
      if (updatedItems) {
        promises.push(AsyncStorage.setItem("items", JSON.stringify(updatedItems)));
      }
      if (updatedProjects) {
        promises.push(AsyncStorage.setItem("projects", JSON.stringify(updatedProjects)));
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
      alert("This item is already reserved for this project.");
      return;
    }

    const updatedItem = {
      ...item,
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
    const updatedReservedItems = reservedItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          reserved: item.reserved.filter((res) => res.projectId !== taskId),
        };
      }
      return item;
    });

    // Update project's reserved items
    const updatedProjects = projects.map((project) => {
      if (project.id === taskId) {
        return {
          ...project,
          reserved: project.reserved.filter((res) => res.itemId !== itemId),
        };
      }
      return project;
    });

    setReservedItems(updatedReservedItems);
    setProjects(updatedProjects);

    const updatedWarehouseItems = warehouseItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          reserved: item.reserved.filter((res) => res.projectId !== taskId),
        };
      }
      return item;
    });

    await updateStorage(updatedWarehouseItems, updatedProjects);
  };

  const updateItemCount = async (itemId, increment) => {
    const updatedReservedItems = reservedItems.map((item) => {
      if (item.id === itemId) {
        const updatedReserved = item.reserved.map((res) => {
          if (res.projectId === taskId) {
            const newCount = Math.max(1, res.count + increment); // Ensure count doesn't go below 1
            return { ...res, count: newCount };
          }
          return res;
        });
        return { ...item, reserved: updatedReserved };
      }
      return item;
    });

    // Update project's reserved items
    const updatedProjects = projects.map((project) => {
      if (project.id === taskId) {
        const updatedReserved = project.reserved.map((res) => {
          if (res.itemId === itemId) {
            const newCount = Math.max(1, res.count + increment); // Ensure count doesn't go below 1
            return { ...res, count: newCount };
          }
          return res;
        });
        return { ...project, reserved: updatedReserved };
      }
      return project;
    });

    setReservedItems(updatedReservedItems);
    setProjects(updatedProjects);

    const updatedWarehouseItems = warehouseItems.map((item) => {
      if (item.id === itemId) {
        const updatedReserved = item.reserved.map((res) => {
          if (res.projectId === taskId) {
            const newCount = Math.max(1, res.count + increment);
            return { ...res, count: newCount };
          }
          return res;
        });
        return { ...item, reserved: updatedReserved };
      }
      return item;
    });

    await updateStorage(updatedWarehouseItems, updatedProjects);
  };

  const getItemCount = (item) => {
    const reservation = item.reserved.find((res) => res.projectId === taskId);
    return reservation ? reservation.count : 0;
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.itemInfo}
        onPress={() =>
          navigation.navigate("WarehouseItemInfo", {
            itemData: item,
          })
        }
      >
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.countText}>Count: {getItemCount(item)}</Text>
      </TouchableOpacity>
      <View style={styles.countControls}>
        <TouchableOpacity
          style={styles.countButtonMinus}
          onPress={() => updateItemCount(item.id, -1)}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.countButton}
          onPress={() => updateItemCount(item.id, 1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => onRemove(item.id)}>
        <Text style={styles.buttonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWarehouseItem = ({ item }) => (
    <TouchableOpacity style={styles.warehouseItemInfo} onPress={() => onAdd(item)}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.availableCount}>Available: {item.count}</Text>
    </TouchableOpacity>
  );

  // Sort reserved items by project ID
  reservedItems.sort((a, b) =>
    a.reserved.find((res) => res.projectId === taskId).count -
    b.reserved.find((res) => res.projectId === taskId).count
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Reserved Items</Text>

        <FlatList
          data={reservedItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />

        <Text style={styles.modalTitle}>Add More Items</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search warehouse items"
          value={searchText}
          onChangeText={setSearchText}
        />

        <FlatList
          data={warehouseItems.filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
          )}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWarehouseItem}
        />

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    borderColor: "#A4D337", // Green border color
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
    marginTop: 20,
  },
  warehouseItemInfo: {
    padding: 15,
    marginVertical: 5,
    borderColor: "#A4D337", // Green border color
    borderWidth: 2, // Border width
    borderRadius: 5, // Optional: Rounded corners
    backgroundColor: "white", // Background color for better visibility
  },
  itemText: {
    fontSize: 16,
    color: "black", // Text color
  },
  countControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  countButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  countButtonMinus: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  countText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  availableCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default ReservedItemsModal;


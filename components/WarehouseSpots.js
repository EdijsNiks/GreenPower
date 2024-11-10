import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WarehouseSpots = ({ isVisible, spotId, onClose, navigation }) => {
  const [spotData, setSpotData] = useState(null);
  const [reservedItemIds, setReservedItemIds] = useState([]);
  const [reservedItems, setReservedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSpotData();
  }, [spotId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = availableItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(availableItems);
    }
  }, [searchQuery, availableItems]);

  // Load spot data and then load the actual items
  const loadSpotData = async () => {
    try {
      setLoading(true);
      const spotsData = await AsyncStorage.getItem("spots");
      if (spotsData) {
        const spots = JSON.parse(spotsData);
        const currentSpot = spots.find((spot) => spot.spotId === spotId);
        if (currentSpot) {
          setSpotData(currentSpot);
          setReservedItemIds(currentSpot.reservedItems || []);
          await loadReservedItems(currentSpot.reservedItems || []);
        }
      }
    } catch (error) {
      console.error("Error loading spot data:", error);
      Alert.alert("Error", "Failed to load spot data");
    } finally {
      setLoading(false);
    }
  };

  // Load the full item data for each reserved item ID
  const loadReservedItems = async (itemIds) => {
    try {
      const storedItems = await AsyncStorage.getItem("items");
      if (storedItems) {
        const allItems = JSON.parse(storedItems);
        const items = itemIds
          .map((id) => allItems.find((item) => item.id === id))
          .filter(Boolean); // Remove any undefined items
        setReservedItems(items);
      }
    } catch (error) {
      console.error("Error loading reserved items:", error);
      Alert.alert("Error", "Failed to load reserved items");
    }
  };

  const loadAvailableItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("items");
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        // Filter out items that are already reserved
        const availableItems = parsedItems.filter(
          (item) => !reservedItemIds.includes(item.id)
        );
        setAvailableItems(availableItems);
        setFilteredItems(availableItems);
      }
    } catch (error) {
      console.error("Error loading available items:", error);
      Alert.alert("Error", "Failed to load available items");
    }
  };

  const handleAddItem = () => {
    setShowItemSelector(true);
    loadAvailableItems();
  };

  const handleSelectItem = async (selectedItem) => {
    try {
      const spotsData = await AsyncStorage.getItem("spots");
      let spots = spotsData ? JSON.parse(spotsData) : [];

      // Save only the item ID to the spot
      spots = spots.map((spot) => {
        if (spot.spotId === spotId) {
          return {
            ...spot,
            reservedItems: [...(spot.reservedItems || []), selectedItem.id],
          };
        }
        return spot;
      });

      await AsyncStorage.setItem("spots", JSON.stringify(spots));
      setReservedItemIds((prev) => [...prev, selectedItem.id]);
      setReservedItems((prev) => [...prev, selectedItem]);
      setShowItemSelector(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert("Error", "Failed to add item");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const spotsData = await AsyncStorage.getItem("spots");
      let spots = JSON.parse(spotsData);

      spots = spots.map((spot) => {
        if (spot.spotId === spotId) {
          return {
            ...spot,
            reservedItems: (spot.reservedItems || []).filter(
              (id) => id !== itemId
            ),
          };
        }
        return spot;
      });

      await AsyncStorage.setItem("spots", JSON.stringify(spots));
      setReservedItemIds((prev) => prev.filter((id) => id !== itemId));
      setReservedItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const handleClose = async () => {
    try {
      setSaving(true);
      const spotsData = await AsyncStorage.getItem("spots");
      let spots = spotsData ? JSON.parse(spotsData) : [];

      spots = spots.map((spot) => {
        if (spot.spotId === spotId) {
          return {
            ...spot,
            reservedItems: reservedItemIds, // Save only the item IDs
          };
        }
        return spot;
      });

      await AsyncStorage.setItem("spots", JSON.stringify(spots));
      setSaving(false);
      onClose();
    } catch (error) {
      console.error("Error saving spot data:", error);
      Alert.alert(
        "Error",
        "Failed to save changes. Do you want to try again?",
        [
          {
            text: "Try Again",
            onPress: handleClose,
          },
          {
            text: "Close Without Saving",
            onPress: onClose,
            style: "cancel",
          },
        ]
      );
      setSaving(false);
    }
  };

  const navigateToItem = (itemId) => {
    navigation.navigate("WarehouseItemInfo", { itemId });
    onClose(); // Close the modal first
  };

  const ItemSelector = () => (
    <Modal visible={showItemSelector} animationType="slide" transparent>
      <View style={styles.selectorContainer}>
        <Text style={styles.modalTitle}>Select Item</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.selectableItem}
              onPress={() => handleSelectItem(item)}
            >
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items found</Text>
          }
        />

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            setShowItemSelector(false);
            setSearchQuery("");
          }}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  if (loading || saving) {
    return (
      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>
            {saving ? "Saving changes..." : "Loading..."}
          </Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>
          Warehouse Spot: {spotData?.spotId || "Unknown"}
        </Text>
        <Text style={styles.modalSubtitle}>
          {spotData?.description || "No description available"}
        </Text>

        <Text style={styles.sectionTitle}>Reserved Items</Text>

        <FlatList
          data={reservedItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => navigateToItem(item.id)}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onPress
                  handleRemoveItem(item.id);
                }}
              >
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items in this spot</Text>
          }
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>

        <ItemSelector />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    justifyContent: "center",
  },
  selectorContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    marginTop: 50,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
  },
  selectableItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  button: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#bbb",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  loadingText: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
  },
});

export default WarehouseSpots;

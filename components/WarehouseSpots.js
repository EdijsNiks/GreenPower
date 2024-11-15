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
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WarehouseSpots = ({ isVisible, spotId, onClose, onSave, navigation }) => {
  const [spotData, setSpotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [spotItems, setSpotItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [itemCountUpdates, setItemCountUpdates] = useState({});
  const [localInputs, setLocalInputs] = useState({});

  useEffect(() => {
    if (isVisible && spotId) {
      loadSpotData();
    }
  }, [isVisible, spotId]);

  useEffect(() => {
    const filtered = warehouseItems.filter((item) =>
      item.name.toLowerCase().includes((searchQuery || "").toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery, warehouseItems]);

  const loadSpotData = async () => {
    try {
      setLoading(true);
      const [spotsData, itemsData] = await Promise.all([
        AsyncStorage.getItem("spots"),
        AsyncStorage.getItem("items"),
      ]);

      const spots = spotsData ? JSON.parse(spotsData) : [];
      const items = itemsData ? JSON.parse(itemsData) : [];

      const currentSpot = spots.find((spot) => spot.spotId === spotId) || {
        spotId,
        items: [],
      };

      setSpotData(currentSpot);

      // Process spot items
      const spotItemsArray = Array.isArray(currentSpot.items)
        ? currentSpot.items
        : [];
      const fullSpotItems = spotItemsArray
        .map((spotItem) => {
          if (!spotItem?.itemId) return null;
          const item = items.find((i) => i.id === spotItem.itemId);
          return item
            ? {
                ...item,
                count: spotItem.count || 0,
              }
            : null;
        })
        .filter(Boolean);

      setSpotItems(fullSpotItems);

      // Set available warehouse items
      const spotItemIds = new Set(spotItemsArray.map((item) => item.itemId));
      const availableItems = items.filter((item) => !spotItemIds.has(item.id));

      setWarehouseItems(availableItems);
      setFilteredItems(availableItems);
      setHasChanges(false);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load spot data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (selectedItem) => {
    try {
      if (!selectedItem?.id) {
        throw new Error("Invalid item selected");
      }

      const spotsData = await AsyncStorage.getItem("spots");
      let spots = spotsData ? JSON.parse(spotsData) : [];

      // Find the spot index
      const spotIndex = spots.findIndex((spot) => spot.spotId === spotId);

      if (spotIndex === -1) {
        // Create new spot if it doesn't exist
        spots.push({
          spotId,
          items: [
            {
              itemId: selectedItem.id,
              count: selectedItem.count,
            },
          ],
        });
      } else {
        // Update existing spot
        spots[spotIndex] = {
          ...spots[spotIndex],
          items: [
            ...(Array.isArray(spots[spotIndex].items)
              ? spots[spotIndex].items
              : []),
            { itemId: selectedItem.id, count: selectedItem.count },
          ],
        };
      }

      await AsyncStorage.setItem("spots", JSON.stringify(spots));

      // Update local state
      setSpotItems((prev) => [...prev, { ...selectedItem, count: selectedItem.count }]);
      setWarehouseItems((prev) =>
        prev.filter((item) => item.id !== selectedItem.id)
      );
      setShowItemSelector(false);
      setSearchQuery("");
      setHasChanges(true);
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert("Error", "Failed to add item");
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!itemId) return;

    try {
      const itemToRemove = spotItems.find((item) => item.id === itemId);
      if (!itemToRemove) return;

      const spotsData = await AsyncStorage.getItem("spots");
      let spots = spotsData ? JSON.parse(spotsData) : [];

      spots = spots.map((spot) => {
        if (spot.spotId === spotId) {
          return {
            ...spot,
            items: (spot.items || []).filter((item) => item.itemId !== itemId),
          };
        }
        return spot;
      });

      await AsyncStorage.setItem("spots", JSON.stringify(spots));

      setSpotItems((prev) => prev.filter((item) => item.id !== itemId));
      setWarehouseItems((prev) => [...prev, itemToRemove]);
      setHasChanges(true);
    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const saveInput = (itemId, additionalCount) => {
    try {
      const parsedAdditionalCount = parseInt(additionalCount, 10);
      if (isNaN(parsedAdditionalCount) || parsedAdditionalCount < 0) {
        Alert.alert("Error", "Count must be a valid positive number");
        return;
      }

      const itemToUpdate = spotItems.find((item) => item.id === itemId);
      if (!itemToUpdate) return;

      const newCount = (itemToUpdate.count || 0) + parsedAdditionalCount;

      // Update the item count in the itemCountUpdates object
      setItemCountUpdates((prev) => ({
        ...prev,
        [itemId]: newCount,
      }));

      Alert.alert("Success", `Count updated to ${newCount}`);
      setHasChanges(true);
    } catch (error) {
      console.error("Error saving count:", error);
      Alert.alert("Error", "Failed to save item count");
    }
  };

  const handleSaveAndClose = async () => {
    try {
      setSaving(true);

      // Get current items data
      const itemsData = await AsyncStorage.getItem("items");
      let allItems = itemsData ? JSON.parse(itemsData) : [];

      // Update the items with new counts
      const updatedAllItems = allItems.map(item => {
        const spotItem = spotItems.find(si => si.id === item.id);
        if (spotItem) {
          return {
            ...item,
            count: itemCountUpdates[item.id] || spotItem.count || 0
          };
        }
        return item;
      });

      // Save updated items to AsyncStorage
      await AsyncStorage.setItem("items", JSON.stringify(updatedAllItems));

      // Update the spotItems with the latest counts
      const updatedSpotItems = spotItems.map((item) => ({
        id: item.id,
        count: itemCountUpdates[item.id] || item.count || 0,
        name: item.name,
      }));

      // Call the parent's onSave callback with the updated items
      await onSave(updatedSpotItems);

      // Pass the updated items back to the Warehouse component
      onClose(updatedAllItems);
    } catch (error) {
      console.error("Error saving spot data:", error);
      Alert.alert("Error", "Failed to save spot data");
    } finally {
      setSaving(false);
    }
  };

  const handleTextChange = (itemId, text) => {
    setLocalInputs((prev) => ({
      ...prev,
      [itemId]: text,
    }));
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
              onPress={() => handleAddItem(item)}
            >
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Text style={styles.count}>Count: {item.count}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items available</Text>
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

  const renderSpotItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.itemInfo}
      >
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.count}>Count: {item.count}</Text>
      </TouchableOpacity>

      <View style={styles.countControls}>
        <TextInput
          style={styles.countInput}
          keyboardType="numeric"
          value={localInputs[item.id] || ""}
          onChangeText={(text) => handleTextChange(item.id, text)}
          placeholder="0"
        />
        <Button
          style={styles.saveButtonCount}
          title="Save"
          onPress={() => saveInput(item.id, localInputs[item.id])}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Text style={styles.buttonText}>Remove</Text>
      </TouchableOpacity>
    </View>
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

        <Text style={styles.sectionTitle}>Items in Spot</Text>

        <FlatList
          data={spotItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSpotItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items in this spot</Text>
          }
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowItemSelector(true)}
        >
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.closeButton, hasChanges && styles.saveButton]}
          onPress={handleSaveAndClose}
        >
          <Text style={styles.buttonText}>
            {hasChanges ? "Save & Close" : "Close"}
          </Text>
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
  },
  selectorContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
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
  count: {
    fontSize: 14,
    color: "#666",
  },
  countControls: {
    flexDirection: "row",
    marginRight: 10,
  },
  countButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  countButtonMinus: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  button: {
    backgroundColor: "#ff6b6b",
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: "#666",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  selectableItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
  countControls: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  countInput: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    width: 80,
    textAlign: "center",
  },
  saveButtonCount: {
    backgroundColor: "#4CAF50",
  },
});

export default WarehouseSpots;

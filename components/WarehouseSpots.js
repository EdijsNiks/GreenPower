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
import { useTranslation } from "react-i18next";

const WarehouseSpots = ({ isVisible, spotId, onClose, onSave }) => {
  const { t } = useTranslation();
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
    // Filter available items to exclude reserved items
    const reservedItemIds = new Set(spotItems.map((item) => item.id));
    setFilteredItems(
      warehouseItems.filter((item) => !reservedItemIds.has(item.id))
    );
  }, [warehouseItems, spotItems]);

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

      const spotItemCounts = {};
      currentSpot.items.forEach((item) => {
        spotItemCounts[item.itemId] = item.count;
      });

      const spotItemsArray = Array.isArray(currentSpot.items)
        ? currentSpot.items
        : [];
      const fullSpotItems = spotItemsArray
        .map((spotItem) => {
          if (!spotItem?.itemId) return null;
          const warehouseItem = items.find((i) => i.id === spotItem.itemId);
          if (!warehouseItem) return null;

          const effectiveCount = Math.min(
            spotItem.count || 0,
            warehouseItem.count || 0
          );

          return {
            ...warehouseItem,
            count: effectiveCount,
          };
        })
        .filter(Boolean);

      setSpotItems(fullSpotItems);

      const updates = {};
      fullSpotItems.forEach((item) => {
        updates[item.id] = item.count;
      });
      setItemCountUpdates(updates);

      const spotItemIds = new Set(spotItemsArray.map((item) => item.itemId));
      const availableItems = items.filter((item) => !spotItemIds.has(item.id));

      setWarehouseItems(availableItems);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load spot data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndClose = async () => {
    try {
      setSaving(true);

      const [itemsData, spotsData] = await Promise.all([
        AsyncStorage.getItem("items"),
        AsyncStorage.getItem("spots"),
      ]);

      let allItems = itemsData ? JSON.parse(itemsData) : [];
      let spots = spotsData ? JSON.parse(spotsData) : [];

      const updatedSpots = spots.map((spot) => {
        if (spot.spotId === spotId) {
          return {
            ...spot,
            items: spotItems.map((item) => ({
              itemId: item.id,
              count: itemCountUpdates[item.id] || item.count || 0,
            })),
          };
        }
        return spot;
      });

      const updatedAllItems = allItems.map((item) => {
        const spotItem = spotItems.find((si) => si.id === item.id);
        if (spotItem) {
          return {
            ...item,
            count: Math.max(
              item.count,
              itemCountUpdates[item.id] || spotItem.count || 0
            ),
          };
        }
        return item;
      });

      await Promise.all([
        AsyncStorage.setItem("spots", JSON.stringify(updatedSpots)),
        AsyncStorage.setItem("items", JSON.stringify(updatedAllItems)),
      ]);

      onSave(
        spotItems.map((item) => ({
          id: item.id,
          count: itemCountUpdates[item.id] || item.count || 0,
          name: item.name,
        }))
      );

      onClose(updatedAllItems);
    } catch (error) {
      console.error("Error saving spot data:", error);
      Alert.alert("Error", "Failed to save spot data");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async (selectedItem) => {
    try {
      if (!selectedItem?.id) {
        throw new Error("Invalid item selected");
      }

      const spotsData = await AsyncStorage.getItem("spots");
      let spots = spotsData ? JSON.parse(spotsData) : [];

      const spotIndex = spots.findIndex((spot) => spot.spotId === spotId);

      if (spotIndex === -1) {
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

      setSpotItems((prev) => [
        ...prev,
        { ...selectedItem, count: selectedItem.count },
      ]);
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
  const handleTextChange = (itemId, text) => {
    setLocalInputs((prev) => ({
      ...prev,
      [itemId]: text,
    }));
  };

  const ItemSelector = () => (
    <Modal visible={showItemSelector} animationType="slide" transparent>
      <View style={styles.selectorContainer}>
        <Text style={styles.modalTitle}>{t("select_item")}</Text>

        <TextInput
          style={styles.searchInput}
          placeholder={t("search_items")}
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
              <Text style={styles.count}>{t("count", { count: item.count })}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t("no_items_available")}</Text>
          }
        />

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            setShowItemSelector(false);
            setSearchQuery("");
          }}
        >
          <Text style={styles.buttonText}>{t("close")}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const renderSpotItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity style={styles.itemInfo}>
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.count}>{t("count")}: {item.count}</Text>
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
          title={t("save")}
          onPress={() => saveInput(item.id, localInputs[item.id])}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Text style={styles.buttonText}>{t("remove")}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading || saving) {
    return (
      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>
            {saving ? t("saving_changes") : t("loading")}
          </Text>
        </View>
      </Modal>
    );
  }

  return (
      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {t("items_in_spot")}: {spotData?.spotId || t("spot_unknown")}
          </Text>
          <Text style={styles.modalSubtitle}>
            {spotData?.description || t("spot_no_description")}
          </Text>
  
          <Text style={styles.sectionTitle}>{t("items_in_spot")}</Text>
  
          <FlatList
            data={spotItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSpotItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t("no_items_in_spot")}</Text>
            }
          />
  
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowItemSelector(true)}
          >
            <Text style={styles.buttonText}>{t("add_item")}</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={[styles.closeButton, hasChanges && styles.saveButton]}
            onPress={handleSaveAndClose}
          >
            <Text style={styles.buttonText}>
              {hasChanges ? t("save_close") : t("close")}
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

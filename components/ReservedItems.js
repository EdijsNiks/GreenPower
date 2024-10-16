import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";

const ReservedItemsModal = ({
  visible,
  onClose,
  reservedItems,
  warehouseItems,
  onAdd,
  onRemove,
  navigation,
  taskId,
}) => {
  const [searchText, setSearchText] = useState("");

  // Filter warehouse items based on search text
  const filteredItems = warehouseItems.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.itemInfo}
        onPress={() => navigation.navigate("ItemDetail", { taskId, itemId: item.id })}
      >
        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onRemove(item.id)}>
        <Text style={styles.buttonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWarehouseItem = ({ item }) => (
    <TouchableOpacity style={styles.warehouseItemInfo} onPress={() => onAdd(item)}>
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );
  

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Reserved Items</Text>

        {/* Reserved Items List */}
        <FlatList
          data={reservedItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />

        {/* Search Bar for Warehouse Items */}
        <Text style={styles.modalTitle}>Add More Items</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search warehouse items"
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Filtered List based on search */}
        <FlatList
          data={filteredItems}
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
});

export default ReservedItemsModal;


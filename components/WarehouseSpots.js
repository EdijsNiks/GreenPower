import React from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet } from "react-native";

const WarehouseSpots = ({ isVisible, spotData, onClose }) => {
  const handleAddItem = () => {
    console.log("Add item to spot:", spotData);
  };

  const handleRemoveItem = () => {
    console.log("Remove item from spot:", spotData);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Warehouse Spot: {spotData}</Text>
        <Text style={styles.modalSubtitle}>Reserved Items</Text>

        {/* Placeholder reserved items for demonstration */}
        <FlatList
          data={[{ id: 1, name: "Item A" }, { id: 2, name: "Item B" }]}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <TouchableOpacity style={styles.button} onPress={handleRemoveItem}>
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>
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
    backgroundColor: "white",
    padding: 20,
    justifyContent: "center",
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
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
  },
  itemText: {
    fontSize: 16,
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
});

export default WarehouseSpots;

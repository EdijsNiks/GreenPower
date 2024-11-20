import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";

const CustomPicker = ({ data, selectedValue, onValueChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentItems = data.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={styles.selectedItemContainer}
      >
        <Text>{selectedValue || "Select an item"}</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <FlatList
            data={currentItems}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onValueChange(item);
                  setIsModalVisible(false);
                }}
                style={styles.item}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.pagination}>
            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              style={[
                styles.pageButton,
                currentPage === 0 && styles.disabledButton,
              ]}
            >
              <Text>Prev</Text>
            </TouchableOpacity>
            <Text>
              Page {currentPage + 1} of {totalPages}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={currentPage === totalPages - 1}
              style={[
                styles.pageButton,
                currentPage === totalPages - 1 && styles.disabledButton,
              ]}
            >
              <Text>Next</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setIsModalVisible(false)}
            style={styles.closeButton}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedItemContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 5,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  pageButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#ff0000",
    alignItems: "center",
    borderRadius: 5,
  },
});



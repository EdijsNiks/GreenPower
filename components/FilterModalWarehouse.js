import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";

import { useTranslation } from "react-i18next"; // Import translation hook

const FilterModalWarehouse = ({
  isVisible,
  onClose,
  selectedCategories,
  handleFilter,
  clearSelection,
  categories = [], // Accept categories as a prop with a default empty array
}) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Translate the modal title */}
          <Text style={styles.modalTitle}>{t('selectCategory')}</Text>

          {/* Map through the categories prop instead of a hardcoded array */}
          {categories.map((category) => (
            <View style={styles.buttonWrapper} key={category}>
              <TouchableOpacity
                style={[
                  styles.button,
                  selectedCategories.includes(category) && styles.selectedButton,
                ]}
                onPress={() => handleFilter(category)}
              >
                <Text style={styles.buttonText}>{category}</Text>
              </TouchableOpacity>
              {selectedCategories.includes(category) && (
                <Text style={styles.indicator}>✔</Text>
              )}
            </View>
          ))}

          {/* Translate the button text for "Clear Selection" and "Close" */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
              <Text style={styles.clearButtonText}>{t('clearSelection')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    margin: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  button: {
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    flex: 1,
  },
  selectedButton: {
    backgroundColor: "#A4D337",
  },
  buttonText: {
    textAlign: "center",
  },
  indicator: {
    marginLeft: 10,
    color: "green",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: "#A4D337",
    padding: 10,
    borderRadius: 5,
  },
  clearButtonText: {
    color: "white",
    textAlign: "center",
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
  },
});

export default FilterModalWarehouse;

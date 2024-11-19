import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

const FilterModalWarehouse = ({
  isVisible,
  onClose,
  selectedCategories,
  handleFilter,
  clearSelection,
  categories,
  screenType,
  updateCategories,
}) => {
  const { t } = useTranslation();
  const [newCategory, setNewCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const categoriesPerPage = 6;

  // Auto-reset to first page when categories reduce
  useEffect(() => {
    if (categories.length <= 6) {
      setCurrentPage(0);
    }
  }, [categories]);

  const addCategory = async () => {
    if (newCategory.trim() === "") return;

    try {
      let updatedCategories;
      const storageKey =
        screenType === "projects" ? "categoriesProjects" : "categories";

      const existingCategories = await AsyncStorage.getItem(storageKey);
      const parsedCategories = existingCategories
        ? JSON.parse(existingCategories)
        : [];

      if (!parsedCategories.includes(newCategory)) {
        updatedCategories = [...parsedCategories, newCategory];

        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(updatedCategories)
        );
        updateCategories(updatedCategories);
        setNewCategory("");
      } else {
        Alert.alert(t("categoryExists"), t("categoryAlreadyPresent"));
      }
    } catch (error) {
      console.error("Error adding category:", error);
      Alert.alert(t("error"), t("errorAddingCategory"));
    }
  };

  const confirmDeleteCategory = (categoryToDelete) => {
    Alert.alert(
      t("deleteCategory"),
      t("confirmDeleteCategory"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => deleteCategory(categoryToDelete),
        },
      ],
      { cancelable: true }
    );
  };

  const deleteCategory = async (categoryToDelete) => {
    try {
      const storageKey =
        screenType === "projects" ? "categoriesProjects" : "categories";

      const existingCategories = await AsyncStorage.getItem(storageKey);
      const parsedCategories = existingCategories
        ? JSON.parse(existingCategories)
        : [];

      const updatedCategories = parsedCategories.filter(
        (cat) => cat !== categoryToDelete
      );

      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedCategories));
      updateCategories(updatedCategories);
    } catch (error) {
      console.error("Error deleting category:", error);
      Alert.alert(t("error"), t("errorDeletingCategory"));
    }
  };

  // Paginate categories
  const paginatedCategories = categories.slice(
    currentPage * categoriesPerPage,
    (currentPage + 1) * categoriesPerPage
  );

  // Calculate total number of pages
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t("selectCategory")}</Text>

          {/* New category input and add button */}
          <View style={styles.addCategoryContainer}>
            <TextInput
              style={styles.addCategoryInput}
              placeholder={t("enterNewCategory")}
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={addCategory}
            >
              <Text style={styles.addCategoryButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {paginatedCategories.map((category) => (
            <View style={styles.buttonWrapper} key={category}>
              <TouchableOpacity
                style={[
                  styles.button,
                  selectedCategories.includes(category) &&
                    styles.selectedButton,
                ]}
                onPress={() => handleFilter(category)}
              >
                <Text style={styles.buttonText}>{category}</Text>
              </TouchableOpacity>
              {selectedCategories.includes(category) && (
                <Text style={styles.indicator}>✔</Text>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDeleteCategory(category)}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Pagination Controls */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === 0 && styles.disabledPaginationButton,
              ]}
              disabled={currentPage === 0}
              onPress={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            >
              <Text style={styles.paginationButtonText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.paginationText}>
              {currentPage + 1} / {totalPages || 1}
            </Text>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                (currentPage === totalPages - 1 || totalPages === 0) &&
                  styles.disabledPaginationButton,
              ]}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
              onPress={() =>
                setCurrentPage((prev) =>
                  Math.min((totalPages || 1) - 1, prev + 1)
                )
              }
            >
              <Text style={styles.paginationButtonText}>{">"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSelection}
            >
              <Text style={styles.clearButtonText}>{t("clearSelection")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{t("close")}</Text>
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
  addCategoryContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  addCategoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addCategoryButton: {
    backgroundColor: "#A4D337",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    padding: 10,
  },
  addCategoryButtonText: {
    color: "white",
    fontSize: 18,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  paginationButton: {
    padding: 10,
    backgroundColor: "#A4D337",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  disabledPaginationButton: {
    backgroundColor: "#CCCCCC",
  },
  paginationButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  paginationText: {
    fontSize: 16,
  },
});

export default FilterModalWarehouse;

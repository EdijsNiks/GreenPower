// AddItemBottomSheet.js
import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet from "reanimated-bottom-sheet";
import QRCodeScanner from "react-native-camera/qrscanner";

const AddItemBottomSheet = ({ sheetRef, onClose }) => {
  const handleQRScanner = () => {
    // Open QR code scanner
    sheetRef.current.snapTo(1);
  };

  const handleTextInput = () => {
    // Handle text input for adding item
    // This can be expanded to open a text input modal or another screen
  };

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={[450, 0]}
      borderRadius={10}
      renderContent={() => (
        <View style={styles.sheetContainer}>
          <Text style={styles.sheetTitle}>Add Item</Text>
          <TouchableOpacity style={styles.optionButton} onPress={handleQRScanner}>
            <Text style={styles.optionText}>Scan QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={handleTextInput}>
            <Text style={styles.optionText}>Add by Text</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: "white",
    padding: 20,
    height: 450,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#A4D337",
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#A4D337",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
  },
});

export default AddItemBottomSheet;

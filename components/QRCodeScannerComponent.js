// QRCodeScannerComponent.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RNCamera } from "react-native-camera";

const QRCodeScannerComponent = ({ onRead }) => {
  return (
    <RNCamera
      style={styles.camera}
      onBarCodeRead={onRead}
      captureAudio={false}
    >
      <View style={styles.overlay}>
        <Text style={styles.instructions}>Scan a QR Code</Text>
      </View>
    </RNCamera>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  instructions: {
    color: "white",
    fontSize: 18,
  },
});

export default QRCodeScannerComponent;

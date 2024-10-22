import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Camera } from "expo-camera";

const QRCodeScannerComponent = ({ onRead }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    onRead({ data });
  };

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: [
            Camera.Constants.BarCodeType.qr, // Only scan QR codes
          ],
        }}
        captureAudio={false}
      >
        <View style={styles.overlay}>
          <Text style={styles.instructions}>Scan a QR Code</Text>
        </View>
      </Camera>
      {scanned && (
        <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  instructions: {
    color: "white",
    fontSize: 18,
  },
});

export default QRCodeScannerComponent;


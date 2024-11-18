import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useTranslation } from 'react-i18next';

const QRCodeScanner = ({ onScanComplete, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = ({ type, data }) => {
    setScanned(true);
    onScanComplete(data);
    onClose();
  };

  if (hasPermission === null) {
    return <Text>{t('requestingPermission')}</Text>;
  }
  if (hasPermission === false) {
    return <Text>{t('noAccess')}</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  scanAgainButton: {
    marginRight: 16,
    marginBottom: 16,
  },
  goBackButton: {
    marginLeft: 16,
    marginVertical: 16,
  },
});
export default QRCodeScanner;

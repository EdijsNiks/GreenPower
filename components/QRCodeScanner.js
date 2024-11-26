import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Platform } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useTranslation } from 'react-i18next';
import { Scanner } from '@yudiel/react-qr-scanner'; // Import the library

const QRCodeScanner = ({ onScanComplete, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const getPermissions = async () => {
      if (Platform.OS === "web") {
        // Web: Check camera availability and permissions
        if ("mediaDevices" in navigator && navigator.mediaDevices.getUserMedia) {
          try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setHasPermission(true);
          } catch (error) {
            setHasPermission(false);
          }
        } else {
          setHasPermission(false);
        }
      } else {
        // Mobile: Use Expo Camera API
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      }
    };

    getPermissions();
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

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <Scanner
          onScan={(result) => {
            if (result?.[0]?.rawValue) {
              setScanned(true);
              onScanComplete(result[0].rawValue);
              onClose();
            }
          }}
          onError={(error) => console.error("Scanner Error:", error)}
          scanDelay={300}
          formats={['qr_code']} // Limit detection to QR codes only
          paused={scanned}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    );
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
});

export default QRCodeScanner;


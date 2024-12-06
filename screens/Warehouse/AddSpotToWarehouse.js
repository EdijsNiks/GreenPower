import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width } = Dimensions.get("window");
import "react-native-get-random-values"; // Polyfill for random values
import { v4 as uuidv4 } from "uuid";

import { useTranslation } from "react-i18next";

const AddSpotToWarehouse = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [spotId, setSpotId] = useState("");
  const [description, setDescription] = useState("");

  const saveSpot = async () => {
    if (!spotId || !description) {
      Alert.alert(t("error"), t("missingFields"));
      return;
    }

    try {
      // Create new spot object
      const newSpot = {
        id: uuidv4(),
        spotId,
        description,
        reservedItems: [],
      };
      const response = await fetch("http://192.168.8.101:5000/api/spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSpot),
      });
      // Get existing spots from storage
      const existingSpots = await AsyncStorage.getItem("spots");
      const spots = existingSpots ? JSON.parse(existingSpots) : [];

      // Add new spot and save back to storage
      spots.push(newSpot);
      await AsyncStorage.setItem("spots", JSON.stringify(spots));

      if (response.ok) {
        Alert.alert(t("success"), t("spotSaved"), [
          {
            text: "OK",
            onPress: () => {
              setSpotId("");
              setDescription("");
              console.log(response);
              navigation.goBack();
            },
          },
        ]);
      }else{
        const errorData = await response.json();
        Alert.alert(t("error"), errorData.message || t("saveError"));
      }
    } catch (error) {
      console.error("Error saving spot:", error);
      Alert.alert(t("error"), t("saveError"));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>{t("addSpot")}</Text>
      </View>

      <ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("spotId")}
            value={spotId}
            onChangeText={setSpotId}
          />
          <TextInput
            style={styles.input}
            placeholder={t("description")}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>{t("goBack")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveSpot}>
            <Text style={styles.buttonText}>{t("saveSpot")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 110,
    backgroundColor: "black",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingTop: 10,
    zIndex: 1,
  },
  logo: {
    width: 90,
    height: 60,
  },
  screenName: {
    color: "#A4D337",
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: width * 0.15,
  },
  inputContainer: {
    marginTop: 150,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    fontSize: 16,
  },
  photosSection: {
    padding: 20,
  },
  photosTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addPhotoButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  photoGallery: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  photo: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  backButton: {
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AddSpotToWarehouse;

import { StyleSheet, Text, View, Image, SafeAreaView , Dimensions} from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");


const Warehouse = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("myKey")
      .then((stringifiedData) => {
        if (stringifiedData !== null) {
          const data = JSON.parse(stringifiedData);
          console.log("User data retrieved from AsyncStorage:", data);
          setCurrentUser(data);
        }
      })
      .catch((error) => {
        console.error("Error retrieving data:", error);
      });
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>WAREHOUSE</Text>
      </View>

      <View style={styles.profileContainer}>
        <Text style={styles.profileText}>{currentUser}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
  profileContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
  },
});

export default Warehouse;

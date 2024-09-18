import { StyleSheet, Text, View, Image, SafeAreaView, Dimensions, Pressable } from "react-native";
import React, { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const AdminPage = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    /////////// Hide Header ///////////
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleBack = () => {
    /////////// Navigate Back to Profile ///////////
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/*///////// Navbar //////////*/}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>ADMIN PAGE</Text>
      </View>

      {/*///////// Back Button //////////*/}
      <Pressable
        onPress={handleBack}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Back to Profile</Text>
      </Pressable>

      {/*///////// Admin List //////////*/}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Admin List</Text>
        <View style={styles.itemList}>
          {/* Placeholder Items */}
          <Text style={styles.listItem}>Item 1</Text>
          <Text style={styles.listItem}>Item 2</Text>
          <Text style={styles.listItem}>Item 3</Text>
          <Text style={styles.listItem}>Item 4</Text>
        </View>
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
  backButton: {
    marginTop: 120,
    width: 140,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#A4D337",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  listContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  listTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20,
  },
  itemList: {
    width: "90%",
    paddingHorizontal: 10,
  },
  listItem: {
    fontSize: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});

export default AdminPage;

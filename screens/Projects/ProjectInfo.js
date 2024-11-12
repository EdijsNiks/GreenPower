import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import ReservedItemsModal from "../../components/ReservedItems";

const { width } = Dimensions.get("window");

const ProjectsInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { project, taskId } = route.params; // Get project data from route params
  const [modalVisible, setModalVisible] = useState(false);

  if (!project) {
    return <Text>No project data available</Text>;
  }
  // Static data for reserved items based on the newItem model
  const [reservedItems, setReservedItems] = useState([]);

  // Static data for unreserved warehouse items
  const warehouseItems = [];

  const onAdd = (item) => {
    const reservedItem = { ...item, projectId: project.id };
    setReservedItems([...reservedItems, reservedItem]);
  };

  const onRemove = (itemId) => {
    setReservedItems(reservedItems.filter((item) => item.id !== itemId));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>PROJECT INFO</Text>
      </View>

      <View style={styles.backButtonContainer}></View>
      <ScrollView>
        {/* Project Info Section */}
        <View style={styles.projectInfo}>
          <Text style={styles.infoText}>NAME: {project.name}</Text>
          <Text style={styles.infoText}>Category: {project.category}</Text>
          <Text style={styles.infoText}>Created at: {project.dateCreated}</Text>
        </View>

        <View style={styles.paddingBetweenSection}></View>

        {/* Reserved Item Info Section */}
        <View style={styles.reservedItemsSection}>
          <Text style={styles.sectionTitle}>Reserved Items</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>View Reserved Items</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.finishButtonBack}
            onPress={() => navigation.navigate("Main", { screen: "Tasks" })}
          >
            <Text style={styles.buttonText}>Go back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.buttonText}>Edit Info</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.finishButton}>
            <Text style={styles.buttonText}>Finish Project</Text>
          </TouchableOpacity>
        </View>

        {/* Project Description */}
        <Text style={styles.description}>PROJECT DESCRIPTION</Text>
        <Text style={styles.descriptionText}>{project.description}</Text>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <View style={styles.photoRow}>
            <Text style={styles.photosTitle}>PHOTOS</Text>
            <TouchableOpacity style={styles.addPhotoButton}>
              <Text style={styles.buttonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.photoGallery}>
            {project.photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.photo} />
            ))}
          </View>
        </View>

        {/* Modal for Reserved Items */}
        <ReservedItemsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          reservedItems={reservedItems}
          warehouseItems={warehouseItems}
          onAdd={onAdd}
          onRemove={onRemove}
          navigation={navigation}
          taskId={project.id}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A4D337",
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  backButton: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 10,
  },
  logo: {
    width: 60,
    height: 40,
  },

  taskInfo: {
    padding: 20,
    backgroundColor: "#A4D337",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  editButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  finishButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  finishButtonBack: {
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  description: {
    fontSize: 18,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
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
  photoGallery: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  photo: {
    width: 100,
    height: 100,
    backgroundColor: "lightgray",
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
  backButtonContainer: {
    padding: 25,
    alignItems: "center",
    marginBottom: 50,
  },
  paddingBetweenSection: {
    padding: 5,
    alignItems: "center",
  },
  reservedItemsSection: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  projectInfo: {
    paddingHorizontal: 20,
    backgroundColor: "#A4D337",
    paddingVertical: 20,
    borderRadius: 5,
  },
});

export default ProjectsInfo;

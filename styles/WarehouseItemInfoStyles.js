import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

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
    height: 120,
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
  itemInfoContainer: {
    marginTop: 110,
    paddingHorizontal: 20,
    backgroundColor: "#A4D337",
    paddingVertical: 30,
    borderRadius: 5,
  },
  itemName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemDetails: {
    fontSize: 18,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  photosSection: {
    paddingHorizontal: 20,
  },
  photosTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  photoGallery: {
    flexDirection: "row",
    flexWrap: "wrap", // Allows multiple rows if there are more photos
    marginVertical: 10,
  },
  photo: {
    width: width * 0.28, // Dynamic width to fit 3 photos in a row
    height: width * 0.28, // Keeping it square
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f0f0f0", // Placeholder color while loading
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    marginHorizontal: 10,
  },
  backButton: {
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  photoContainer: {
    margin: 5,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  noPhotosText: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  reserveSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  reserveTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  projectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  projectItem: {
    width: "48%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedProject: {
    backgroundColor: "#A4D337",
    borderColor: "black",
  },
  projectText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  selectedProjectText: {
    color: "#fff",
  },
  quantityInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#A4D337",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonTextDisabled: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  photosSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  addPhotoButton: {
    backgroundColor: "#A4D337",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  reservationsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  reservationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  reservationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  reservationText: {
    fontSize: 14,
    color: "#666",
  },
  clearReservationButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearReservationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#A4D337",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  editableDescriptionInput: {
    borderWidth: 2,
    borderColor: "green",
    borderRadius: 10,
    padding: 20,
    fontSize: 16,
    backgroundColor: "#D3D3D3",
    minHeight: 80,
    textAlignVertical: "top",
    marginHorizontal: 10, // Adds space between the input and the sides of the container
  },
  descriptionContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginVertical: 10,
  },
  photosSection: {
    padding: 10,
  },
  savePhotosButton: {
    backgroundColor: "#A4D337",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "center",
  },
});

export default styles;

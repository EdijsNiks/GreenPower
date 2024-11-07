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
    marginTop: 100,
    paddingHorizontal: 20,
    backgroundColor: "#A4D337",
    paddingVertical: 20,
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
  addPhotoButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  photoGallery: {
    flexDirection: "row",
    flexWrap: "wrap", // Allows multiple rows if there are more photos
    justifyContent: "space-between",
    marginVertical: 10,
  },
  photo: {
    width: width * 0.28,  // Dynamic width to fit 3 photos in a row
    height: width * 0.28, // Keeping it square
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f0f0f0", // Placeholder color while loading
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
  editButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  photoContainer: {
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  noPhotosText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  }
});

export default styles;

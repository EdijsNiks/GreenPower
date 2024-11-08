// WarehouseStyles.js
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
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
    marginTop: 110,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  profileText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width:"100%",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  searchBar: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 10,
  },
  container: {
    alignItems: "center",
    marginTop: 10,
  },
  qrButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  qrButtonText: {
    fontWeight: "bold",
    color: "black",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#A4D337",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButtonText: {
    fontWeight: "bold",
    color: "black",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  scannedDataText: {
    color: "black",
    marginTop: 10,
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderRadius: 5,
    marginVertical: 5,
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "green",
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskRight: {
    alignItems: "center",
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  processingStatus: {
    backgroundColor: '#3498db',
  },
  successStatus: {
    backgroundColor: '#2ecc71',
  },
  errorStatus: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  scanButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    flex: 1,
  },
});

import { StyleSheet } from 'react-native';
const { width, Dimensions } = Dimensions.get("window");

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "white",
    },
    buttonWrapper: {
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    button: {
      flex: 1,
      padding: 15,
      backgroundColor: "#A4D337",
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    clearButton: {
      padding: 15,
      backgroundColor: "black", // Clear button color
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    clearButtonText: {
      color: "#A4D337", // Clear button text color
      fontSize: 16,
    },
    selectedButton: {
      backgroundColor: "#8DBA30", // Darker green for selected button
    },
    buttonText: {
      color: "white",
      fontSize: 16,
    },
    indicator: {
      marginLeft: 10,
      color: "#A4D337",
      fontSize: 18,
    },
    closeButton: {
      padding: 15,
      backgroundColor: "black",
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    closeButtonText: {
      color: "#A4D337",
      fontSize: 16,
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
      paddingHorizontal: 20,
      marginTop: 20,
    },
    searchBar: {
      flex: 1,
      borderColor: "gray",
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      marginHorizontal: 10,
    },
    addButton: {
      backgroundColor: "#A4D337",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    addButtonText: {
      color: "white",
      fontWeight: "bold",
    },
    filterButton: {
      padding: 10,
    },
    filterIcon: {
      width: 25,
      height: 25,
    },
    taskList: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    taskItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 20,
      borderBottomWidth: 3,
      borderBottomColor: "black",
    },
    taskLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    taskCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "#D8BFD8",
      marginRight: 10,
    },
    taskTitle: {
      fontSize: 16,
    },
    taskRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkIcon: {
      width: 20,
      height: 20,
    },
    unchecked: {
      width: 20,
      height: 20,
      backgroundColor: "red",
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    pageButton: {
      color: "#A4D337",
      fontWeight: "bold",
    },
    pageNumber: {
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      width: "80%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    deleteButton: {
      backgroundColor: '#FF0000',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
  });

  export default styles;
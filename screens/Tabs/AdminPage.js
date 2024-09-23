import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, Dimensions, Pressable, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

const { width } = Dimensions.get("window");

const AdminPage = () => {
  const navigation = useNavigation();

  // Date picker state for history filtering
  const [selectedDate, setSelectedDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Filter state for checked-in users
  const [showCheckedInOnly, setShowCheckedInOnly] = useState(false);

  // Sample admin history data
  const historyData = [
    { id: '1', user: 'User 1', action: 'added new task', description: '"Create something"', date: '20.09.2024' },
    { id: '2', user: 'User 2', action: 'edited warehouse item', description: '"Metal testtest" - took off 2 from count', date: '21.09.2024' },
    { id: '3', user: 'User 2', action: 'edited warehouse item', description: '"Metal testtest" - took off 2 from count', date: '21.09.2024' },
    { id: '4', user: 'User 2', action: 'edited warehouse item', description: '"Metal testtest" - took off 2 from count', date: '22.09.2024' },
    { id: '5', user: 'User 2', action: 'edited warehouse item', description: '"Metal testtest" - took off 2 from count', date: '22.09.2024' },
    { id: '6', user: 'User 2', action: 'edited warehouse item', description: '"Metal testtest" - took off 2 from count', date: '23.09.2024' },
    { id: '7', user: 'User 2', action: 'edited warehouse item', description: '"Metal testtest" - took off 2 from count', date: '23.09.2024' },

  ];

  // Sample user check-in data
  const userData = [
    { id: '1', name: 'User 1', checkedIn: true },
    { id: '2', name: 'User 2', checkedIn: false },
    { id: '3', name: 'User 3', checkedIn: true },
    { id: '4', name: 'User 4', checkedIn: false },
  ];

  // History Date Filtering using `date-fns`
  const handleConfirm = (date) => {
    setSelectedDate(format(date, 'dd.MM.yyyy'));
    setDatePickerVisibility(false);
  };

  // Render for history items
  const renderHistoryItem = ({ item }) => {
    if (selectedDate && item.date !== selectedDate) return null; // Filter by selected date
    return (
      <View style={styles.itemBox}>
        <Text style={styles.listItem}>
          {item.user} {item.action} {item.description} - {item.date}
        </Text>
        <View style={styles.separator} />
      </View>
    );
  };

  // Render for users
  const renderUserItem = ({ item }) => {
    if (showCheckedInOnly && !item.checkedIn) return null; // Filter by checked-in status
    return (
      <View style={styles.itemBox}>
        <Text style={styles.listItem}>
          {item.name} - {item.checkedIn ? 'Checked In' : 'Not Checked In'}
        </Text>
        <View style={styles.separator} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/*///////// Navbar //////////*/}
      <View style={styles.navbar}>
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>ADMIN PAGE</Text>
      </View>

      {/*///////// Back Button //////////*/}
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.buttonText}>Back to Profile</Text>
      </Pressable>

      {/*///////// Users Section with View All Button //////////*/}
      <View style={styles.section}>
      <View style={styles.sectionHeader}>
      <Text style={styles.listTitle}>Users</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ViewAll', { type: 'users', data: userData })} 
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={styles.listContainer}
        data={userData}
        keyExtractor={item => item.id}
        renderItem={renderUserItem}
      />
      </View>
      {/*///////// History Section with View All Button //////////*/}
      <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.listTitle}>History</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ViewAll', { type: 'history', data: historyData })} 
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={styles.listContainer}
        data={historyData}
        keyExtractor={item => item.id}
        renderItem={renderHistoryItem}
      />
      </View>
      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  section: {
    flex: 1, 
    justifyContent: 'flex-start',
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
    width: 150,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#A4D337",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#A4D337',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  itemBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItem: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    marginTop: 12,
    height: 1,
    backgroundColor: '#ddd',
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AdminPage;



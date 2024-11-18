import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
import { useTranslation } from 'react-i18next';

const ViewAll = ({ route }) => {
  const { type, data } = route.params; // 'users' or 'history'
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showCheckedInOnly, setShowCheckedInOnly] = useState(false);

  const handleConfirm = (date) => {
    setSelectedDate(format(date, 'dd.MM.yyyy'));
    setDatePickerVisibility(false);
  };

  const renderHistoryItem = ({ item }) => {
    if (selectedDate && item.date !== selectedDate) return null;
    return (
      <View style={styles.itemBox}>
        <Text style={styles.listItem}> {item.user} {item.action} {item.description} - {item.date}</Text>
      </View>
    );
  };

  const renderUserItem = ({ item }) => {
    if (showCheckedInOnly && !item.checkedIn) return null;
    return (
      <View style={styles.itemBox}>
        <Text style={styles.listItem}>{item.name} - {item.checkedIn ? t('checkedIn')
          : t('notCheckedIn')}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require("../assets/logo1.png")} style={styles.logo} />
        <Text style={styles.screenName}>{type === 'users' ? t('allUsers') : t('allHistory')}</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.buttonText}>{t('back')}</Text>
      </TouchableOpacity>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.listTitle}>{type === 'users' ? t('users') : t('history')}</Text>
        {type === 'users' && (
          <TouchableOpacity onPress={() => setShowCheckedInOnly(!showCheckedInOnly)} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>{showCheckedInOnly  ? t('showAllUsers')
              : t('showCheckedInOnly')}
              </Text>
          </TouchableOpacity>
        )}
        {type === 'history' && (
          <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>{selectedDate
              ? t('date', { date: selectedDate })
              : t('filterByDate')}
              </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List Rendering */}
      <FlatList
        style={styles.listContainer}
        data={data}
        keyExtractor={item => item.id}
        renderItem={type === 'users' ? renderUserItem : renderHistoryItem}
      />

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
    backgroundColor: 'white',
  },
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 110,
    backgroundColor: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 10,
    zIndex: 1,
  },
  logo: {
    width: 90,
    height: 60,
  },
  screenName: {
    color: '#A4D337',
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: width * 0.15,
  },
  backButton: {
    marginTop: 120,
    width: 140,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#A4D337',
    shadowColor: '#000',
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ViewAll;

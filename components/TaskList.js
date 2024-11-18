import React from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet } from 'react-native';

import { useTranslation } from "react-i18next";

const TaskList = ({ tasks, navigation }) => {
  const { t } = useTranslation(); // Use translation hook

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("WarehouseItemInfo", { taskId: item.id })
      }
    >
      <View style={styles.taskItem}>
        <View style={styles.taskLeft}>
          <View style={styles.taskCircle}></View>
          <Text style={styles.taskTitle}>{item.title}</Text>
        </View>
        <View style={styles.taskRight}>
          <Text>{t("count")}: 10</Text> {/* Translate "Count" */}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderTaskItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.taskList}
    />
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'green',
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskRight: {
    alignItems: 'center',
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default TaskList;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => {
  return (
    <View style={styles.pagination}>
      <TouchableOpacity disabled={currentPage === 1} onPress={onPrev}>
        <Text style={styles.pageButton}>Prev</Text>
      </TouchableOpacity>
      <Text style={styles.pageNumber}>
        Page {currentPage} of {totalPages}
      </Text>
      <TouchableOpacity disabled={currentPage === totalPages} onPress={onNext}>
        <Text style={styles.pageButton}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 30,
  },
  pageButton: {
    padding: 10,
    fontSize: 16,
    color: '#A4D337',
  },
  pageNumber: {
    fontSize: 16,
  },
});

export default Pagination;

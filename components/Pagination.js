import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from "react-i18next";


const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.pagination}>
      <TouchableOpacity disabled={currentPage === 1} onPress={onPrev}>
        <Text style={styles.pageButton}>{t("prev")}</Text>
      </TouchableOpacity>
      <Text style={styles.pageNumber}>
        {t("page")} {currentPage} {t("of")} {totalPages}
      </Text>
      <TouchableOpacity disabled={currentPage === totalPages} onPress={onNext}>
        <Text style={styles.pageButton}>{t("next")}</Text>
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

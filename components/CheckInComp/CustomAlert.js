import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomAlert = ({ visible, message, onClose, onConfirm, showConfirm }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.message}>{message}</Text>
          
          {/* Conditional rendering for confirmation buttons or a single OK button */}
          {showConfirm ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.noButton} onPress={onClose}>
                <Text style={styles.noButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yesButton} onPress={onConfirm}>
                <Text style={styles.yesButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.okButton} onPress={onClose}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  yesButton: {
    backgroundColor: '#A4D337',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  yesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  noButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  okButton: {
    backgroundColor: '#A4D337', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomAlert;


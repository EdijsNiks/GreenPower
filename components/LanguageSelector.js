import React from 'react';
import { View, Button } from 'react-native';
import { useLanguage } from './LanguageContext';

const LanguageSelector = () => {
  const { setLanguage } = useLanguage();

  return (
    <View>
      <Button title="English" onPress={() => setLanguage('en')} />
      <Button title="Spanish" onPress={() => setLanguage('es')} />
      {/* More languages... */}
    </View>
  );
};

export default LanguageSelector;

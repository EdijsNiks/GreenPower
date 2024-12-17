import React, { useContext, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { LanguageContext } from '../../LanguageProvider';

const TranslatableText = ({ text, fallbackText, style }) => {
  const { translateText } = useContext(LanguageContext);
  const [translatedText, setTranslatedText] = useState(fallbackText || text);

  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        const result = await translateText(text);
        setTranslatedText(result);
      } catch (error) {
        console.error('Translation Error:', error);
        setTranslatedText(fallbackText || text); // Use fallback or default text
      }
    };

    fetchTranslation();
  }, [text, fallbackText, translateText]);

  return <Text style={style}>{translatedText}</Text>;
};

export default TranslatableText;


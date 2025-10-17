import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n';
import translateService from '../services/translateService';

const I18nContext = createContext();

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('zh');
  const [translationsData, setTranslationsData] = useState(translations);
  const [forceUpdate, setForceUpdate] = useState(0);

  console.log('I18nContext 初始化，当前语言:', language);

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translationsData[language];
    
    // 遍历键来获取翻译值
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key;
      }
    }

    // 替换参数
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return Object.keys(params).reduce((str, param) => {
        return str.replace(new RegExp(`{${param}}`, 'g'), params[param]);
      }, value);
    }

    return value;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setForceUpdate(prev => prev + 1); // 强制重新渲染
  };

  const getSupportedLanguages = () => {
    return translateService.getSupportedLanguages();
  };

  const clearTranslationCache = () => {
    translateService.clearCache();
  };

  const checkTranslationConnection = async () => {
    return await translateService.checkConnection();
  };

  const value = {
    language,
    changeLanguage,
    t,
    getSupportedLanguages,
    clearTranslationCache,
    checkTranslationConnection,
    forceUpdate
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}; 
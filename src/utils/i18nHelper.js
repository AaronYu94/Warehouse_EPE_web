import { useI18n } from '../contexts/I18nContext';

// 常用的翻译键
export const TRANSLATION_KEYS = {
  // 通用
  COMMON: {
    LOADING: 'common.loading',
    SUBMIT: 'common.submit',
    CANCEL: 'common.cancel',
    SAVE: 'common.save',
    DELETE: 'common.delete',
    EDIT: 'common.edit',
    ADD: 'common.add',
    SUCCESS: 'common.success',
    ERROR: 'common.error',
    WARNING: 'common.warning'
  },
  
  // 表单字段
  FORM: {
    DATE: 'inbound.date',
    QUANTITY: 'inbound.quantity',
    MATERIAL_CODE: 'inbound.materialCode',
    MATERIAL_NAME: 'inbound.materialName',
    CONTAINER: 'inbound.containerNumber',
    DECLARATION_NO: 'inbound.declarationNo',
    DESTINATION: 'outbound.destination'
  },
  
  // 错误消息
  ERRORS: {
    NETWORK_ERROR: 'errors.networkError',
    DATA_LOAD_FAILED: 'errors.dataLoadFailed',
    OPERATION_FAILED: 'errors.operationFailed',
    INVALID_INPUT: 'errors.invalidInput'
  }
};

// 翻译钩子
export const useTranslation = () => {
  const { t, language, changeLanguage } = useI18n();
  
  return {
    t,
    language,
    changeLanguage,
    isChinese: language === 'zh'
  };
};

// 翻译组件
export const Trans = ({ children, key, params = {} }) => {
  const { t } = useI18n();
  return t(key, params);
};

// 条件翻译组件
export const ConditionalTrans = ({ condition, trueKey, falseKey, params = {} }) => {
  const { t } = useI18n();
  const key = condition ? trueKey : falseKey;
  return t(key, params);
};

// 格式化消息
export const formatMessage = (key, params = {}) => {
  const { t } = useI18n();
  return t(key, params);
};

// 获取当前语言
export const getCurrentLanguage = () => {
  const { language } = useI18n();
  return language;
};

// 检查是否为特定语言
export const isLanguage = (lang) => {
  const { language } = useI18n();
  return language === lang;
}; 
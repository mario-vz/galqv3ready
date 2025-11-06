import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { Translation } from '../types';

export const useTranslation = () => {
  const { language } = useLanguage();

  const translateValue = (value: any): any => {
    if (typeof value === 'object' && value !== null && 'es' in value && 'gl' in value) {
      return (value as Translation)[language];
    }

    if (Array.isArray(value)) {
      return value.map(item => translateValue(item));
    }

    if (typeof value === 'object' && value !== null) {
      const translated: any = {};
      for (const key in value) {
        translated[key] = translateValue(value[key]);
      }
      return translated;
    }

    return value;
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
      if (!value) return key;
    }

    return translateValue(value);
  };

  const tArray = (key: string): any[] => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
      if (!value) return [];
    }

    if (!Array.isArray(value)) return [];

    return translateValue(value);
  };

  return { t, tArray };
};

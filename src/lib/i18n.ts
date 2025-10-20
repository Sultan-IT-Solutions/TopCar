import { useLocale } from '@/context/LocaleContext';
import en from '@/locales/en/common.json';
import ru from '@/locales/ru/common.json';
import kk from '@/locales/kk/common.json';

const translations = {
  en,
  ru,
  kk,
};

export type Locale = keyof typeof translations;

export function useTranslations() {
  const { locale } = useLocale();
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to Russian if key not found
        value = translations.ru;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in (value as Record<string, unknown>)) {
            value = (value as Record<string, unknown>)[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, locale };
}

export const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
] as const;

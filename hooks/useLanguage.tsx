"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { enTranslations } from '@/lib/translations/en';
import { frTranslations } from '@/lib/translations/fr';

// Types
export type Language = 'en' | 'fr';

interface Translations {
  [key: string]: any;
}

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>('fr'); // Default to French
  const [translations, setTranslations] = useState<Translations>({});

  // Load translations
  const loadTranslations = (lang: Language) => {
    try {
      // Use imported translations directly
      if (lang === 'en') {
        setTranslations(enTranslations);
      } else {
        setTranslations(frTranslations);
      }
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
    }
  };

  // Set language and persist to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', lang);
    }
    loadTranslations(lang);
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Initialize language on mount
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('locale') as Language;
      const initialLanguage = savedLanguage || 'fr'; // Default to French
      setLanguageState(initialLanguage);
      loadTranslations(initialLanguage);
    } else {
      // Server-side default
      loadTranslations('fr');
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

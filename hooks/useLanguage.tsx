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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Loading messages in both languages
  const loadingMessages = {
    en: 'Loading...',
    fr: 'Chargement...'
  };

  // Load translations
  const loadTranslations = (lang: Language) => {
    setIsLoading(true);
    try {
      // Use imported translations directly
      if (lang === 'en') {
        setTranslations(enTranslations);
      } else {
        setTranslations(frTranslations);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      setIsLoading(false);
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
    // Return loading message if translations are still loading
    if (isLoading) {
      return loadingMessages[language];
    }

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
    <LanguageContext.Provider value={{ language, translations, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

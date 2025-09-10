"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { enTranslations } from '@/lib/translations/en';
import { frTranslations } from '@/lib/translations/fr';
import { useMergedTranslations } from './use-dynamic-translations';

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
  error: Error | null;
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

   // Use merged translations (static + dynamic)
   const { data: translations, isLoading: isLoadingTranslations, error } = useMergedTranslations(language);

   // Loading messages in both languages
   const loadingMessages = {
     en: 'Loading...',
     fr: 'Chargement...'
   };

   // Handle loading state - combine language switching with translation loading
   const isLoading = isLoadingTranslations;

  // Set language and persist to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', lang);
    }
    // Language change will automatically trigger new merged translations
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    // Return loading message if translations are still loading
    if (isLoading) {
      return loadingMessages[language];
    }

    // Return key if translations failed to load
    if (error || !translations) {
      console.warn(`Translation error for key "${key}":`, error);
      return key;
    }

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Return key if translation not found
            console.warn(`Translation not found for key: ${key}`);
            return key;
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
      // Language state change will automatically trigger merged translations loading
    } else {
      // Server-side default
      setLanguageState('fr');
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage, t, isLoading, error }}>
      {children}
    </LanguageContext.Provider>
  );
};

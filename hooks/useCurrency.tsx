"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCurrencies } from '@/app/_hooks/use-currencies';
import { useDefaultCurrencyId } from '@/hooks/use-website-url';
import { Tables } from '@/lib/supabase';

// Types
export type Currency = Tables<{ schema: "morpheus" }, "xdevise">;

interface CurrencyContextType {
  currencies: Currency[];
  currentCurrency: Currency | null;
  pivotCurrency: Currency | null;
  isLoading: boolean;
  error: Error | null;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number, fromCurrency?: Currency, toCurrency?: Currency) => number;
  formatPrice: (price: number, fromCurrency?: Currency, toCurrency?: Currency) => string;
}

// Create context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Hook to use currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Provider component
interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const { data: currencies = [], isLoading, error } = useCurrencies();
  const { data: defaultCurrencyId, isLoading: isLoadingDefaultCurrency } = useDefaultCurrencyId();
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [pivotCurrency, setPivotCurrency] = useState<Currency | null>(null);

  // Find pivot currency and set default currency
  useEffect(() => {
    if (currencies.length > 0 && !isLoadingDefaultCurrency) {
      // Find the pivot currency
      const pivot = currencies.find(currency => currency.xispivot === true);
      setPivotCurrency(pivot || null);

      // Set current currency from localStorage first
      if (typeof window !== 'undefined') {
        const savedCurrencyId = localStorage.getItem('selectedCurrency');
        if (savedCurrencyId) {
          const savedCurrency = currencies.find(c => c.xdeviseid.toString() === savedCurrencyId);
          if (savedCurrency) {
            setCurrentCurrency(savedCurrency);
            return;
          }
        }
      }
      
      // If no saved currency, try to use the default currency from settings
      if (defaultCurrencyId) {
        const defaultCurrency = currencies.find(c => c.xdeviseid === defaultCurrencyId);
        if (defaultCurrency) {
          setCurrentCurrency(defaultCurrency);
          return;
        }
      }
      
      // Fallback to pivot currency or first currency
      setCurrentCurrency(pivot || currencies[0] || null);
    }
  }, [currencies, defaultCurrencyId, isLoadingDefaultCurrency]);

  // Set currency and persist to localStorage
  const setCurrency = (currency: Currency) => {
    setCurrentCurrency(currency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCurrency', currency.xdeviseid.toString());
    }
  };

  // Currency conversion logic with validation
  const convertPrice = (
    price: number,
    fromCurrency?: Currency,
    toCurrency?: Currency
  ): number => {
    // Validate input price
    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      console.warn('Invalid price provided to convertPrice:', price);
      return 0;
    }

    if (!pivotCurrency) {
      console.warn('No pivot currency available for conversion');
      return price;
    }
    
    const sourceCurrency = fromCurrency || pivotCurrency;
    const targetCurrency = toCurrency || currentCurrency || pivotCurrency;
    
    // Validate exchange rates
    if (sourceCurrency.xtauxechange <= 0 || targetCurrency.xtauxechange <= 0) {
      console.warn('Invalid exchange rate detected:', {
        source: sourceCurrency.xtauxechange,
        target: targetCurrency.xtauxechange
      });
      return price; // Return original price as fallback
    }
    
    // If same currency, no conversion needed
    if (sourceCurrency.xdeviseid === targetCurrency.xdeviseid) {
      return price;
    }

    try {
      // If source is pivot currency
      if (sourceCurrency.xispivot) {
        return price * targetCurrency.xtauxechange;
      }
      
      // If target is pivot currency
      if (targetCurrency.xispivot) {
        return price / sourceCurrency.xtauxechange;
      }
      
      // Convert between two non-pivot currencies
      // First convert to pivot, then to target
      const priceInPivot = price / sourceCurrency.xtauxechange;
      return priceInPivot * targetCurrency.xtauxechange;
    } catch (error) {
      console.error('Error during currency conversion:', error);
      return price; // Return original price as fallback
    }
  };

  // Format price with currency symbol and decimal places
  const formatPrice = (
    price: number,
    fromCurrency?: Currency,
    toCurrency?: Currency
  ): string => {
    // Validate input price
    if (typeof price !== 'number' || isNaN(price)) {
      console.warn('Invalid price provided to formatPrice:', price);
      return '0.00';
    }

    // Determine source and target currencies
    const sourceCurrency = fromCurrency || pivotCurrency;
    const targetCurrency = toCurrency || currentCurrency;
    
    if (!targetCurrency) {
      console.warn('No target currency available for formatting');
      return price.toString();
    }

    try {
      const convertedPrice = convertPrice(price, sourceCurrency, targetCurrency);
      const decimalPlaces = targetCurrency.xdevisenbrdec || 2;
      
      // Format the number with appropriate decimal places
      const formattedNumber = convertedPrice.toFixed(decimalPlaces);
      
      // Add currency symbol/code
      return `${formattedNumber} ${targetCurrency.xdevisecodealpha}`;
    } catch (error) {
      console.error('Error formatting price:', error);
      // Fallback formatting
      const decimalPlaces = targetCurrency.xdevisenbrdec || 2;
      return `${price.toFixed(decimalPlaces)} ${targetCurrency.xdevisecodealpha}`;
    }
  };

  const contextValue: CurrencyContextType = {
    currencies,
    currentCurrency,
    pivotCurrency,
    isLoading,
    error: error as Error | null,
    setCurrency,
    convertPrice,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};
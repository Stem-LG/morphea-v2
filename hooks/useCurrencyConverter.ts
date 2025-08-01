import { useCallback } from 'react';

export function useCurrencyConverter(currencyOne: string, currencyTwo: string, rate: number) {
  
  // Convert from currency one to currency two
  const convert = useCallback((valueOne: number): number => {
    return parseFloat((valueOne * rate).toFixed(2));
  }, [rate]);

  // Convert back from currency two to currency one
  const convertBack = useCallback((valueTwo: number): number => {
    return parseFloat((valueTwo / rate).toFixed(2));
  }, [rate]);

  return {
    convert,
    convertBack,
    currencyOne,
    currencyTwo,
    rate
  };
}
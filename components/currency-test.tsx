"use client";

import { useCurrency } from '@/hooks/useCurrency';

export const CurrencyTest = () => {
  const { 
    currencies, 
    currentCurrency, 
    pivotCurrency, 
    isLoading, 
    error, 
    setCurrency, 
    convertPrice, 
    formatPrice 
  } = useCurrency();

  if (isLoading) return <div>Loading currencies...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const testPrice = 100; // Test with 100 units in pivot currency

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Currency System Test</h3>
      
      <div className="space-y-2 mb-4">
        <p><strong>Total Currencies:</strong> {currencies.length}</p>
        <p><strong>Pivot Currency:</strong> {pivotCurrency?.xdeviseintitule} ({pivotCurrency?.xdevisecodealpha})</p>
        <p><strong>Current Currency:</strong> {currentCurrency?.xdeviseintitule} ({currentCurrency?.xdevisecodealpha})</p>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Price Conversion Test (Base: {testPrice} {pivotCurrency?.xdevisecodealpha})</h4>
        <div className="space-y-1">
          {currencies.map((currency) => (
            <div key={currency.xdeviseid} className="flex justify-between">
              <span>{currency.xdeviseintitule}:</span>
              <span>{formatPrice(testPrice, currency)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Currency Selector</h4>
        <select 
          value={currentCurrency?.xdeviseid || ''} 
          onChange={(e) => {
            const selectedCurrency = currencies.find(c => c.xdeviseid.toString() === e.target.value);
            if (selectedCurrency) setCurrency(selectedCurrency);
          }}
          className="w-full p-2 border rounded"
        >
          {currencies.map((currency) => (
            <option key={currency.xdeviseid} value={currency.xdeviseid}>
              {currency.xdeviseintitule} ({currency.xdevisecodealpha})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Current Price Display</h4>
        <p className="text-xl font-bold">{formatPrice(testPrice)}</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Currency Details</h4>
        <div className="text-sm space-y-1">
          {currencies.map((currency) => (
            <div key={currency.xdeviseid} className="flex justify-between">
              <span>{currency.xdevisecodealpha}:</span>
              <span>
                Rate: {currency.xtauxechange}, 
                Decimals: {currency.xdevisenbrdec}, 
                {currency.xispivot ? 'PIVOT' : 'Regular'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
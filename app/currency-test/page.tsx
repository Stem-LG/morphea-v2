"use client";

import { CurrencySwitcher } from "@/components/currency-switcher";
import { useCurrency } from "@/hooks/useCurrency";
import { useLanguage } from "@/hooks/useLanguage";

export default function CurrencyTestPage() {
  const { currentCurrency, currencies, isLoading, formatPrice } = useCurrency();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Currency Switcher Test
        </h1>
        
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Currency Switcher Component</h2>
          <div className="flex justify-center">
            <CurrencySwitcher />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Current Currency Info</h3>
            {isLoading ? (
              <p className="text-gray-300">Loading currencies...</p>
            ) : currentCurrency ? (
              <div className="space-y-2 text-gray-300">
                <p><strong>Name:</strong> {currentCurrency.xdeviseintitule}</p>
                <p><strong>Code:</strong> {currentCurrency.xdevisecodealpha}</p>
                <p><strong>Numeric Code:</strong> {currentCurrency.xdevisecodenum}</p>
                <p><strong>Decimal Places:</strong> {currentCurrency.xdevisenbrdec}</p>
                <p><strong>Exchange Rate:</strong> {currentCurrency.xtauxechange}</p>
                <p><strong>Is Pivot:</strong> {currentCurrency.xispivot ? 'Yes' : 'No'}</p>
                <p><strong>Payment Enabled:</strong> {currentCurrency.xdeviseboolautorisepaiement === 'true' ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <p className="text-gray-300">No currency selected</p>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Price Formatting Test</h3>
            <div className="space-y-2 text-gray-300">
              <p><strong>100 units:</strong> {formatPrice(100)}</p>
              <p><strong>1500.50 units:</strong> {formatPrice(1500.50)}</p>
              <p><strong>25.99 units:</strong> {formatPrice(25.99)}</p>
              <p><strong>0.99 units:</strong> {formatPrice(0.99)}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 md:col-span-2">
            <h3 className="text-xl font-semibold text-white mb-4">Available Currencies ({currencies.length})</h3>
            {isLoading ? (
              <p className="text-gray-300">Loading currencies...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencies.map((currency) => (
                  <div 
                    key={currency.xdeviseid} 
                    className={`p-3 rounded border ${
                      currentCurrency?.xdeviseid === currency.xdeviseid 
                        ? 'border-morpheus-gold-light bg-morpheus-gold-light/20' 
                        : 'border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="text-white font-medium">{currency.xdevisecodealpha}</div>
                    <div className="text-gray-300 text-sm truncate">{currency.xdeviseintitule}</div>
                    <div className="text-gray-400 text-xs">Rate: {currency.xtauxechange}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-300">
            Switch currencies using the dropdown above to see the changes reflected in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
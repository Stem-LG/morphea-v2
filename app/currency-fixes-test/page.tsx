"use client";

import { useState, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';

// Mock cart item data for testing
const mockCartItems = [
  {
    ypanierid: 1,
    ypanierqte: 2,
    yvarprod: {
      yvarprodid: 1,
      yvarprodintitule: "Test Product USD",
      yvarprodprixcatalogue: 100,
      yvarprodprixpromotion: 80,
      xdeviseidfk: 1, // USD currency
    }
  },
  {
    ypanierid: 2,
    ypanierqte: 1,
    yvarprod: {
      yvarprodid: 2,
      yvarprodintitule: "Test Product EUR",
      yvarprodprixcatalogue: 90,
      yvarprodprixpromotion: null,
      xdeviseidfk: 2, // EUR currency
    }
  },
  {
    ypanierid: 3,
    ypanierqte: 3,
    yvarprod: {
      yvarprodid: 3,
      yvarprodintitule: "Test Product TND",
      yvarprodprixcatalogue: 250,
      yvarprodprixpromotion: 200,
      xdeviseidfk: 3, // TND currency
    }
  }
];

export default function CurrencyFixesTestPage() {
  const { 
    currencies, 
    currentCurrency, 
    pivotCurrency, 
    formatPrice, 
    convertPrice, 
    setCurrency,
    isLoading 
  } = useCurrency();
  
  const [testResults, setTestResults] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Calculate cart total with proper currency conversion
  const calculateCartTotal = () => {
    return mockCartItems.reduce((total, item) => {
      if (!item.yvarprod) return total;
      
      const productCurrency = currencies.find(c => c.xdeviseid === item.yvarprod?.xdeviseidfk);
      const price = item.yvarprod.yvarprodprixpromotion || item.yvarprod.yvarprodprixcatalogue || 0;
      
      // Convert price from product currency to current currency
      const convertedPrice = convertPrice(price, productCurrency);
      
      return total + convertedPrice * item.ypanierqte;
    }, 0);
  };

  // Run comprehensive tests
  const runTests = () => {
    if (!currencies.length || !currentCurrency || !pivotCurrency) return;

    const results = [];

    // Test 1: Currency conversion validation
    results.push({
      test: "Currency Conversion Validation",
      description: "Test exchange rate validation and error handling",
      results: [
        {
          name: "Valid conversion (100 USD to current currency)",
          value: convertPrice(100, currencies.find(c => c.xdevisecodealpha === 'USD')),
          expected: "Should return converted value > 0"
        },
        {
          name: "Invalid price handling (NaN)",
          value: convertPrice(NaN, currencies.find(c => c.xdevisecodealpha === 'USD')),
          expected: "Should return 0"
        },
        {
          name: "Negative price handling",
          value: convertPrice(-50, currencies.find(c => c.xdevisecodealpha === 'USD')),
          expected: "Should return 0"
        }
      ]
    });

    // Test 2: Format price with source currency
    results.push({
      test: "Format Price with Source Currency",
      description: "Test formatPrice function with fromCurrency parameter",
      results: [
        {
          name: "Format 100 USD",
          value: formatPrice(100, currencies.find(c => c.xdevisecodealpha === 'USD')),
          expected: "Should show converted price in current currency"
        },
        {
          name: "Format 90 EUR", 
          value: formatPrice(90, currencies.find(c => c.xdevisecodealpha === 'EUR')),
          expected: "Should show converted price in current currency"
        },
        {
          name: "Format invalid price",
          value: formatPrice(NaN, currencies.find(c => c.xdevisecodealpha === 'USD')),
          expected: "Should return '0.00'"
        }
      ]
    });

    // Test 3: Cart total calculation
    const totalValue = calculateCartTotal();
    results.push({
      test: "Cart Total Calculation",
      description: "Test cart total with mixed currencies",
      results: [
        {
          name: "Mixed currency cart total",
          value: formatPrice(totalValue),
          expected: "Should show total in current currency",
          breakdown: mockCartItems.map(item => {
            const productCurrency = currencies.find(c => c.xdeviseid === item.yvarprod?.xdeviseidfk);
            const price = item.yvarprod.yvarprodprixpromotion || item.yvarprod.yvarprodprixcatalogue || 0;
            const convertedPrice = convertPrice(price, productCurrency);
            return {
              product: item.yvarprod.yvarprodintitule,
              originalPrice: `${price} ${productCurrency?.xdevisecodealpha}`,
              convertedPrice: formatPrice(convertedPrice),
              quantity: item.ypanierqte,
              subtotal: formatPrice(convertedPrice * item.ypanierqte)
            };
          })
        }
      ]
    });

    // Test 4: Error handling
    results.push({
      test: "Error Handling",
      description: "Test graceful error handling",
      results: [
        {
          name: "Conversion with null currency",
          value: convertPrice(100, null),
          expected: "Should return original price or handle gracefully"
        },
        {
          name: "Format with null currency",
          value: formatPrice(100, null),
          expected: "Should return formatted string or handle gracefully"
        }
      ]
    });

    setTestResults(results);
    setCartTotal(totalValue);
  };

  useEffect(() => {
    if (!isLoading && currencies.length > 0) {
      runTests();
    }
  }, [currencies, currentCurrency, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent mb-4">
            Currency Fixes Test Suite
          </h1>
          <p className="text-gray-300 mb-6">
            Comprehensive testing of currency conversion fixes
          </p>
          
          {/* Currency Info */}
          <div className="bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border border-morpheus-gold-dark/30 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
              <div>
                <strong>Current Currency:</strong><br />
                {currentCurrency?.xdevisecodealpha} ({currentCurrency?.xdeviseintitule})
              </div>
              <div>
                <strong>Pivot Currency:</strong><br />
                {pivotCurrency?.xdevisecodealpha} ({pivotCurrency?.xdeviseintitule})
              </div>
              <div>
                <strong>Available Currencies:</strong><br />
                {currencies.length} currencies loaded
              </div>
            </div>
          </div>

          {/* Currency Switcher */}
          <div className="mb-6">
            <h3 className="text-white mb-2">Test with different currencies:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {currencies.map((currency) => (
                <Button
                  key={currency.xdeviseid}
                  onClick={() => setCurrency(currency)}
                  variant={currentCurrency?.xdeviseid === currency.xdeviseid ? "default" : "outline"}
                  className="text-sm"
                >
                  {currency.xdevisecodealpha}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={runTests} className="mb-8">
            Run Tests Again
          </Button>
        </div>

        {/* Test Results */}
        <div className="space-y-6">
          {testResults.map((testGroup, groupIndex) => (
            <div
              key={groupIndex}
              className="bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border border-morpheus-gold-dark/30 p-6 rounded-lg"
            >
              <h2 className="text-xl font-semibold text-morpheus-gold-light mb-2">
                {testGroup.test}
              </h2>
              <p className="text-gray-300 mb-4">{testGroup.description}</p>
              
              <div className="space-y-3">
                {testGroup.results.map((result, resultIndex) => (
                  <div key={resultIndex} className="bg-morpheus-blue-dark/40 p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-white">{result.name}:</strong>
                      <span className="text-morpheus-gold-light font-mono">
                        {typeof result.value === 'number' ? result.value.toFixed(4) : result.value}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{result.expected}</p>
                    
                    {/* Show breakdown for cart total */}
                    {result.breakdown && (
                      <div className="mt-3 space-y-2">
                        <h4 className="text-white font-medium">Breakdown:</h4>
                        {result.breakdown.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="bg-morpheus-blue-dark/60 p-2 rounded text-sm">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-gray-300">
                              <div><strong>{item.product}</strong></div>
                              <div>Original: {item.originalPrice}</div>
                              <div>Converted: {item.convertedPrice}</div>
                              <div>Qty: {item.quantity}</div>
                              <div>Subtotal: {item.subtotal}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gradient-to-br from-green-900/60 to-green-800/40 border border-green-600/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-green-400 mb-4">
            ✅ Critical Fixes Implemented
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <h3 className="font-medium text-green-300 mb-2">Fixed Issues:</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ Cart total calculation now uses currency conversion</li>
                <li>✅ formatPrice accepts fromCurrency parameter</li>
                <li>✅ Added exchange rate validation (must be {'>'} 0)</li>
                <li>✅ Added error handling for invalid prices</li>
                <li>✅ Added fallback mechanisms for missing data</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-300 mb-2">Current Cart Total:</h3>
              <div className="text-2xl font-bold text-green-400">
                {formatPrice(cartTotal)}
              </div>
              <p className="text-sm text-gray-300 mt-1">
                (Calculated from {mockCartItems.length} items with mixed currencies)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
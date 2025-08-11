"use client";

import { useCurrency } from '@/hooks/useCurrency';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';

export const CurrencySwitcher = () => {
  const { currencies, currentCurrency, setCurrency, isLoading } = useCurrency();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Show loading state while currencies are being fetched
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-300 px-3 py-2 rounded-md">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
        <span className="hidden sm:inline text-sm font-medium">
          {t('common.loading')}
        </span>
      </div>
    );
  }

  // Handle error state gracefully
  if (!currencies || currencies.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 px-3 py-2 rounded-md">
        <span className="text-sm font-medium">
          {t('common.error')}
        </span>
      </div>
    );
  }

  // Get currency symbol from the currency code
  const getCurrencySymbol = (currencyCode: string) => {
    const symbolMap: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'TND': 'د.ت',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RUB': '₽',
      'BRL': 'R$',
      'INR': '₹',
      'KRW': '₩',
      'SGD': 'S$',
      'HKD': 'HK$',
      'MXN': '$',
      'ZAR': 'R',
      'THB': '฿',
      'MYR': 'RM',
      'IDR': 'Rp',
      'PHP': '₱',
      'VND': '₫',
      'AED': 'د.إ',
      'SAR': 'ر.س',
      'QAR': 'ر.ق',
      'KWD': 'د.ك',
      'BHD': 'د.ب',
      'OMR': 'ر.ع',
      'JOD': 'د.أ',
      'LBP': 'ل.ل',
      'EGP': 'ج.م',
      'MAD': 'د.م',
      'DZD': 'د.ج',
      'LYD': 'د.ل',
      'SDG': 'ج.س',
      'IQD': 'ع.د',
      'SYP': 'ل.س',
      'YER': 'ر.ي',
      'AFN': '؋',
      'PKR': '₨',
      'BDT': '৳',
      'LKR': '₨',
      'NPR': '₨',
      'BTN': 'Nu.',
      'MVR': 'Rf',
      'IRR': '﷼',
      'TRY': '₺',
      'GEL': '₾',
      'AMD': '֏',
      'AZN': '₼',
      'KZT': '₸',
      'KGS': 'с',
      'TJS': 'ЅМ',
      'TMT': 'T',
      'UZS': 'so\'m',
      'MNT': '₮',
      'KPW': '₩',
      'LAK': '₭',
      'KHR': '៛',
      'MMK': 'K',
      'BND': 'B$',
      'FJD': 'FJ$',
      'PGK': 'K',
      'SBD': 'SI$',
      'TOP': 'T$',
      'VUV': 'VT',
      'WST': 'WS$',
      'XPF': '₣',
      'NCL': '₣',
      'ETB': 'Br',
      'KES': 'KSh',
      'UGX': 'USh',
      'TZS': 'TSh',
      'RWF': 'FRw',
      'BIF': 'FBu',
      'DJF': 'Fdj',
      'ERN': 'Nfk',
      'SOS': 'S',
      'XOF': 'CFA',
      'XAF': 'FCFA',
      'GMD': 'D',
      'GHS': 'GH₵',
      'GNF': 'FG',
      'LRD': 'L$',
      'SLE': 'Le',
      'NGN': '₦',
      'CVE': '$',
      'STP': 'Db',
      'MRU': 'UM',
      'CDF': 'FC',
      'AOA': 'Kz',
      'BWP': 'P',
      'LSL': 'L',
      'SZL': 'L',
      'NAD': 'N$',
      'ZMW': 'ZK',
      'ZWL': 'Z$',
      'MWK': 'MK',
      'MZN': 'MT',
      'MGA': 'Ar',
      'KMF': 'CF',
      'SCR': '₨',
      'MUR': '₨'
    };
    return symbolMap[currencyCode] || currencyCode;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md"
        aria-label={t('common.currency')}
      >
        <span className="text-lg font-medium">
          {currentCurrency ? getCurrencySymbol(currentCurrency.xdevisecodealpha) : '¤'}
        </span>
        <span className="hidden sm:inline text-sm font-medium">
          {currentCurrency ? `${currentCurrency.xdevisecodealpha}` : t('common.selectCurrency')}
        </span>
        <svg
          className={`w-4 h-4 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20 max-h-80 overflow-y-auto">
            <div className="py-1">
              {currencies.map((currency) => (
                <button
                  key={currency.xdeviseid}
                  onClick={() => {
                    setCurrency(currency);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-2 text-left text-sm transition-colors ${
                    currentCurrency?.xdeviseid === currency.xdeviseid
                      ? 'bg-morpheus-blue-light text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium w-6 text-center">
                      {getCurrencySymbol(currency.xdevisecodealpha)}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{currency.xdevisecodealpha}</span>
                      <span className="text-xs text-gray-400 truncate max-w-[180px]">
                        {currency.xdeviseintitule}
                      </span>
                    </div>
                  </div>
                  {currentCurrency?.xdeviseid === currency.xdeviseid && (
                    <svg
                      className="w-4 h-4 ml-auto text-morpheus-gold-light flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
'use client'

import { CurrencySwitcher } from '@/app/_components/nav_bar/currency-switcher'
import { useCurrency } from '@/hooks/useCurrency'
// import { useLanguage } from "@/hooks/useLanguage"; // TODO: Add translations when needed

export default function CurrencyTestPage() {
    const { currentCurrency, currencies, isLoading, formatPrice } =
        useCurrency()
    // const { t } = useLanguage(); // TODO: Add translations when needed

    return (
        <div className="from-morpheus-blue-dark to-morpheus-blue-light min-h-screen bg-gradient-to-br p-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-center text-4xl font-bold text-white">
                    Currency Switcher Test
                </h1>

                <div className="mb-8 rounded-lg bg-white/10 p-6 backdrop-blur-md">
                    <h2 className="mb-4 text-2xl font-semibold text-white">
                        Currency Switcher Component
                    </h2>
                    <div className="flex justify-center">
                        <CurrencySwitcher />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-lg bg-white/10 p-6 backdrop-blur-md">
                        <h3 className="mb-4 text-xl font-semibold text-white">
                            Current Currency Info
                        </h3>
                        {isLoading ? (
                            <p className="text-gray-300">
                                Loading currencies...
                            </p>
                        ) : currentCurrency ? (
                            <div className="space-y-2 text-gray-300">
                                <p>
                                    <strong>Name:</strong>{' '}
                                    {currentCurrency.xdeviseintitule}
                                </p>
                                <p>
                                    <strong>Code:</strong>{' '}
                                    {currentCurrency.xdevisecodealpha}
                                </p>
                                <p>
                                    <strong>Numeric Code:</strong>{' '}
                                    {currentCurrency.xdevisecodenum}
                                </p>
                                <p>
                                    <strong>Decimal Places:</strong>{' '}
                                    {currentCurrency.xdevisenbrdec}
                                </p>
                                <p>
                                    <strong>Exchange Rate:</strong>{' '}
                                    {currentCurrency.xtauxechange}
                                </p>
                                <p>
                                    <strong>Is Pivot:</strong>{' '}
                                    {currentCurrency.xispivot ? 'Yes' : 'No'}
                                </p>
                                <p>
                                    <strong>Payment Enabled:</strong>{' '}
                                    {currentCurrency.xdeviseboolautorisepaiement ===
                                    'true'
                                        ? 'Yes'
                                        : 'No'}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-300">
                                No currency selected
                            </p>
                        )}
                    </div>

                    <div className="rounded-lg bg-white/10 p-6 backdrop-blur-md">
                        <h3 className="mb-4 text-xl font-semibold text-white">
                            Price Formatting Test
                        </h3>
                        <div className="space-y-2 text-gray-300">
                            <p>
                                <strong>100 units:</strong> {formatPrice(100)}
                            </p>
                            <p>
                                <strong>1500.50 units:</strong>{' '}
                                {formatPrice(1500.5)}
                            </p>
                            <p>
                                <strong>25.99 units:</strong>{' '}
                                {formatPrice(25.99)}
                            </p>
                            <p>
                                <strong>0.99 units:</strong> {formatPrice(0.99)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white/10 p-6 backdrop-blur-md md:col-span-2">
                        <h3 className="mb-4 text-xl font-semibold text-white">
                            Available Currencies ({currencies.length})
                        </h3>
                        {isLoading ? (
                            <p className="text-gray-300">
                                Loading currencies...
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {currencies.map((currency) => (
                                    <div
                                        key={currency.xdeviseid}
                                        className={`rounded border p-3 ${
                                            currentCurrency?.xdeviseid ===
                                            currency.xdeviseid
                                                ? 'border-morpheus-gold-light bg-morpheus-gold-light/20'
                                                : 'border-gray-600 bg-gray-800/50'
                                        }`}
                                    >
                                        <div className="font-medium text-white">
                                            {currency.xdevisecodealpha}
                                        </div>
                                        <div className="truncate text-sm text-gray-300">
                                            {currency.xdeviseintitule}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Rate: {currency.xtauxechange}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-300">
                        Switch currencies using the dropdown above to see the
                        changes reflected in real-time.
                    </p>
                </div>
            </div>
        </div>
    )
}

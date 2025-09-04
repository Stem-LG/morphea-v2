'use client'

import { useCurrency } from '@/hooks/useCurrency'
import { useLanguage } from '@/hooks/useLanguage'

export const CurrencyTest = () => {
    const {
        currencies,
        currentCurrency,
        pivotCurrency,
        isLoading,
        error,
        setCurrency,
        formatPrice,
    } = useCurrency()

    const { language } = useLanguage()

    // Helper function to get currency name based on language
    const getCurrencyName = (currency: any) => {
        if (language === 'fr' && currency.xdeviseintitulefr) {
            return currency.xdeviseintitulefr
        }
        return currency.xdeviseintitule
    }

    if (isLoading) return <div>Loading currencies...</div>
    if (error) return <div>Error: {error.message}</div>

    const testPrice = 100 // Test with 100 units in pivot currency

    return (
        <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-4 text-lg font-semibold">Currency System Test</h3>

            <div className="mb-4 space-y-2">
                <p>
                    <strong>Total Currencies:</strong> {currencies.length}
                </p>
                <p>
                    <strong>Pivot Currency:</strong>{' '}
                    {pivotCurrency && getCurrencyName(pivotCurrency)} (
                    {pivotCurrency?.xdevisecodealpha})
                </p>
                <p>
                    <strong>Current Currency:</strong>{' '}
                    {currentCurrency && getCurrencyName(currentCurrency)} (
                    {currentCurrency?.xdevisecodealpha})
                </p>
            </div>

            <div className="mb-4">
                <h4 className="mb-2 font-medium">
                    Price Conversion Test (Base: {testPrice}{' '}
                    {pivotCurrency?.xdevisecodealpha})
                </h4>
                <div className="space-y-1">
                    {currencies.map((currency) => (
                        <div
                            key={currency.xdeviseid}
                            className="flex justify-between"
                        >
                            <span>{currency.xdeviseintitule}:</span>
                            <span>{formatPrice(testPrice, currency)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <h4 className="mb-2 font-medium">Currency Selector</h4>
                <select
                    value={currentCurrency?.xdeviseid || ''}
                    onChange={(e) => {
                        const selectedCurrency = currencies.find(
                            (c) => c.xdeviseid.toString() === e.target.value
                        )
                        if (selectedCurrency) setCurrency(selectedCurrency)
                    }}
                    className="w-full rounded border p-2"
                >
                    {currencies.map((currency) => (
                        <option
                            key={currency.xdeviseid}
                            value={currency.xdeviseid}
                        >
                            {getCurrencyName(currency)} (
                            {currency.xdevisecodealpha})
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <h4 className="mb-2 font-medium">Current Price Display</h4>
                <p className="text-xl font-bold">{formatPrice(testPrice)}</p>
            </div>

            <div>
                <h4 className="mb-2 font-medium">Currency Details</h4>
                <div className="space-y-1 text-sm">
                    {currencies.map((currency) => (
                        <div
                            key={currency.xdeviseid}
                            className="flex justify-between"
                        >
                            <span>{currency.xdevisecodealpha}:</span>
                            <span>
                                Rate: {currency.xtauxechange}, Decimals:{' '}
                                {currency.xdevisenbrdec},
                                {currency.xispivot ? 'PIVOT' : 'Regular'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

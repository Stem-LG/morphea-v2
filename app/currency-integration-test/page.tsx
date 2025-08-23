'use client'

import { useState } from 'react'
import { useCurrency } from '@/hooks/useCurrency'
// import { useLanguage } from "@/hooks/useLanguage"; // TODO: Add translations when needed
import { CurrencySwitcher } from '@/app/_components/nav_bar/currency-switcher'

// Mock product data for testing
const mockProductVariant = {
    yvarprodid: 1,
    yvarprodintitule: 'Test Product',
    yvarprodprixcatalogue: 100,
    yvarprodprixpromotion: 80,
    yvarprodpromotiondatedeb: '2024-01-01',
    yvarprodpromotiondatefin: '2024-12-31',
    yvarprodnbrjourlivraison: 5,
    yvarprodstatut: 'approved',
    xdeviseidfk: 1, // USD currency
    xcouleur: {
        xcouleurid: 1,
        xcouleurintitule: 'Red',
        xcouleurhexa: '#FF0000',
    },
    xtaille: {
        xtailleid: 1,
        xtailleintitule: 'M',
    },
    yvarprodmedia: [],
    yobjet3d: [],
}

const mockProductVariantEUR = {
    ...mockProductVariant,
    yvarprodid: 2,
    yvarprodintitule: 'Test Product EUR',
    yvarprodprixcatalogue: 90,
    yvarprodprixpromotion: 75,
    xdeviseidfk: 2, // EUR currency
}

export default function CurrencyIntegrationTestPage() {
    const {
        currencies,
        currentCurrency,
        pivotCurrency,
        isLoading,
        formatPrice,
        convertPrice,
        setCurrency,
    } = useCurrency()
    // const { t } = useLanguage(); // TODO: Add translations when needed

    const [selectedTestCurrency, setSelectedTestCurrency] = useState<
        number | null
    >(null)

    if (isLoading) {
        return (
            <div className="from-morpheus-blue-dark to-morpheus-blue-light flex min-h-screen items-center justify-center bg-gradient-to-br">
                <div className="border-morpheus-gold-dark h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
            </div>
        )
    }

    // Helper function to get formatted price for a product variant
    const getFormattedPrice = (
        variant: typeof mockProductVariant,
        usePromotion = true
    ) => {
        const productCurrency = currencies.find(
            (c) => c.xdeviseid === variant.xdeviseidfk
        )
        const price =
            usePromotion && variant.yvarprodprixpromotion
                ? variant.yvarprodprixpromotion
                : variant.yvarprodprixcatalogue

        return formatPrice(price, productCurrency)
    }

    const testCurrency = selectedTestCurrency
        ? currencies.find((c) => c.xdeviseid === selectedTestCurrency)
        : null

    return (
        <div className="from-morpheus-blue-dark to-morpheus-blue-light min-h-screen bg-gradient-to-br p-8">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-8 text-center text-4xl font-bold text-white">
                    Currency Integration Test
                </h1>

                {/* Currency Switcher */}
                <div className="mb-8 rounded-lg bg-white/10 p-6 backdrop-blur-md">
                    <h2 className="mb-4 text-2xl font-semibold text-white">
                        Currency Switcher
                    </h2>
                    <div className="flex justify-center">
                        <CurrencySwitcher />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Currency System Info */}
                    <div className="rounded-lg bg-white/10 p-6 backdrop-blur-md">
                        <h3 className="mb-4 text-xl font-semibold text-white">
                            Currency System Status
                        </h3>
                        <div className="space-y-2 text-gray-300">
                            <p>
                                <strong>Total Currencies:</strong>{' '}
                                {currencies.length}
                            </p>
                            <p>
                                <strong>Pivot Currency:</strong>{' '}
                                {pivotCurrency?.xdeviseintitule} (
                                {pivotCurrency?.xdevisecodealpha})
                            </p>
                            <p>
                                <strong>Current Currency:</strong>{' '}
                                {currentCurrency?.xdeviseintitule} (
                                {currentCurrency?.xdevisecodealpha})
                            </p>
                            <p>
                                <strong>Exchange Rate:</strong>{' '}
                                {currentCurrency?.xtauxechange}
                            </p>
                            <p>
                                <strong>Decimal Places:</strong>{' '}
                                {currentCurrency?.xdevisenbrdec}
                            </p>
                        </div>
                    </div>

                    {/* Price Conversion Test */}
                    <div className="rounded-lg bg-white/10 p-6 backdrop-blur-md">
                        <h3 className="mb-4 text-xl font-semibold text-white">
                            Price Conversion Test
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="mb-2 font-medium text-white">
                                    Test Currency:
                                </h4>
                                <select
                                    value={selectedTestCurrency || ''}
                                    onChange={(e) =>
                                        setSelectedTestCurrency(
                                            Number(e.target.value) || null
                                        )
                                    }
                                    className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white"
                                >
                                    <option value="">Select a currency</option>
                                    {currencies.map((currency) => (
                                        <option
                                            key={currency.xdeviseid}
                                            value={currency.xdeviseid}
                                        >
                                            {currency.xdeviseintitule} (
                                            {currency.xdevisecodealpha})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {testCurrency && (
                                <div className="space-y-2">
                                    <p className="text-gray-300">
                                        <strong>
                                            100 units in{' '}
                                            {testCurrency.xdevisecodealpha}:
                                        </strong>{' '}
                                        {formatPrice(100, testCurrency)}
                                    </p>
                                    <p className="text-gray-300">
                                        <strong>
                                            Converted to current currency:
                                        </strong>{' '}
                                        {formatPrice(
                                            convertPrice(
                                                100,
                                                testCurrency,
                                                currentCurrency
                                            )
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Price Display Test */}
                    <div className="rounded-lg bg-white/10 p-6 backdrop-blur-md lg:col-span-2">
                        <h3 className="mb-4 text-xl font-semibold text-white">
                            Product Price Display Test
                        </h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* USD Product */}
                            <div className="rounded-lg bg-white/5 p-4">
                                <h4 className="mb-2 font-medium text-white">
                                    Product in USD (Base Currency)
                                </h4>
                                <div className="space-y-2 text-gray-300">
                                    <p>
                                        <strong>Product:</strong>{' '}
                                        {mockProductVariant.yvarprodintitule}
                                    </p>
                                    <p>
                                        <strong>Base Currency:</strong> USD (ID:{' '}
                                        {mockProductVariant.xdeviseidfk})
                                    </p>
                                    <p>
                                        <strong>Catalog Price:</strong>{' '}
                                        {getFormattedPrice(
                                            mockProductVariant,
                                            false
                                        )}
                                    </p>
                                    <p>
                                        <strong>Promotion Price:</strong>{' '}
                                        {getFormattedPrice(
                                            mockProductVariant,
                                            true
                                        )}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-morpheus-gold-light text-lg font-bold">
                                            {getFormattedPrice(
                                                mockProductVariant,
                                                true
                                            )}
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                            {getFormattedPrice(
                                                mockProductVariant,
                                                false
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* EUR Product */}
                            <div className="rounded-lg bg-white/5 p-4">
                                <h4 className="mb-2 font-medium text-white">
                                    Product in EUR
                                </h4>
                                <div className="space-y-2 text-gray-300">
                                    <p>
                                        <strong>Product:</strong>{' '}
                                        {mockProductVariantEUR.yvarprodintitule}
                                    </p>
                                    <p>
                                        <strong>Base Currency:</strong> EUR (ID:{' '}
                                        {mockProductVariantEUR.xdeviseidfk})
                                    </p>
                                    <p>
                                        <strong>Catalog Price:</strong>{' '}
                                        {getFormattedPrice(
                                            mockProductVariantEUR,
                                            false
                                        )}
                                    </p>
                                    <p>
                                        <strong>Promotion Price:</strong>{' '}
                                        {getFormattedPrice(
                                            mockProductVariantEUR,
                                            true
                                        )}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-morpheus-gold-light text-lg font-bold">
                                            {getFormattedPrice(
                                                mockProductVariantEUR,
                                                true
                                            )}
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                            {getFormattedPrice(
                                                mockProductVariantEUR,
                                                false
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All Currencies Display */}
                    <div className="rounded-lg bg-white/10 p-6 backdrop-blur-md lg:col-span-2">
                        <h3 className="mb-4 text-xl font-semibold text-white">
                            All Available Currencies
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {currencies.map((currency) => (
                                <div
                                    key={currency.xdeviseid}
                                    className={`cursor-pointer rounded border p-3 transition-all ${
                                        currentCurrency?.xdeviseid ===
                                        currency.xdeviseid
                                            ? 'border-morpheus-gold-light bg-morpheus-gold-light/20'
                                            : 'hover:border-morpheus-gold-light/50 border-gray-600 bg-gray-800/50'
                                    }`}
                                    onClick={() => setCurrency(currency)}
                                >
                                    <div className="font-medium text-white">
                                        {currency.xdevisecodealpha}
                                    </div>
                                    <div className="truncate text-sm text-gray-300">
                                        {currency.xdeviseintitule}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Rate: {currency.xtauxechange} |
                                        Decimals: {currency.xdevisenbrdec}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {currency.xispivot
                                            ? 'PIVOT'
                                            : 'Regular'}{' '}
                                        | Payment:{' '}
                                        {currency.xdeviseboolautorisepaiement ===
                                        'Y'
                                            ? 'Yes'
                                            : 'No'}
                                    </div>
                                    <div className="text-morpheus-gold-light mt-2 text-sm">
                                        100 units = {formatPrice(100, currency)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 rounded-lg bg-white/10 p-6 backdrop-blur-md">
                    <h3 className="mb-4 text-xl font-semibold text-white">
                        Testing Instructions
                    </h3>
                    <div className="space-y-2 text-gray-300">
                        <p>
                            1. <strong>Switch currencies</strong> using the
                            dropdown above to see real-time price updates
                        </p>
                        <p>
                            2. <strong>Test conversion</strong> by selecting
                            different currencies in the conversion test
                        </p>
                        <p>
                            3. <strong>Verify product prices</strong> update
                            correctly when switching currencies
                        </p>
                        <p>
                            4. <strong>Check promotion logic</strong> -
                            promotion prices should maintain the same discount
                            ratio
                        </p>
                        <p>
                            5. <strong>Validate formatting</strong> - prices
                            should display with correct decimal places and
                            currency symbols
                        </p>
                        <p>
                            6. <strong>Test different base currencies</strong> -
                            products with different base currencies should
                            convert properly
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

"use client";

import { useState } from "react";
import { useCurrency } from "@/hooks/useCurrency";
// import { useLanguage } from "@/hooks/useLanguage"; // TODO: Add translations when needed
import { CurrencySwitcher } from "@/components/currency-switcher";

// Mock product data for testing
const mockProductVariant = {
    yvarprodid: 1,
    yvarprodintitule: "Test Product",
    yvarprodprixcatalogue: 100,
    yvarprodprixpromotion: 80,
    yvarprodpromotiondatedeb: "2024-01-01",
    yvarprodpromotiondatefin: "2024-12-31",
    yvarprodnbrjourlivraison: 5,
    yvarprodstatut: "approved",
    xdeviseidfk: 1, // USD currency
    xcouleur: {
        xcouleurid: 1,
        xcouleurintitule: "Red",
        xcouleurhexa: "#FF0000"
    },
    xtaille: {
        xtailleid: 1,
        xtailleintitule: "M"
    },
    yvarprodmedia: [],
    yobjet3d: []
};

const mockProductVariantEUR = {
    ...mockProductVariant,
    yvarprodid: 2,
    yvarprodintitule: "Test Product EUR",
    yvarprodprixcatalogue: 90,
    yvarprodprixpromotion: 75,
    xdeviseidfk: 2, // EUR currency
};

export default function CurrencyIntegrationTestPage() {
    const { 
        currencies, 
        currentCurrency, 
        pivotCurrency, 
        isLoading, 
        formatPrice, 
        convertPrice,
        setCurrency 
    } = useCurrency();
    // const { t } = useLanguage(); // TODO: Add translations when needed
    
    const [selectedTestCurrency, setSelectedTestCurrency] = useState<number | null>(null);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-morpheus-gold-dark border-t-transparent animate-spin rounded-full"></div>
            </div>
        );
    }

    // Helper function to get formatted price for a product variant
    const getFormattedPrice = (variant: typeof mockProductVariant, usePromotion = true) => {
        const productCurrency = currencies.find(c => c.xdeviseid === variant.xdeviseidfk);
        const price = usePromotion && variant.yvarprodprixpromotion 
            ? variant.yvarprodprixpromotion 
            : variant.yvarprodprixcatalogue;
        
        return formatPrice(price, productCurrency);
    };

    const testCurrency = selectedTestCurrency ? currencies.find(c => c.xdeviseid === selectedTestCurrency) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">
                    Currency Integration Test
                </h1>
                
                {/* Currency Switcher */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Currency Switcher</h2>
                    <div className="flex justify-center">
                        <CurrencySwitcher />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Currency System Info */}
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Currency System Status</h3>
                        <div className="space-y-2 text-gray-300">
                            <p><strong>Total Currencies:</strong> {currencies.length}</p>
                            <p><strong>Pivot Currency:</strong> {pivotCurrency?.xdeviseintitule} ({pivotCurrency?.xdevisecodealpha})</p>
                            <p><strong>Current Currency:</strong> {currentCurrency?.xdeviseintitule} ({currentCurrency?.xdevisecodealpha})</p>
                            <p><strong>Exchange Rate:</strong> {currentCurrency?.xtauxechange}</p>
                            <p><strong>Decimal Places:</strong> {currentCurrency?.xdevisenbrdec}</p>
                        </div>
                    </div>

                    {/* Price Conversion Test */}
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Price Conversion Test</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-white mb-2">Test Currency:</h4>
                                <select 
                                    value={selectedTestCurrency || ''} 
                                    onChange={(e) => setSelectedTestCurrency(Number(e.target.value) || null)}
                                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600"
                                >
                                    <option value="">Select a currency</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.xdeviseid} value={currency.xdeviseid}>
                                            {currency.xdeviseintitule} ({currency.xdevisecodealpha})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {testCurrency && (
                                <div className="space-y-2">
                                    <p className="text-gray-300">
                                        <strong>100 units in {testCurrency.xdevisecodealpha}:</strong> {formatPrice(100, testCurrency)}
                                    </p>
                                    <p className="text-gray-300">
                                        <strong>Converted to current currency:</strong> {formatPrice(convertPrice(100, testCurrency, currentCurrency))}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Price Display Test */}
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 lg:col-span-2">
                        <h3 className="text-xl font-semibold text-white mb-4">Product Price Display Test</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* USD Product */}
                            <div className="bg-white/5 rounded-lg p-4">
                                <h4 className="font-medium text-white mb-2">Product in USD (Base Currency)</h4>
                                <div className="space-y-2 text-gray-300">
                                    <p><strong>Product:</strong> {mockProductVariant.yvarprodintitule}</p>
                                    <p><strong>Base Currency:</strong> USD (ID: {mockProductVariant.xdeviseidfk})</p>
                                    <p><strong>Catalog Price:</strong> {getFormattedPrice(mockProductVariant, false)}</p>
                                    <p><strong>Promotion Price:</strong> {getFormattedPrice(mockProductVariant, true)}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-lg font-bold text-morpheus-gold-light">
                                            {getFormattedPrice(mockProductVariant, true)}
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                            {getFormattedPrice(mockProductVariant, false)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* EUR Product */}
                            <div className="bg-white/5 rounded-lg p-4">
                                <h4 className="font-medium text-white mb-2">Product in EUR</h4>
                                <div className="space-y-2 text-gray-300">
                                    <p><strong>Product:</strong> {mockProductVariantEUR.yvarprodintitule}</p>
                                    <p><strong>Base Currency:</strong> EUR (ID: {mockProductVariantEUR.xdeviseidfk})</p>
                                    <p><strong>Catalog Price:</strong> {getFormattedPrice(mockProductVariantEUR, false)}</p>
                                    <p><strong>Promotion Price:</strong> {getFormattedPrice(mockProductVariantEUR, true)}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-lg font-bold text-morpheus-gold-light">
                                            {getFormattedPrice(mockProductVariantEUR, true)}
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                            {getFormattedPrice(mockProductVariantEUR, false)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All Currencies Display */}
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 lg:col-span-2">
                        <h3 className="text-xl font-semibold text-white mb-4">All Available Currencies</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {currencies.map((currency) => (
                                <div 
                                    key={currency.xdeviseid} 
                                    className={`p-3 rounded border cursor-pointer transition-all ${
                                        currentCurrency?.xdeviseid === currency.xdeviseid 
                                            ? 'border-morpheus-gold-light bg-morpheus-gold-light/20' 
                                            : 'border-gray-600 bg-gray-800/50 hover:border-morpheus-gold-light/50'
                                    }`}
                                    onClick={() => setCurrency(currency)}
                                >
                                    <div className="text-white font-medium">{currency.xdevisecodealpha}</div>
                                    <div className="text-gray-300 text-sm truncate">{currency.xdeviseintitule}</div>
                                    <div className="text-gray-400 text-xs">
                                        Rate: {currency.xtauxechange} | Decimals: {currency.xdevisenbrdec}
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        {currency.xispivot ? 'PIVOT' : 'Regular'} | 
                                        Payment: {currency.xdeviseboolautorisepaiement === 'Y' ? 'Yes' : 'No'}
                                    </div>
                                    <div className="mt-2 text-morpheus-gold-light text-sm">
                                        100 units = {formatPrice(100, currency)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Testing Instructions</h3>
                    <div className="text-gray-300 space-y-2">
                        <p>1. <strong>Switch currencies</strong> using the dropdown above to see real-time price updates</p>
                        <p>2. <strong>Test conversion</strong> by selecting different currencies in the conversion test</p>
                        <p>3. <strong>Verify product prices</strong> update correctly when switching currencies</p>
                        <p>4. <strong>Check promotion logic</strong> - promotion prices should maintain the same discount ratio</p>
                        <p>5. <strong>Validate formatting</strong> - prices should display with correct decimal places and currency symbols</p>
                        <p>6. <strong>Test different base currencies</strong> - products with different base currencies should convert properly</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
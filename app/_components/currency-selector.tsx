'use client'

import { useCurrency } from '@/hooks/useCurrency'
import { useLanguage } from '@/hooks/useLanguage'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export const CurrencySelector = () => {
    const { currencies, currentCurrency, setCurrency } = useCurrency()
    const { language } = useLanguage()

    // Helper function to get currency name based on language
    const getCurrencyName = (currency: any) => {
        if (language === 'fr' && currency.xdeviseintitulefr) {
            return currency.xdeviseintitulefr
        }
        return currency.xdeviseintitule
    }

    return (
        <Select
            value={currentCurrency?.xdeviseid.toString()}
            onValueChange={(value) => {
                const currency = currencies.find(
                    (c) => c.xdeviseid.toString() === value
                )
                if (currency) {
                    setCurrency(currency)
                }
            }}
        >
            <SelectTrigger className="w-20 md:w-[120px] border-gray-300 bg-white">
                <SelectValue>
                    {currentCurrency && (
                        <span className="font-medium">
                            {currentCurrency.xdevisecodealpha}
                        </span>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {currencies.map((currency) => (
                    <SelectItem
                        key={currency.xdeviseid}
                        value={currency.xdeviseid.toString()}
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">
                                {currency.xdevisecodealpha}
                            </span>
                            <span className="max-w-[180px] truncate text-xs text-gray-400">
                                {getCurrencyName(currency)}
                            </span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
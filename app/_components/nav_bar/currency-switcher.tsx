'use client'

import { useCurrency } from '@/hooks/useCurrency'
import { useLanguage } from '@/hooks/useLanguage'
import {
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

export const CurrencySwitcher = () => {
    const { currencies, currentCurrency, setCurrency } = useCurrency()
    const { t, language } = useLanguage()

    // Helper function to get currency name based on language
    const getCurrencyName = (currency: any) => {
        if (language === 'fr' && currency.xdeviseintitulefr) {
            return currency.xdeviseintitulefr
        }
        return currency.xdeviseintitule
    }

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <span className="flex-1">{t('common.currency')}</span>
                <span className="mr-2">
                    {currentCurrency && (
                        <span className="font-medium">
                            {currentCurrency.xdevisecodealpha}
                        </span>
                    )}
                </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
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
                    {currencies.map((currency) => (
                        <DropdownMenuRadioItem
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
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    )
}

'use client'

import { useCurrency } from '@/hooks/useCurrency'
import { useLanguage } from '@/hooks/useLanguage'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NavBarIconButton } from './navbar_icon_button'

export const CurrencySwitcher = () => {
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
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
                <NavBarIconButton>
                    <span className="text-sm font-semibold">
                        {currentCurrency?.xdevisecodealpha || 'EUR'}
                    </span>
                </NavBarIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="bottom"
                align="center"
                className="w-48 z-[90]"
            >
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
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

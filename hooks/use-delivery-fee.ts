'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/client'
import { useCurrency } from '@/hooks/useCurrency'

export function useDeliveryFee() {
  const supabase = createClient()
  const { convertPrice, currencies, currentCurrency } = useCurrency()

  return useQuery({
    queryKey: ['delivery-fee', currentCurrency?.xdeviseid],
    queryFn: async (): Promise<number> => {
      // Fetch both delivery fee and currency settings
      const { data: settings, error } = await supabase
        .schema('morpheus')
        .from('settings')
        .select('key, value')
        .in('key', ['delivery_fee', 'delivery_fee_currency_id'])

      if (error) {
        throw new Error(error.message)
      }


      // Create a map for easy lookup
      const settingsMap = new Map(settings.map(setting => [setting.key, setting.value]))

      // Get delivery fee amount
      const feeValue = settingsMap.get('delivery_fee')
      const fee = feeValue ? parseFloat(feeValue) : 10 // Default to 10

      if (isNaN(fee)) {
        return 10 // Fallback to default
      }

      // Get delivery fee currency
      const currencyIdValue = settingsMap.get('delivery_fee_currency_id')
      const currencyId = currencyIdValue ? parseInt(currencyIdValue) : null

      // If no currency is set or no current currency, return the raw fee
      if (!currencyId || !currentCurrency || currencies.length === 0) {
        return fee
      }

      // Find the delivery fee currency
      const deliveryFeeCurrency = currencies.find(c => c.xdeviseid === currencyId)

      // If delivery fee currency not found, return raw fee
      if (!deliveryFeeCurrency) {
        return fee
      }

      // Convert from delivery fee currency to user's current currency
      return convertPrice(fee, deliveryFeeCurrency, currentCurrency)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: currencies.length > 0, // Only run when currencies are loaded
  })
}

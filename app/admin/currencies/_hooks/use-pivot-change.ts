"use client";

import { useState } from "react";
import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase";

type Currency = Database['morpheus']['Tables']['xdevise']['Row'];

interface ExchangeRateInput {
  currencyId: number;
  currencyName: string;
  currencyCode: string;
  rate: string;
}

interface PivotChangeData {
  newPivotCurrencyId: number;
  exchangeRates: Record<number, number>; // currencyId -> rate
}

export function usePivotChange() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateInput[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const pivotChangeMutation = useMutation({
    mutationFn: async (data: PivotChangeData) => {
      const currentTime = new Date().toISOString();
      
      // First, set the new pivot currency
      const { error: pivotError } = await supabase
        .schema("morpheus")
        .from("xdevise")
        .update({
          xispivot: true,
          xtauxechange: 1.0,
          sysdate: currentTime,
          sysaction: 'update',
          sysuser: 'admin'
        })
        .eq("xdeviseid", data.newPivotCurrencyId);

      if (pivotError) {
        throw new Error(`Failed to set new pivot currency: ${pivotError.message}`);
      }

      // Then update all other currencies with their new rates and unset pivot
      for (const [currencyId, rate] of Object.entries(data.exchangeRates)) {
        const { error: updateError } = await supabase
          .schema("morpheus")
          .from("xdevise")
          .update({
            xispivot: false,
            xtauxechange: rate,
            sysdate: currentTime,
            sysaction: 'update',
            sysuser: 'admin'
          })
          .eq("xdeviseid", parseInt(currencyId));

        if (updateError) {
          throw new Error(`Failed to update currency ${currencyId}: ${updateError.message}`);
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      toast.success("Pivot currency changed successfully", {
        description: `${selectedCurrency?.xdeviseintitule} is now the pivot currency with all exchange rates updated.`
      });
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to change pivot currency", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  });

  const openPivotChangeDialog = (currency: Currency, allCurrencies: Currency[]) => {
    setSelectedCurrency(currency);
    
    // Initialize exchange rates for all other currencies (excluding the new pivot)
    const otherCurrencies = allCurrencies.filter(c => c.xdeviseid !== currency.xdeviseid);
    const initialRates: ExchangeRateInput[] = otherCurrencies.map(c => ({
      currencyId: c.xdeviseid,
      currencyName: c.xdeviseintitule || '',
      currencyCode: c.xdevisecodealpha || '',
      rate: '' // Start with empty string to force user input
    }));
    
    setExchangeRates(initialRates);
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCurrency(null);
    setExchangeRates([]);
    setErrors({});
  };

  const updateExchangeRate = (currencyId: number, value: string) => {
    setExchangeRates(prev => 
      prev.map(rate => 
        rate.currencyId === currencyId 
          ? { ...rate, rate: value }
          : rate
      )
    );
    
    // Clear error for this currency when user starts typing
    if (errors[currencyId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[currencyId];
        return newErrors;
      });
    }
  };

  const validateExchangeRates = (): boolean => {
    const newErrors: Record<number, string> = {};
    let isValid = true;

    exchangeRates.forEach(rateInput => {
      const { currencyId, rate } = rateInput;
      
      // Check if rate is empty
      if (!rate.trim()) {
        newErrors[currencyId] = "Exchange rate is required";
        isValid = false;
        return;
      }

      // Check if rate is a valid positive number
      const numericRate = parseFloat(rate);
      if (isNaN(numericRate) || numericRate <= 0) {
        newErrors[currencyId] = "Exchange rate must be a positive number";
        isValid = false;
        return;
      }

      // Check decimal places (max 4)
      const decimalPlaces = (rate.split('.')[1] || '').length;
      if (decimalPlaces > 4) {
        newErrors[currencyId] = "Exchange rate can have at most 4 decimal places";
        isValid = false;
        return;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitPivotChange = () => {
    if (!selectedCurrency) return;

    if (!validateExchangeRates()) {
      toast.error("Please fix the validation errors before proceeding");
      return;
    }

    // Convert exchange rates to the format expected by the mutation
    const exchangeRatesData: Record<number, number> = {};
    exchangeRates.forEach(rateInput => {
      exchangeRatesData[rateInput.currencyId] = parseFloat(rateInput.rate);
    });

    pivotChangeMutation.mutate({
      newPivotCurrencyId: selectedCurrency.xdeviseid,
      exchangeRates: exchangeRatesData
    });
  };

  return {
    // State
    isDialogOpen,
    selectedCurrency,
    exchangeRates,
    errors,
    isLoading: pivotChangeMutation.isPending,
    
    // Actions
    openPivotChangeDialog,
    handleCloseDialog,
    updateExchangeRate,
    handleSubmitPivotChange,
    validateExchangeRates
  };
}
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePivotChange } from "../_hooks/use-pivot-change";
import { PivotChangeStepperComponent } from "./pivot-change-stepper";

interface PivotChangeDialogProps {
  pivotChangeHook: ReturnType<typeof usePivotChange>;
}

export function PivotChangeDialog({ pivotChangeHook }: PivotChangeDialogProps) {
  const { t } = useLanguage();
  const {
    isDialogOpen,
    selectedCurrency,
    allCurrencies,
    isLoading,
    handleCloseDialog,
    handleStepperComplete,
  } = pivotChangeHook;

  console.log('PivotChangeDialog render:', {
    isDialogOpen,
    hasSelectedCurrency: !!selectedCurrency,
    selectedCurrencyName: selectedCurrency?.xdeviseintitule,
    allCurrenciesCount: allCurrencies.length
  });

  if (!selectedCurrency) {
    console.log('PivotChangeDialog: No selected currency, returning null');
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      console.log('Dialog onOpenChange:', open);
      if (!open) handleCloseDialog();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            {t('admin.currencies.changePivotCurrency')}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {t('admin.currencies.changePivotCurrencyDescription')
              .replace('{currency}', selectedCurrency.xdeviseintitule || '')
              .replace('{code}', selectedCurrency.xdevisecodealpha || '')}
          </DialogDescription>
        </DialogHeader>

        <PivotChangeStepperComponent
          selectedCurrency={selectedCurrency}
          allCurrencies={allCurrencies}
          onComplete={handleStepperComplete}
          onCancel={handleCloseDialog}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
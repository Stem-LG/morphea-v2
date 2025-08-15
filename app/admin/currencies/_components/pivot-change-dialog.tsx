"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  AlertTriangle,
  TrendingUp,
  X,
  Save,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePivotChange } from "../_hooks/use-pivot-change";

interface PivotChangeDialogProps {
  pivotChangeHook: ReturnType<typeof usePivotChange>;
}

export function PivotChangeDialog({ pivotChangeHook }: PivotChangeDialogProps) {
  const { t } = useLanguage();
  const {
    isDialogOpen,
    selectedCurrency,
    exchangeRates,
    errors,
    isLoading,
    handleCloseDialog,
    updateExchangeRate,
    handleSubmitPivotChange,
  } = pivotChangeHook;

  if (!selectedCurrency) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
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

        {/* Warning Section */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <p className="text-yellow-400 font-medium">{t('admin.currencies.importantInformation')}</p>
          </div>
          <ul className="text-sm text-gray-300 space-y-1 ml-6">
            <li>• <strong>{selectedCurrency.xdeviseintitule}</strong> will become the new pivot currency with an exchange rate of 1.0</li>
            <li>• All other currencies will be updated with the rates you specify below</li>
            <li>• All exchange rates must be filled before you can proceed</li>
            <li>• Exchange rates must be positive numbers with up to 4 decimal places</li>
          </ul>
        </div>

        {/* New Pivot Currency Display */}
        <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">{t('admin.currencies.newPivotCurrency')}</p>
                <p className="text-white text-lg font-semibold">
                  {selectedCurrency.xdeviseintitule} ({selectedCurrency.xdevisecodealpha})
                </p>
              </div>
            </div>
            <Badge className="px-3 py-1 text-yellow-400 bg-yellow-400/10 border-yellow-400/20">
              Rate: 1.0000
            </Badge>
          </div>
        </div>

        {/* Exchange Rates Form */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <h3 className="text-white font-medium">
              {t('admin.currencies.setExchangeRatesRelativeTo').replace('{code}', selectedCurrency.xdevisecodealpha || '')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
            {exchangeRates.map((rateInput) => (
              <div key={rateInput.currencyId} className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <span className="font-medium">{rateInput.currencyName}</span>
                  <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                    {rateInput.currencyCode}
                  </Badge>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    max="999999.9999"
                    value={rateInput.rate}
                    onChange={(e) => updateExchangeRate(rateInput.currencyId, e.target.value)}
                    className={`bg-morpheus-blue-dark/30 border-slate-600 text-white ${
                      errors[rateInput.currencyId] ? 'border-red-500' : ''
                    }`}
                    placeholder="0.0000"
                  />
                  {errors[rateInput.currencyId] && (
                    <div className="absolute -bottom-5 left-0 text-xs text-red-400">
                      {errors[rateInput.currencyId]}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  1 {selectedCurrency.xdevisecodealpha} = {rateInput.rate || '?'} {rateInput.currencyCode}
                </p>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseDialog}
            disabled={isLoading}
            className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
          >
            <X className="h-4 w-4 mr-2" />
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmitPivotChange}
            disabled={isLoading || exchangeRates.some(rate => !rate.rate.trim())}
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('admin.currencies.updatingPivot')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('admin.currencies.changePivotCurrencyButton')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
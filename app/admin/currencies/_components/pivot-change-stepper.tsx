"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  ArrowRight,
  ArrowLeft,
  Check,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Database } from "@/lib/supabase";

type Currency = Database['morpheus']['Tables']['xdevise']['Row'];

interface ExchangeRateInput {
  currencyId: number;
  currencyName: string;
  currencyCode: string;
  rate: string;
  error?: string;
}

interface PivotChangeStepperProps {
  selectedCurrency: Currency;
  allCurrencies: Currency[];
  onComplete: (rates: Record<number, number>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PivotChangeStepperComponent({ 
  selectedCurrency, 
  allCurrencies, 
  onComplete, 
  onCancel,
  isLoading = false 
}: PivotChangeStepperProps) {
  const { t } = useLanguage();
  
  // Get other currencies (excluding the new pivot)
  const otherCurrencies = allCurrencies.filter(c => c.xdeviseid !== selectedCurrency.xdeviseid);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [exchangeRates, setExchangeRates] = useState<Record<number, ExchangeRateInput>>(() => {
    const initialRates: Record<number, ExchangeRateInput> = {};
    otherCurrencies.forEach(currency => {
      initialRates[currency.xdeviseid] = {
        currencyId: currency.xdeviseid,
        currencyName: currency.xdeviseintitule || '',
        currencyCode: currency.xdevisecodealpha || '',
        rate: currency.xtauxechange?.toString() || '1.0'
      };
    });
    return initialRates;
  });

  const totalSteps = otherCurrencies.length;
  const currentCurrency = otherCurrencies[currentStep];
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 100;

  const validateCurrentRate = (): boolean => {
    if (!currentCurrency) return true;
    
    const currentRate = exchangeRates[currentCurrency.xdeviseid];
    const rate = currentRate.rate.trim();
    
    if (!rate) {
      setExchangeRates(prev => ({
        ...prev,
        [currentCurrency.xdeviseid]: {
          ...prev[currentCurrency.xdeviseid],
          error: t('admin.currencies.exchangeRateRequired')
        }
      }));
      return false;
    }

    const numericRate = parseFloat(rate);
    if (isNaN(numericRate) || numericRate <= 0) {
      setExchangeRates(prev => ({
        ...prev,
        [currentCurrency.xdeviseid]: {
          ...prev[currentCurrency.xdeviseid],
          error: t('admin.currencies.exchangeRatePositive')
        }
      }));
      return false;
    }

    const decimalPlaces = (rate.split('.')[1] || '').length;
    if (decimalPlaces > 10) {
      setExchangeRates(prev => ({
        ...prev,
        [currentCurrency.xdeviseid]: {
          ...prev[currentCurrency.xdeviseid],
          error: t('admin.currencies.exchangeRateMaxDecimals')
        }
      }));
      return false;
    }

    // Clear error if validation passes
    setExchangeRates(prev => ({
      ...prev,
      [currentCurrency.xdeviseid]: {
        ...prev[currentCurrency.xdeviseid],
        error: undefined
      }
    }));

    return true;
  };

  const updateCurrentRate = (value: string) => {
    if (!currentCurrency) return;
    
    setExchangeRates(prev => ({
      ...prev,
      [currentCurrency.xdeviseid]: {
        ...prev[currentCurrency.xdeviseid],
        rate: value,
        error: undefined // Clear error when user types
      }
    }));
  };

  const handleNext = () => {
    if (!validateCurrentRate()) return;
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - validate all rates and complete
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Validate all rates one more time
    let allValid = true;
    const finalRates: Record<number, number> = {};
    
    Object.values(exchangeRates).forEach(rateInput => {
      const rate = rateInput.rate.trim();
      const numericRate = parseFloat(rate);
      
      if (!rate || isNaN(numericRate) || numericRate <= 0) {
        allValid = false;
        return;
      }
      
      finalRates[rateInput.currencyId] = numericRate;
    });

    if (allValid) {
      onComplete(finalRates);
    }
  };

  const isLastStep = currentStep === totalSteps - 1;
  const currentRateData = currentCurrency ? exchangeRates[currentCurrency.xdeviseid] : null;

  if (totalSteps === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Star className="h-12 w-12 text-yellow-400 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No Other Currencies
        </h3>
        <p className="text-gray-300 mb-4">
          There are no other currencies to set exchange rates for.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onCancel} variant="outline" className="border-slate-600 text-gray-300">
            Cancel
          </Button>
          <Button onClick={() => onComplete({})} className="bg-yellow-600 hover:bg-yellow-700">
            <Star className="h-4 w-4 mr-2" />
            Set as Pivot
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">
              Set Exchange Rates
            </h3>
            <p className="text-gray-300 text-sm">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
          <Badge className="px-3 py-1 text-yellow-400 bg-yellow-400/10 border-yellow-400/20">
            {Math.round(progress)}% Complete
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>

      {/* New Pivot Currency Display */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-medium">New Pivot Currency</p>
              <p className="text-white text-lg font-semibold">
                {selectedCurrency.xdeviseintitule} ({selectedCurrency.xdevisecodealpha})
              </p>
              <p className="text-sm text-gray-300">Exchange Rate: 1.0000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {currentCurrency && currentRateData && (
        <Card className="bg-morpheus-blue-dark/40 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Set Rate for {currentRateData.currencyName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="text-yellow-400 bg-yellow-400/10 border-yellow-400/20">
                {selectedCurrency.xdevisecodealpha}
              </Badge>
              <span className="text-gray-300">→</span>
              <Badge variant="outline" className="text-gray-400 border-gray-600">
                {currentRateData.currencyCode}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">
                Exchange Rate *
              </Label>
              <Input
                type="number"
                step="0.0000000001"
                min="0.0000000001"
                value={currentRateData.rate}
                onChange={(e) => updateCurrentRate(e.target.value)}
                className={`bg-morpheus-blue-dark/30 border-slate-600 text-white ${
                  currentRateData.error ? 'border-red-500' : ''
                }`}
                placeholder="1.0000000000"
                autoFocus
              />
              {currentRateData.error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {currentRateData.error}
                </div>
              )}
              <p className="text-xs text-gray-400">
                1 {selectedCurrency.xdevisecodealpha} = {currentRateData.rate || '?'} {currentRateData.currencyCode}
              </p>
            </div>

            {/* Example calculation */}
            {currentRateData.rate && !currentRateData.error && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm font-medium mb-1">Example:</p>
                <p className="text-gray-300 text-sm">
                  100 {selectedCurrency.xdevisecodealpha} = {(parseFloat(currentRateData.rate) * 100).toFixed(4)} {currentRateData.currencyCode}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          disabled={isLoading}
          className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={isLoading || (currentRateData?.error !== undefined)}
          className={`${
            isLastStep
              ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
          } text-white`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : isLastStep ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Complete & Set Pivot
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Summary at bottom for last step */}
      {isLastStep && (
        <Card className="bg-morpheus-blue-dark/20 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-yellow-400 font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {selectedCurrency.xdeviseintitule} ({selectedCurrency.xdevisecodealpha})
                </span>
                <span className="text-yellow-400">1.0000 (Pivot)</span>
              </div>
              {Object.values(exchangeRates).map((rateData) => (
                <div key={rateData.currencyId} className="flex justify-between items-center py-1">
                  <span className="text-gray-300">
                    {rateData.currencyName} ({rateData.currencyCode})
                  </span>
                  <span className="text-white font-medium">
                    {parseFloat(rateData.rate).toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
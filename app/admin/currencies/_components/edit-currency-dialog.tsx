"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    DollarSign,
    Save,
    X,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
import { useUpdateCurrency } from "../_hooks/use-update-currency";
import { useCurrenciesWithStats } from "../_hooks/use-currencies-with-stats";
import type { Database } from "@/lib/supabase";

type Currency = Database['morpheus']['Tables']['xdevise']['Row'] & {
    yvarprod: { count: number }[]
};

interface CurrencyFormData {
    xdeviseintitule: string;
    xdevisecodealpha: string;
    xdevisecodenum: string;
    xdevisenbrdec: number;
    xdeviseboolautorisepaiement: string;
    xtauxechange: number;
}

interface EditCurrencyDialogProps {
    currency: Currency | null;
    isOpen: boolean;
    onClose: () => void;
}

export function EditCurrencyDialog({ currency, isOpen, onClose }: EditCurrencyDialogProps) {
    const { t } = useLanguage();
    const updateCurrencyMutation = useUpdateCurrency();
    const { data: currencies } = useCurrenciesWithStats();
    
    // Get current pivot currency
    const currentPivotCurrency = currencies?.find(curr => curr.xispivot);
    
    const [formData, setFormData] = useState<CurrencyFormData>({
        xdeviseintitule: "",
        xdevisecodealpha: "",
        xdevisecodenum: "",
        xdevisenbrdec: 2,
        xdeviseboolautorisepaiement: "false",
        xtauxechange: 1.0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when currency changes or dialog opens
    useEffect(() => {
        if (currency && isOpen) {
            setFormData({
                xdeviseintitule: currency.xdeviseintitule || "",
                xdevisecodealpha: currency.xdevisecodealpha || "",
                xdevisecodenum: currency.xdevisecodenum || "",
                xdevisenbrdec: currency.xdevisenbrdec ?? 2,
                xdeviseboolautorisepaiement: currency.xdeviseboolautorisepaiement === "Y" ? "true" : "false",
                xtauxechange: currency.xtauxechange || 1.0
            });
            setErrors({});
        }
    }, [currency, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Required fields
        if (!formData.xdeviseintitule.trim()) {
            newErrors.xdeviseintitule = t('admin.currencies.validationRequired');
        }

        if (!formData.xdevisecodealpha.trim()) {
            newErrors.xdevisecodealpha = t('admin.currencies.validationRequired');
        } else if (formData.xdevisecodealpha.length !== 3) {
            newErrors.xdevisecodealpha = t('admin.currencies.validationAlphaCode');
        }

        if (!formData.xdevisecodenum.trim()) {
            newErrors.xdevisecodenum = t('admin.currencies.validationRequired');
        } else if (!/^\d{3}$/.test(formData.xdevisecodenum)) {
            newErrors.xdevisecodenum = t('admin.currencies.validationNumericCode');
        }

        if (formData.xdevisenbrdec < 0 || formData.xdevisenbrdec > 4) {
            newErrors.xdevisenbrdec = t('admin.currencies.validationDecimalPlaces');
        }

        if (formData.xtauxechange <= 0) {
            newErrors.xtauxechange = t('admin.currencies.validationExchangeRate');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currency || !validateForm()) {
            return;
        }

        try {
            await updateCurrencyMutation.mutateAsync({
                currencyId: currency.xdeviseid,
                updates: formData
            });
            onClose();
        } catch {
            // Error handling is done by the mutation hook
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!currency) return null;

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-morpheus-blue-dark/95 to-morpheus-blue-light/95 border-slate-700/50">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-morpheus-gold-light" />
                        {t('admin.currencies.editCurrencyDialog')}
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                        {t('admin.currencies.editCurrencyDialogDescription')}
                    </DialogDescription>
                </DialogHeader>

                {hasErrors && (
                    <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <p className="text-red-400 font-medium">{t('admin.currencies.formErrors')}</p>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-400">
                            {Object.values(errors).map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Currency Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-morpheus-gold-light" />
                            <h3 className="text-lg font-semibold text-white">
                                {t('admin.currencies.currencyInformation')}
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-300">
                                    {t('admin.currencies.currencyNameRequired')}
                                </Label>
                                <Input
                                    value={formData.xdeviseintitule}
                                    onChange={(e) => setFormData(prev => ({ ...prev, xdeviseintitule: e.target.value }))}
                                    className={`bg-morpheus-blue-dark/30 border-slate-600 text-white ${
                                        errors.xdeviseintitule ? 'border-red-500' : ''
                                    }`}
                                    placeholder={t('admin.currencies.currencyNamePlaceholder')}
                                />
                            </div>
                            
                            <div>
                                <Label className="text-gray-300">
                                    {t('admin.currencies.alphaCodeRequired')}
                                </Label>
                                <Input
                                    value={formData.xdevisecodealpha}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        xdevisecodealpha: e.target.value.toUpperCase() 
                                    }))}
                                    className={`bg-morpheus-blue-dark/30 border-slate-600 text-white ${
                                        errors.xdevisecodealpha ? 'border-red-500' : ''
                                    }`}
                                    placeholder={t('admin.currencies.alphaCodePlaceholder')}
                                    maxLength={3}
                                />
                            </div>
                            
                            <div>
                                <Label className="text-gray-300">
                                    {t('admin.currencies.numericCodeRequired')}
                                </Label>
                                <Input
                                    value={formData.xdevisecodenum}
                                    onChange={(e) => setFormData(prev => ({ ...prev, xdevisecodenum: e.target.value }))}
                                    className={`bg-morpheus-blue-dark/30 border-slate-600 text-white ${
                                        errors.xdevisecodenum ? 'border-red-500' : ''
                                    }`}
                                    placeholder={t('admin.currencies.numericCodePlaceholder')}
                                    maxLength={3}
                                />
                            </div>
                            
                            <div>
                                <Label className="text-gray-300">
                                    {t('admin.currencies.decimalPlacesRequired')}
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="4"
                                    value={formData.xdevisenbrdec}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        xdevisenbrdec: parseInt(e.target.value) || 0 
                                    }))}
                                    className={`bg-morpheus-blue-dark/30 border-slate-600 text-white ${
                                        errors.xdevisenbrdec ? 'border-red-500' : ''
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-600" />

                    {/* Payment Settings Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">
                            {t('admin.currencies.paymentSettings')}
                        </h3>
                        
                        <div className="flex items-center gap-3">
                            <Switch
                                id="allowPayment"
                                checked={formData.xdeviseboolautorisepaiement === "true"}
                                onCheckedChange={(checked) => setFormData(prev => ({
                                    ...prev,
                                    xdeviseboolautorisepaiement: checked ? "true" : "false"
                                }))}
                                className="data-[state=checked]:bg-green-500"
                            />
                            <Label htmlFor="allowPayment" className="text-gray-300">
                                {t('admin.currencies.allowPayments')}
                            </Label>
                        </div>
                    </div>

                    <Separator className="bg-slate-600" />

                    {/* Exchange Rate Settings Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">
                            {t('admin.currencies.exchangeRateSettings')}
                        </h3>
                        
                        <div>
                            <Label className="text-gray-300">
                                1 {currentPivotCurrency?.xdevisecodealpha || 'Pivot'} = {formData.xtauxechange || 1.0} {formData.xdeviseintitule || 'This Currency'}
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                                <TrendingUp className="h-4 w-4 text-blue-400" />
                                <Input
                                    type="number"
                                    step="any"
                                    min="0.0000000001"
                                    value={formData.xtauxechange}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        const maxDecimals = formData.xdevisenbrdec;
                                        
                                        // Check decimal places
                                        const decimalIndex = inputValue.indexOf('.');
                                        const actualDecimals = decimalIndex === -1 ? 0 : inputValue.length - decimalIndex - 1;
                                        
                                        if (actualDecimals <= maxDecimals) {
                                            setFormData(prev => ({
                                                ...prev,
                                                xtauxechange: parseFloat(inputValue) || 1.0
                                            }));
                                        }
                                    }}
                                    className={`bg-morpheus-blue-dark/30 border-slate-600 text-white ${
                                        errors.xtauxechange ? 'border-red-500' : ''
                                    }`}
                                    placeholder={t('admin.currencies.exchangeRatePlaceholder')}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {t('admin.currencies.exchangeRateHelp')}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                        >
                            <X className="h-4 w-4 mr-2" />
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateCurrencyMutation.isPending}
                            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {updateCurrencyMutation.isPending 
                                ? t('admin.currencies.updating') 
                                : t('admin.currencies.updateCurrency')
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}